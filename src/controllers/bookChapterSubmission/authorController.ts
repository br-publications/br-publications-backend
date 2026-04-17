import { Response } from 'express';
import { Op } from 'sequelize';
import BookChapterSubmission, { BookChapterStatus } from '../../models/bookChapterSubmission';
import BookChapterFile, { BookChapterFileType } from '../../models/bookChapterFile';
import BookChapterStatusHistory from '../../models/bookChapterStatusHistory';
import User, { UserRole } from '../../models/user';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendError } from '../../utils/responseHandler';
import { sendDummyEmail } from '../../utils/emailService';
import notificationService from '../../services/notificationService';
import { NotificationType, NotificationCategory } from '../../models/notification';
import BookEditor from '../../models/bookEditor';
import BookTitle from '../../models/bookTitle';
import IndividualChapter, { ChapterStatus } from '../../models/individualChapter';
import ChapterStatusHistory from '../../models/chapterStatusHistory';
import BookChapterReviewerAssignment, { ReviewerAssignmentStatus as SubmissionReviewerStatus } from '../../models/bookChapterReviewerAssignment';
import ChapterReviewerAssignment, { ReviewerAssignmentStatus as ChapterReviewerStatus } from '../../models/chapterReviewerAssignment';
import DeliveryAddress from '../../models/deliveryAddress';

import {
    resolveDisplayBookTitle,
    sendNotificationsForNewSubmission,
    notifyEditorOfFullChapterUpload
} from './commonController';
import { sendBookChapterEditorAssignedEmail, sendBookChapterProofReviewedEmail } from '../../utils/emails/bookChapterEmails';

/**
 * @route POST /api/book-chapters/submit
 * @desc Submit initial book chapter proposal with file upload
 * @access Private (Authenticated users - will be changed to author role)
 */
export const submitBookChapter = async (req: AuthRequest, res: Response) => {
    // Get sequelize from the model
    const sequelize = BookChapterSubmission.sequelize;

    if (!sequelize) {
        return sendError(res, 'Database connection not initialized', 500);
    }
    const transaction = await sequelize.transaction();

    try {
        const user = req.authenticatedUser;

        if (!user) {
            await transaction.rollback();
            return sendError(res, 'User not authenticated', 401);
        }

        // Parse JSON fields from multipart/form-data
        const mainAuthorRaw = JSON.parse(req.body.mainAuthor);

        const coAuthorsRaw = req.body.coAuthors ? JSON.parse(req.body.coAuthors) : null;

        const bookTitle = req.body.bookTitle;
        const bookChapterTitles = JSON.parse(req.body.bookChapterTitles);
        const abstract = req.body.abstract;
        const keywords = JSON.parse(req.body.keywords);
        const selectedEditorId = req.body.selectedEditorId ? parseInt(req.body.selectedEditorId) : null;

        // Explicitly convert isCorrespondingAuthor to boolean to avoid JSONB string truthiness issues
        const mainAuthor = {
            ...mainAuthorRaw,
            isCorrespondingAuthor: mainAuthorRaw.isCorrespondingAuthor === true || mainAuthorRaw.isCorrespondingAuthor === 'true'
        };


        const coAuthors = (coAuthorsRaw && Array.isArray(coAuthorsRaw)) ? coAuthorsRaw.map((author: any) => ({
            ...author,
            isCorrespondingAuthor: author.isCorrespondingAuthor === true || author.isCorrespondingAuthor === 'true'
        })) : null;


        // Get uploaded file from multer (req.file is set by multer middleware)
        const manuscriptFile = req.file;

        // Validate required fields
        if (!mainAuthor || !bookTitle || !bookChapterTitles || !abstract || !keywords) {
            await transaction.rollback();
            return sendError(res, 'All required fields must be provided', 400);
        }

        // Validate bookChapterTitles is array with at least one element
        if (!Array.isArray(bookChapterTitles) || bookChapterTitles.length === 0) {
            await transaction.rollback();
            return sendError(res, 'At least one chapter title must be selected', 400);
        }

        // Validate keywords is array
        if (!Array.isArray(keywords) || keywords.length === 0) {
            await transaction.rollback();
            return sendError(res, 'Keywords must be provided as an array', 400);
        }

        // Validate coAuthors if provided
        if (coAuthors && !Array.isArray(coAuthors)) {
            await transaction.rollback();
            return sendError(res, 'Co-authors must be an array', 400);
        }

        // Validate max 6 co-authors
        if (coAuthors && coAuthors.length > 6) {
            await transaction.rollback();
            return sendError(res, 'Maximum 6 co-authors allowed', 400);
        }

        // Validate only one corresponding author
        let correspondingAuthorCount = mainAuthor.isCorrespondingAuthor ? 1 : 0;
        if (coAuthors) {
            correspondingAuthorCount += coAuthors.filter((a: any) => a.isCorrespondingAuthor).length;
        }

        if (correspondingAuthorCount !== 1) {
            await transaction.rollback();
            return sendError(res, 'Exactly one corresponding author must be selected', 400);
        }



        // STEP 1: Upgrade user role to AUTHOR if currently USER
        if (user.role === UserRole.USER) {

            user.role = UserRole.AUTHOR;
            await user.save({ transaction });
        }

        // STEP 2: Create submission
        const submission = await BookChapterSubmission.create(
            {
                submittedBy: user.id,
                mainAuthor,
                coAuthors: coAuthors || null,
                bookTitle,
                bookChapterTitles,
                abstract,
                keywords,
                status: BookChapterStatus.ABSTRACT_SUBMITTED,
                revisionCount: 0,
                currentRevisionNumber: 0,
                submissionDate: new Date(),
                lastUpdatedBy: user.id,
            },
            { transaction }
        );



        // STEP 3: Create status history
        await BookChapterStatusHistory.create(
            {
                submissionId: submission.id,
                previousStatus: null,
                newStatus: BookChapterStatus.ABSTRACT_SUBMITTED,
                changedBy: user.id,
                action: 'Initial Submission',
                notes: `Submitted by ${mainAuthor.firstName} ${mainAuthor.lastName} `,
                metadata: {
                    bookTitle,
                    chapterCount: bookChapterTitles.length,
                    coAuthorCount: coAuthors?.length || 0,
                    hasManuscript: !!manuscriptFile
                },
            },
            { transaction }
        );

        // STEP 4: Handle manuscript file if provided (from multer)
        if (manuscriptFile) {
            await BookChapterFile.create(
                {
                    submissionId: submission.id,
                    fileType: BookChapterFileType.INITIAL_MANUSCRIPT,
                    fileName: manuscriptFile.originalname,
                    fileData: manuscriptFile.buffer, // Binary data from multer
                    fileSize: manuscriptFile.size,
                    mimeType: manuscriptFile.mimetype,
                    uploadedBy: user.id,
                    isActive: true,
                },
                { transaction }
            );


        }

        // STEP 4.5: Create individual chapters for chapter-centric workflow

        const chapterService = (await import('../../services/chapterService')).default;

        try {
            const chapters = await chapterService.createChaptersFromSubmission(submission, transaction);

        } catch (chapterError: any) {
            console.error('❌ Error creating chapters:', chapterError);
            // Don't fail the entire submission if chapter creation fails
            // This is for backward compatibility
        }


        // STEP 5: Handle editor selection if provided
        if (selectedEditorId) {


            // Find the book title ID from the title string
            const bookTitleRecord = await BookTitle.findOne({
                where: { title: bookTitle },
                transaction
            });

            if (bookTitleRecord) {
                // Validate that the selected editor is assigned to this book title
                const editorAssignment = await BookEditor.findOne({
                    where: {
                        bookTitleId: bookTitleRecord.id,
                        editorId: selectedEditorId
                    },
                    include: [
                        {
                            model: User,
                            as: 'editor',
                            attributes: ['id', 'fullName', 'email']
                        }
                    ],
                    transaction
                });

                if (editorAssignment) {
                    // Valid editor selection - update submission
                    submission.assignedEditorId = selectedEditorId;
                    submission.designatedEditorId = selectedEditorId;
                    await submission.save({ transaction });

                    // Create additional status history for editor assignment
                    await BookChapterStatusHistory.create(
                        {
                            submissionId: submission.id,
                            previousStatus: BookChapterStatus.ABSTRACT_SUBMITTED,
                            newStatus: BookChapterStatus.ABSTRACT_SUBMITTED,
                            changedBy: user.id,
                            action: 'Editor Selected by Author',
                            notes: `Author selected ${(editorAssignment as any).editor.fullName} during submission`,
                            metadata: {
                                editorId: selectedEditorId,
                                editorName: (editorAssignment as any).editor.fullName,
                                selectedByAuthor: true,
                                bookTitleId: bookTitleRecord.id
                            },
                        },
                        { transaction }
                    );



                    // Send notification to editor (async - after commit)
                    const editor = (editorAssignment as any).editor;


                    transaction.afterCommit(async () => {
                        try {

                            await notificationService.createNotification({
                                recipientId: editor.id,
                                senderId: user.id,
                                type: NotificationType.INFO,
                                category: NotificationCategory.SUBMISSION,
                                title: 'New Book Chapter Assignment',
                                message: `You have been selected as editor for book chapter: "${submission.bookTitle}"`,
                                relatedEntityId: submission.id,
                                relatedEntityType: 'BookChapterSubmission',
                            });

                        } catch (err) {
                            console.error('❌ Error creating editor notification:', err);
                        }

                        const resolvedChapterTitles = await submission.getResolvedChapterTitlesString();

                        sendBookChapterEditorAssignedEmail(
                            editor.email,
                            editor.fullName,
                            {
                                authorName: `${mainAuthor.firstName} ${mainAuthor.lastName}`,
                                bookTitle: submission.bookTitle,
                                chapters: resolvedChapterTitles,
                                assignedBy: `${mainAuthor.firstName} ${mainAuthor.lastName}`,
                                submissionId: submission.id,
                                isAuthorSelection: true
                            }
                        ).catch((err: any) => console.error('❌ Error sending editor email:', err));
                    });
                } else {
                    // console.warn('⚠️ Selected editor not assigned to book title, ignoring selection');
                    // Don't fail silently if user specifically selected an editor
                    await transaction.rollback();
                    return sendError(res, 'Selected editor is not authorized for this book title', 400);
                }
            } else {
                // console.warn('⚠️ Book title not found in database, cannot validate editor');
                await transaction.rollback();
                return sendError(res, 'Book title not found for editor validation', 400);
            }
        }

        await transaction.commit();

        // STEP 5: Send notifications (async - don't wait)

        sendNotificationsForNewSubmission(submission, user).catch(err => {
            console.error('❌ Error sending notifications:', err);
        });

        // STEP 6: Return success response
        return sendSuccess(
            res,
            {
                submission: {
                    id: submission.id,
                    status: submission.status,
                    submissionDate: submission.submissionDate,
                    bookTitle: submission.bookTitle,
                    chapters: submission.bookChapterTitles,
                    hasManuscript: !!manuscriptFile
                },
                message: 'Your book chapter has been submitted successfully! You will receive an email once it is assigned to an editor.',
            },
            'Book chapter submitted successfully',
            201
        );
    } catch (error: any) {
        // Only rollback if transaction was started and not yet committed
        if (transaction && !(transaction as any).finished) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Submit book chapter rollback error:', rollbackError);
            }
        }

        console.error('❌ Submit book chapter error:', error);

        if (error.name === 'SequelizeValidationError') {
            const errors: any = {};
            error.errors.forEach((err: any) => {
                errors[err.path] = err.message;
            });
            return sendError(res, 'Validation failed', 400, errors);
        }

        return sendError(res, error.message || 'Failed to submit book chapter', 500);
    }
};

/**
 * @route PUT /api/book-chapters/:id
 * @desc Update submission details (Author only, before reviewers assigned)
 * @access Private (Author)
 */
export const updateSubmission = async (req: AuthRequest, res: Response) => {
    const sequelize = BookChapterSubmission.sequelize;
    if (!sequelize) {
        return sendError(res, 'Database connection not initialized', 500);
    }

    const transaction = await sequelize.transaction();

    try {
        const user = req.authenticatedUser;
        if (!user) {
            await transaction.rollback();
            return sendError(res, 'User not authenticated', 401);
        }

        const submissionId = parseInt(req.params.id);
        if (isNaN(submissionId)) {
            await transaction.rollback();
            return sendError(res, 'Invalid submission ID', 400);
        }

        const submission = await BookChapterSubmission.findByPk(submissionId, { transaction });

        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        // Check permission: Only the submitter can update
        if (submission.submittedBy !== user.id) {
            await transaction.rollback();
            return sendError(res, 'You do not have permission to update this submission', 403);
        }

        // Check status: Only allow updates if no reviewers have been assigned yet
        // Basically INITIAL_SUBMITTED or ASSIGNED_TO_EDITOR
        const allowedStatuses = [
            BookChapterStatus.ABSTRACT_SUBMITTED,
        ];

        if (!allowedStatuses.includes(submission.status)) {
            await transaction.rollback();
            return sendError(res, 'Submission cannot be edited in its current status', 403);
        }

        // Extract updateable fields
        // Assuming body contains JSON data
        const { bookTitle, abstract, keywords, bookChapterTitles, coAuthors, mainAuthor, selectedEditorId } = req.body;

        const previousData = {
            bookTitle: submission.bookTitle,
            abstract: submission.abstract,
        };

        if (bookTitle) submission.bookTitle = bookTitle;
        if (abstract) submission.abstract = abstract;
        if (keywords) submission.keywords = Array.isArray(keywords) ? keywords : submission.keywords;

        // Update Main Author
        if (mainAuthor && typeof mainAuthor === 'object') {
            const parsedMainAuthor = {
                ...mainAuthor,
                isCorrespondingAuthor: mainAuthor.isCorrespondingAuthor === true || mainAuthor.isCorrespondingAuthor === 'true'
            };
            submission.mainAuthor = { ...submission.mainAuthor, ...parsedMainAuthor };
        }

        // Optional updates
        if (bookChapterTitles && Array.isArray(bookChapterTitles) && bookChapterTitles.length > 0) {
            submission.bookChapterTitles = bookChapterTitles;
        }

        if (coAuthors && Array.isArray(coAuthors)) {
            if (coAuthors.length > 6) {
                await transaction.rollback();
                return sendError(res, 'Maximum 6 co-authors allowed', 400);
            }
            submission.coAuthors = coAuthors.map((author: any) => ({
                ...author,
                isCorrespondingAuthor: author.isCorrespondingAuthor === true || author.isCorrespondingAuthor === 'true'
            }));
        }

        if (selectedEditorId !== undefined) {
            const editorIdParsed = selectedEditorId ? parseInt(selectedEditorId) : null;
            submission.assignedEditorId = editorIdParsed;
            submission.designatedEditorId = editorIdParsed;
        }

        submission.lastUpdatedBy = user.id;
        await submission.save({ transaction });

        // Create status history entry for the update
        await BookChapterStatusHistory.create(
            {
                submissionId: submission.id,
                previousStatus: submission.status, // Status doesn't change
                newStatus: submission.status,
                changedBy: user.id,
                action: 'Submission Updated',
                notes: 'Author updated submission details',
                metadata: {
                    updatedFields: Object.keys(req.body),
                    previousTitle: previousData.bookTitle !== submission.bookTitle ? previousData.bookTitle : undefined
                },
            },
            { transaction }
        );

        // STEP 6: Synchronize individual chapters
        try {

            const chapterService = (await import('../../services/chapterService')).default;
            await chapterService.syncChaptersFromSubmission(submission, transaction);
        } catch (chapterError) {
            console.error('❌ Error syncing chapters during update:', chapterError);
            // We don't want to fail the whole update if sync fails for backward compatibility, 
            // but it's important to log it.
        }


        await transaction.commit();

        return sendSuccess(res, submission, 'Submission updated successfully');

    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Update submission rollback error:', rollbackError);
            }
        }
        console.error('❌ Update submission error:', error);
        return sendError(res, 'Failed to update submission', 500);
    }
};

/**
 * @route GET /api/book-chapters/my-submissions
 * @desc Get all submissions by current user
 * @access Private (Author)
 */
export const getMySubmissions = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;

        if (!user) {
            return sendError(res, 'User not authenticated', 401);
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as BookChapterStatus | undefined;

        const offset = (page - 1) * limit;
        const where: any = { submittedBy: user.id };

        if (status) {
            where.status = status;
        }

        const { count, rows: submissions } = await BookChapterSubmission.findAndCountAll({
            where,
            limit,
            offset,
            distinct: true,
            include: [
                {
                    model: User,
                    as: 'assignedEditor',
                    attributes: ['id', 'fullName', 'email'],
                },
                {
                    model: BookChapterFile,
                    as: 'files',
                    where: { isActive: true },
                    required: false,
                    attributes: { exclude: ['fileData'] },
                },
                {
                    model: DeliveryAddress,
                    as: 'deliveryAddress',
                    required: false,
                },
            ],
            order: [['submissionDate', 'DESC']],
        });

        return sendSuccess(
            res,
            {
                submissions,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit),
                },
            },
            'Submissions retrieved successfully'
        );
    } catch (error) {
        console.error('❌ Get my submissions error:', error);
        return sendError(res, 'Failed to retrieve submissions', 500);
    }
};

/**
 * @route POST /api/book-chapters/chapters/:chapterId/upload-manuscript
 * @desc Author uploads manuscript for a specific chapter
 * @access Private (Author)
 */
export const uploadChapterManuscript = async (req: AuthRequest, res: Response) => {
    const { chapterId } = req.params;
    const user = req.authenticatedUser;
    const manuscriptFile = req.file;
    const { customFileName } = req.body;

    if (!user) {
        return sendError(res, 'User not authenticated', 401);
    }

    if (!manuscriptFile) {
        return sendError(res, 'No manuscript file uploaded', 400);
    }

    // Validate file size: must be > 0 and < 10MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (manuscriptFile.size <= 0) {
        return sendError(res, 'File size must be greater than 0 bytes', 400);
    }
    if (manuscriptFile.size > MAX_FILE_SIZE) {
        return sendError(res, 'File size must not exceed 10MB', 400);
    }

    const sequelize = BookChapterSubmission.sequelize;
    if (!sequelize) {
        return sendError(res, 'Database connection error', 500);
    }

    const transaction = await sequelize.transaction();

    try {
        const chapter = await IndividualChapter.findByPk(chapterId, {
            include: [
                {
                    model: BookChapterSubmission,
                    as: 'submission',
                    include: [{ model: IndividualChapter, as: 'individualChapters' }]
                }
            ]
        });

        if (!chapter) {
            await transaction.rollback();
            return sendError(res, 'Chapter not found', 404);
        }

        // Verify ownership (chapter -> submission -> submittedBy)
        const submission = chapter.submission;

        if (!submission || submission.submittedBy !== user.id) {
            await transaction.rollback();
            return sendError(res, 'Not authorized to upload manuscript for this chapter', 403);
        }

        if (submission) {
            // Double check submission ownership
            if (submission.submittedBy !== user.id) {
                await transaction.rollback();
                return sendError(res, 'Not authorized', 403);
            }
        }

        if (!chapter.canUploadManuscript()) {
            await transaction.rollback();
            return sendError(res, `Cannot upload manuscript in current status: ${chapter.status}`, 400);
        }

        // Renaming logic
        // Format: originalName(ChapterTitle).extension
        const originalFileName = customFileName || manuscriptFile.originalname;
        const lastDotIndex = originalFileName.lastIndexOf('.');
        const extension = lastDotIndex !== -1 ? originalFileName.substring(lastDotIndex) : '';
        const nameWithoutExtension = lastDotIndex !== -1 ? originalFileName.substring(0, lastDotIndex) : originalFileName;

        // Clean chapter title for filename (remove special characters that might cause issues)
        const cleanChapterTitle = chapter.chapterTitle
            .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
            .trim();

        const newFileName = `${nameWithoutExtension}(${cleanChapterTitle})${extension}`;

        // Create file record
        const fileRecord = await BookChapterFile.create({
            submissionId: chapter.submissionId,
            uploadedBy: user.id,
            fileName: newFileName,
            fileData: manuscriptFile.buffer, // Use buffer from memory storage
            fileType: BookChapterFileType.INITIAL_MANUSCRIPT,
            fileSize: manuscriptFile.size,
            mimeType: manuscriptFile.mimetype,
            isActive: true,
        }, { transaction });

        // Update chapter
        const previousStatus = chapter.status;
        chapter.manuscriptFileId = fileRecord.id;

        // Determine new status and action
        let newStatus = ChapterStatus.REVIEWER_ASSIGNMENT;
        let actionDescription = 'Manuscript uploaded';
        let isRevision = false;

        if (chapter.status === ChapterStatus.REVISION_REQUESTED || chapter.status === ChapterStatus.ADDITIONAL_REVISION_REQUESTED) {
            newStatus = ChapterStatus.REVISION_SUBMITTED;
            actionDescription = 'Revision uploaded';
            isRevision = true;

            // Find pending revision and update it
            const ChapterRevision = (await import('../../models/chapterRevision')).default;
            const pendingRevision = await ChapterRevision.findOne({
                where: {
                    chapterId: chapter.id,
                    status: 'PENDING'
                },
                transaction
            });

            if (pendingRevision) {
                pendingRevision.fileId = fileRecord.id;
                pendingRevision.submittedDate = new Date();
                pendingRevision.status = 'SUBMITTED';
                await pendingRevision.save({ transaction });
            } else {
                console.warn(`⚠️ No pending revision found for chapter ${chapter.id} despite REVISION_REQUESTED status.`);
            }
        }

        chapter.status = newStatus;

        await chapter.save({ transaction });

        // Create status history
        await ChapterStatusHistory.create({
            chapterId: chapter.id,
            previousStatus,
            newStatus: newStatus,
            changedBy: user.id,
            action: actionDescription,
            metadata: {
                fileId: fileRecord.id,
                originalFileName,
                renamedFileName: newFileName
            },
        }, { transaction });

        // Check if ALL chapters for this submission have manuscripts now
        let allDone = true;
        let notifyEditor = false;

        // Only check for full submission if it's NOT a revision
        if (!isRevision && submission && submission.individualChapters) {
            allDone = submission.individualChapters.every((ch: any) => {
                if (ch.id === chapter.id) return true; // newly uploaded
                return ch.manuscriptFileId !== null;
            });

            if (allDone && submission.status === BookChapterStatus.MANUSCRIPTS_PENDING) {
                submission.status = BookChapterStatus.REVIEWER_ASSIGNMENT;
                submission.lastUpdatedBy = user.id;
                await submission.save({ transaction });

                notifyEditor = true;
            }
        }

        await transaction.commit();

        // Send notifications after commit (Wrapped in try-catch to avoid failing the request if notifications fail)
        // Send notifications after commit
        try {
            const displayBookTitle = await resolveDisplayBookTitle(submission.bookTitle);

            if (notifyEditor && submission.assignedEditorId) {
                await notificationService.createNotification({
                    recipientId: submission.assignedEditorId,
                    type: NotificationType.SUBMISSION_RECEIVED,
                    category: NotificationCategory.SUBMISSION_UPDATE,
                    title: 'Full Submission Received',
                    message: `All chapter manuscripts for "${displayBookTitle}" have been uploaded.`,
                    relatedEntityId: submission.id,
                    relatedEntityType: 'BookChapterSubmission'
                });
            }

            // Send per-chapter notification for initial upload only (NOT for revisions — editor should not be notified for revisions)
            if (!isRevision && submission && submission.assignedEditorId) {
                await notificationService.createNotification({
                    recipientId: submission.assignedEditorId,
                    senderId: user.id,
                    type: NotificationType.INFO,
                    category: NotificationCategory.SUBMISSION,
                    title: 'Chapter Manuscript Uploaded',
                    message: `Author has uploaded the manuscript for chapter "${chapter.chapterTitle}" from submission: "${displayBookTitle}"`,
                    relatedEntityId: chapter.id,
                    relatedEntityType: 'IndividualChapter',
                });
            }

            // IF REVISION: Notify Reviewers ONLY (no editors/admins)
            if (isRevision) {
                const { sendBookChapterRevisionSubmittedToReviewerEmail } = await import('../../utils/emails/bookChapterEmails');

                // 1. Notify the specific person who requested this revision
                const ChapterRevision = (await import('../../models/chapterRevision')).default;
                const revision = await ChapterRevision.findOne({
                    where: { chapterId: chapter.id, status: 'SUBMITTED' },
                    order: [['submittedDate', 'DESC']],
                });

                if (revision && revision.requestedBy) {
                    const requester = await User.findByPk(revision.requestedBy);
                    // Notify whoever requested the revision (reviewer OR editor/admin), as long as they're not the uploader
                    if (requester && requester.id !== user.id) {
                        // In-app notification
                        await notificationService.createNotification({
                            recipientId: requester.id,
                            senderId: user.id,
                            type: NotificationType.INFO,
                            category: NotificationCategory.REVIEW,
                            title: 'Revision Submitted',
                            message: `The revision you requested for chapter "${chapter.chapterTitle}" in "${displayBookTitle}" is now available for review.`,
                            relatedEntityId: chapter.id,
                            relatedEntityType: 'IndividualChapter',
                        }).catch((err: any) => console.error(`❌ Error notifying requester ${requester.id}:`, err));

                        // Email notification
                        await sendBookChapterRevisionSubmittedToReviewerEmail(
                            requester.email,
                            requester.fullName,
                            {
                                authorName: user.fullName,
                                bookTitle: displayBookTitle,
                                chapterTitle: chapter.chapterTitle,
                                revisionNumber: revision.revisionNumber,
                                authorMessage: revision.authorResponse || '',
                                submissionId: submission.id
                            }
                        ).catch(err => console.error(`❌ Error sending revision email to requester ${requester.id}:`, err));
                    } else if (!requester) {
                        console.warn(`⚠️ [REVISION] requestedBy userId ${revision.requestedBy} not found in DB.`);
                    }
                }

                // 2. Notify other assigned reviewers (ACCEPTED or IN_PROGRESS, excluding the requester)
                const reviewers = await ChapterReviewerAssignment.findAll({
                    where: {
                        chapterId: chapter.id,
                        status: { [Op.in]: [ChapterReviewerStatus.ACCEPTED, ChapterReviewerStatus.IN_PROGRESS] },
                        reviewerId: { [Op.ne]: revision?.requestedBy || 0 }
                    }
                });

                for (const reviewerAssignment of reviewers) {
                    const reviewer = await User.findByPk(reviewerAssignment.reviewerId);
                    if (reviewer && reviewer.id !== user.id) {
                        await notificationService.createNotification({
                            recipientId: reviewer.id,
                            senderId: user.id,
                            type: NotificationType.INFO,
                            category: NotificationCategory.REVIEW,
                            title: 'Chapter Revision Uploaded',
                            message: `A revised manuscript for chapter "${chapter.chapterTitle}" in "${displayBookTitle}" is available.`,
                            relatedEntityId: chapter.id,
                            relatedEntityType: 'IndividualChapter',
                        });

                        await sendBookChapterRevisionSubmittedToReviewerEmail(
                            reviewer.email,
                            reviewer.fullName,
                            {
                                authorName: user.fullName,
                                bookTitle: displayBookTitle,
                                chapterTitle: chapter.chapterTitle,
                                revisionNumber: revision?.revisionNumber || 0,
                                authorMessage: revision?.authorResponse || '',
                                submissionId: submission.id
                            }
                        ).catch(err => console.error(`❌ Error sending revision email to reviewer ${reviewer.id}:`, err));
                    }
                }
            }
        } catch (notifError) {
            console.error('⚠️ Error sending notifications after upload (non-critical):', notifError);
        }


        return sendSuccess(res, { chapter }, 'Manuscript uploaded successfully');

    } catch (error: any) {
        if (transaction) await transaction.rollback();
        console.error('Error uploading chapter manuscript:', error);
        return sendError(res, `Failed to upload manuscript: ${error?.message || JSON.stringify(error)}`, 500);
    }
};

/**
 * @route POST /api/book-chapters/:id/upload-full-chapter
 * @desc Author uploads full chapter after editor acceptance
 * @access Private (Author/Admin)
 */
export const uploadFullChapter = async (req: AuthRequest, res: Response) => {
    // Get sequelize from the model
    const sequelize = BookChapterSubmission.sequelize;

    if (!sequelize) {
        return sendError(res, 'Database connection not initialized', 500);
    }

    const transaction = await sequelize.transaction();

    try {
        const user = req.authenticatedUser;
        const submissionId = parseInt(req.params.id);
        const fullChapterFile = req.file; // From multer
        const notes = req.body.notes;

        if (!user) {
            await transaction.rollback();
            return sendError(res, 'User not authenticated', 401);
        }

        if (!fullChapterFile) {
            await transaction.rollback();
            return sendError(res, 'Full chapter file is required', 400);
        }

        // Find submission
        const submission = await BookChapterSubmission.findByPk(submissionId);

        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        // Check permission - only author or admin can upload
        if (submission.submittedBy !== user.id && !user.isAdminOrDeveloper()) {
            await transaction.rollback();
            return sendError(res, 'You do not have permission to upload for this submission', 403);
        }

        // Check if submission is in correct status
        if (submission.status !== BookChapterStatus.MANUSCRIPTS_PENDING) {
            await transaction.rollback();
            return sendError(
                res,
                `Cannot upload full chapter in current status: ${submission.status}. Expected status: FULL_CHAPTER_PENDING`,
                400
            );
        }



        // Deactivate any previous full chapter files
        await BookChapterFile.update(
            { isActive: false },
            {
                where: {
                    submissionId,
                    fileType: BookChapterFileType.FULL_CHAPTER,
                },
                transaction,
            }
        );

        // Create new full chapter file record
        await BookChapterFile.create(
            {
                submissionId,
                fileType: BookChapterFileType.FULL_CHAPTER,
                fileName: fullChapterFile.originalname,
                fileData: fullChapterFile.buffer,
                fileSize: fullChapterFile.size,
                mimeType: fullChapterFile.mimetype,
                uploadedBy: user.id,
                description: notes,
                isActive: true,
            },
            { transaction }
        );

        // Update submission status
        const previousStatus = submission.status;
        submission.status = BookChapterStatus.REVIEWER_ASSIGNMENT;
        submission.lastUpdatedBy = user.id;
        await submission.save({ transaction });

        // Create status history
        await BookChapterStatusHistory.create(
            {
                submissionId,
                previousStatus,
                newStatus: BookChapterStatus.REVIEWER_ASSIGNMENT,
                changedBy: user.id,
                action: 'Full Chapter Uploaded',
                notes: notes || 'Author uploaded full chapter manuscript',
                metadata: {
                    fileName: fullChapterFile.originalname,
                    fileSize: fullChapterFile.size
                }
            },
            { transaction }
        );

        await transaction.commit();



        // Notify editor (async)
        if (submission.assignedEditorId) {
            notifyEditorOfFullChapterUpload(submission, user).catch(err => {
                console.error('❌ Error notifying editor:', err);
            });
        }

        return sendSuccess(
            res,
            {
                submission: {
                    id: submission.id,
                    status: submission.status,
                    bookTitle: submission.bookTitle
                }
            },
            'Full chapter uploaded successfully',
            201
        );
    } catch (error: any) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Upload full chapter rollback error:', rollbackError);
            }
        }
        console.error('❌ Upload full chapter error:', error);
        const detail = error.errors ? ` - ${JSON.stringify(error.errors)}` : '';
        return sendError(res, `Failed to upload full chapter: ${error.message}${detail}`, 500);
    }
};

/**
 * @route POST /api/book-chapters/:id/submit-revision
 * @desc Author submits revised chapter
 * @access Private (Author/Admin)
 */
export const submitRevision = async (req: AuthRequest, res: Response) => {
    // Get sequelize from the model
    const sequelize = BookChapterSubmission.sequelize;

    if (!sequelize) {
        return sendError(res, 'Database connection not initialized', 500);
    }

    const transaction = await sequelize.transaction();

    try {
        const user = req.authenticatedUser;
        const submissionId = parseInt(req.params.id);
        const revisionFile = req.file; // From multer
        const responseNotes = req.body.responseNotes;

        if (!user) {
            await transaction.rollback();
            return sendError(res, 'User not authenticated', 401);
        }

        if (!revisionFile) {
            await transaction.rollback();
            return sendError(res, 'Revision file is required', 400);
        }

        const submission = await BookChapterSubmission.findByPk(submissionId, { transaction });

        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        // Check permission
        if (submission.submittedBy !== user.id && !user.isAdminOrDeveloper()) {
            await transaction.rollback();
            return sendError(res, 'You do not have permission to submit revision for this submission', 403);
        }

        // Check if submission is in correct status
        if (submission.status !== BookChapterStatus.UNDER_REVIEW) {
            await transaction.rollback();
            return sendError(
                res,
                `Cannot submit revision in current status: ${submission.status}. Expected status: REVISION_REQUESTED`,
                400
            );
        }

        // Check if more revisions are allowed
        if (!submission.canRequestRevision()) {
            await transaction.rollback();
            return sendError(res, 'Maximum revision limit (3) has been reached', 400);
        }

        // Increment revision count
        submission.revisionCount += 1;
        submission.currentRevisionNumber = submission.revisionCount;

        // Determine file type based on revision number
        let fileType: BookChapterFileType;
        switch (submission.revisionCount) {
            case 1:
                fileType = BookChapterFileType.REVISION_1;
                break;
            case 2:
                fileType = BookChapterFileType.REVISION_2;
                break;
            case 3:
                fileType = BookChapterFileType.REVISION_3;
                break;
            default:
                await transaction.rollback();
                return sendError(res, 'Invalid revision number. Maximum 3 revisions allowed.', 400);
        }

        // Create new revision file record
        await BookChapterFile.create(
            {
                submissionId,
                fileType,
                fileName: revisionFile.originalname,
                fileData: revisionFile.buffer,
                fileSize: revisionFile.size,
                mimeType: revisionFile.mimetype,
                uploadedBy: user.id,
                description: responseNotes,
                isActive: true,
            },
            { transaction }
        );

        // Update submission status
        const previousStatus = submission.status;
        submission.status = BookChapterStatus.UNDER_REVIEW;
        submission.lastUpdatedBy = user.id;
        await submission.save({ transaction });

        // Create status history
        await BookChapterStatusHistory.create(
            {
                submissionId,
                previousStatus,
                newStatus: BookChapterStatus.UNDER_REVIEW,
                changedBy: user.id,
                action: `Revision ${submission.revisionCount} Submitted`,
                notes: responseNotes || `Author submitted revision ${submission.revisionCount}`,
                metadata: {
                    revisionNumber: submission.revisionCount,
                    fileName: revisionFile.originalname,
                    fileSize: revisionFile.size
                },
            },
            { transaction }
        );

        await transaction.commit();



        // Notify editor and reviewers (async)
        notifyReviewersOfRevision(submission, user).catch(err => {
            console.error('❌ Error notifying reviewers:', err);
        });

        return sendSuccess(
            res,
            {
                submission: {
                    id: submission.id,
                    status: submission.status,
                    revisionCount: submission.revisionCount,
                    bookTitle: submission.bookTitle
                }
            },
            `Revision ${submission.revisionCount} submitted successfully`,
            201
        );
    } catch (error: any) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Submit revision rollback error:', rollbackError);
            }
        }
        console.error('❌ Submit revision error:', error);
        const detail = error.errors ? ` - ${JSON.stringify(error.errors)}` : '';
        return sendError(res, `Failed to submit revision: ${error.message}${detail}`, 500);
    }
};

/**
 * @route DELETE /api/book-chapters/:id
 * @desc Withdraw/Delete submission (Soft delete)
 * @access Private (Author)
 */
export const deleteBookChapterSubmission = async (req: AuthRequest, res: Response) => {
    const sequelize = BookChapterSubmission.sequelize;
    if (!sequelize) {
        return sendError(res, 'Database connection not initialized', 500);
    }

    const transaction = await sequelize.transaction();

    try {
        const user = req.authenticatedUser;
        if (!user) {
            await transaction.rollback();
            return sendError(res, 'User not authenticated', 401);
        }

        const submissionId = parseInt(req.params.id);
        if (isNaN(submissionId)) {
            await transaction.rollback();
            return sendError(res, 'Invalid submission ID', 400);
        }

        const submission = await BookChapterSubmission.findByPk(submissionId, { transaction });

        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        // Check permission: Only the submitter can delete/withdraw
        if (submission.submittedBy !== user.id && !user.isAdminOrDeveloper()) {
            await transaction.rollback();
            return sendError(res, 'You do not have permission to delete this submission', 403);
        }

        // Check status: Only allow withdrawal if not in final stages
        const immutableStatuses = [
            BookChapterStatus.APPROVED,
            BookChapterStatus.PUBLISHED,
            BookChapterStatus.REJECTED,
            BookChapterStatus.REJECTED,
        ];

        if (immutableStatuses.includes(submission.status) && !user.isAdminOrDeveloper()) {
            await transaction.rollback();
            return sendError(res, 'Submission cannot be deleted in its current status', 400);
        }

        // Perform Soft Delete (Withdraw)
        const previousStatus = submission.status;

        // Cancel active reviewer assignments
        await BookChapterReviewerAssignment.update(
            {
                status: SubmissionReviewerStatus.DECLINED,
                confidentialNotes: 'System: Automatically declined due to submission withdrawal'
            },
            {
                where: {
                    submissionId: submission.id,
                    status: {
                        [Op.in]: [
                            SubmissionReviewerStatus.PENDING,
                            SubmissionReviewerStatus.ACCEPTED,
                            SubmissionReviewerStatus.IN_PROGRESS
                        ]
                    }
                },
                transaction
            }
        );

        // Update status to WITHDRAWN
        submission.status = BookChapterStatus.REJECTED;
        submission.lastUpdatedBy = user.id;
        await submission.save({ transaction });

        // Create status history
        await BookChapterStatusHistory.create(
            {
                submissionId: submission.id,
                previousStatus: previousStatus,
                newStatus: BookChapterStatus.REJECTED,
                changedBy: user.id,
                action: 'Submission Withdrawn',
                notes: 'Author withdrew the submission',
            },
            { transaction }
        );

        await transaction.commit();

        return sendSuccess(res, null, 'Submission withdrawn successfully');

    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Delete submission rollback error:', rollbackError);
            }
        }
        console.error('❌ Delete submission error:', error);
        return sendError(res, 'Failed to delete submission', 500);
    }
};


// Helper (local to this file as it's specific to revision submission)
async function notifyReviewersOfRevision(submission: BookChapterSubmission, author: User) {
    // Logic to notify reviewers
    // Similar to what was in the original controller, or simplified
    try {
        const displayBookTitle = await resolveDisplayBookTitle(submission.bookTitle);
        const { sendBookChapterRevisionSubmittedToReviewerEmail } = await import('../../utils/emails/bookChapterEmails');

        const assignments = await BookChapterReviewerAssignment.findAll({
            where: {
                submissionId: submission.id,
                status: { [Op.in]: [SubmissionReviewerStatus.ACCEPTED, SubmissionReviewerStatus.IN_PROGRESS] }
            },
            include: [{ model: User, as: 'reviewer' }]
        });

        await Promise.all(assignments.map(async (assignment) => {
            const reviewer = (assignment as any).reviewer;
            // Notify reviewer
            await notificationService.createNotification({
                recipientId: reviewer.id,
                type: NotificationType.INFO,
                category: NotificationCategory.REVIEW,
                title: 'Revision Submitted',
                message: `Author has submitted a revision for "${displayBookTitle}".`,
                relatedEntityId: submission.id,
                relatedEntityType: 'BookChapterSubmission'
            }).catch(err => console.error(`❌ Error sending revision app notification to reviewer ${reviewer.id}:`, err));

            await sendBookChapterRevisionSubmittedToReviewerEmail(
                reviewer.email,
                reviewer.fullName,
                {
                    authorName: author.fullName,
                    bookTitle: displayBookTitle,
                    chapterTitle: 'Full Manuscript', // Since this is a Book-level revision
                    revisionNumber: submission.revisionCount,
                    submissionId: submission.id
                }
            ).catch(err => console.error(`❌ Error sending revision email to reviewer ${reviewer.id}:`, err));
        }));

        // Notify Editor
        if (submission.assignedEditorId) {
            const editor = await User.findByPk(submission.assignedEditorId);
            if (editor) {
                await notificationService.createNotification({
                    recipientId: editor.id,
                    type: NotificationType.INFO,
                    category: NotificationCategory.SUBMISSION,
                    title: 'Revision Submitted',
                    message: `Author has submitted a revision for "${displayBookTitle}".`,
                    relatedEntityId: submission.id,
                    relatedEntityType: 'BookChapterSubmission'
                });

                await sendDummyEmail({
                    to: editor.email,
                    subject: 'Revision Submitted by Author',
                    template: 'revision-submitted-editor', // assumption
                    data: {
                        editorName: editor.fullName,
                        submissionId: submission.id,
                        bookTitle: displayBookTitle,
                        revisionNumber: submission.revisionCount,
                        authorName: author.fullName
                    }
                });
            }
        }

    } catch (error) {
        console.error("Error notifying reviewers of revision", error);
    }
}

/**
 * @route POST /api/book-chapters/:id/review-proof
 * @desc Author accepts or rejects the proof
 * @access Private (Author)
 */
export const reviewProof = async (req: AuthRequest, res: Response) => {
    const sequelize = BookChapterSubmission.sequelize;
    if (!sequelize) return sendError(res, 'Database connection not initialized', 500);

    const transaction = await sequelize.transaction();
    try {
        const user = req.authenticatedUser;
        const submissionId = parseInt(req.params.id);
        const { decision, notes } = req.body; // 'accept' | 'reject'

        if (!user) {
            await transaction.rollback();
            return sendError(res, 'Authentication required', 401);
        }

        if (!decision || !['accept', 'reject'].includes(decision)) {
            await transaction.rollback();
            return sendError(res, 'Decision must be "accept" or "reject"', 400);
        }

        const submission = await BookChapterSubmission.findByPk(submissionId, { transaction });
        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        if (submission.submittedBy !== user.id) {
            await transaction.rollback();
            return sendError(res, 'You are not the owner of this submission', 403);
        }

        if (submission.proofStatus !== 'SENT') {
            await transaction.rollback();
            return sendError(res, 'No proof is currently pending review', 400);
        }

        submission.proofStatus = decision === 'accept' ? 'ACCEPTED' : 'REJECTED';
        submission.authorProofNotes = notes || null;
        submission.lastUpdatedBy = user.id;
        await submission.save({ transaction });

        await BookChapterStatusHistory.create({
            submissionId: submission.id,
            previousStatus: submission.status,
            newStatus: submission.status,
            changedBy: user.id,
            action: decision === 'accept' ? 'Proof Accepted' : 'Proof Rejected',
            notes: notes || `Author ${decision}ed the proof`,
            metadata: { decision },
        }, { transaction });

        await transaction.commit();

        // Notify editor
        if (submission.assignedEditorId) {
            const displayBookTitle = await resolveDisplayBookTitle(submission.bookTitle);
            notificationService.createNotification({
                recipientId: submission.assignedEditorId,
                senderId: user.id,
                type: decision === 'accept' ? NotificationType.SUCCESS : NotificationType.WARNING,
                category: NotificationCategory.SUBMISSION,
                title: decision === 'accept' ? 'Proof Accepted' : 'Proof Rejected',
                message: `The author has ${decision}ed the proof for "${displayBookTitle}".${decision === 'reject' ? ` Reason: ${notes}` : ''}`,
                relatedEntityId: submission.id,
                relatedEntityType: 'BookChapterSubmission',
            }).catch(console.error);

            try {
                const editor = await User.findByPk(submission.assignedEditorId);
                if (editor && editor.email) {
                    await sendBookChapterProofReviewedEmail(
                        editor.email,
                        editor.fullName,
                        {
                            bookTitle: displayBookTitle,
                            decision: decision === 'accept' ? 'ACCEPTED' : 'REJECTED',
                            authorProofNotes: notes || 'No additional notes provided.',
                            submissionId: submission.id
                        }
                    );
                }
            } catch (emailError) {
                console.error('❌ Error sending proof reviewed email:', emailError);
            }
        }

        return sendSuccess(res, submission, `Proof ${decision}ed successfully`);
    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Review proof rollback error:', rollbackError);
            }
        }
        console.error('❌ Review proof error:', error);
        return sendError(res, 'Failed to process proof review', 500);
    }
};
