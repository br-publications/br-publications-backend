import { Response } from 'express';
import { Op, Sequelize } from 'sequelize';
import BookChapterSubmission, { BookChapterStatus } from '../../models/bookChapterSubmission';
import BookChapterStatusHistory from '../../models/bookChapterStatusHistory';
import BookChapterReviewerAssignment from '../../models/bookChapterReviewerAssignment';
import User, { UserRole } from '../../models/user';
import ChapterReviewerAssignment from '../../models/chapterReviewerAssignment';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendError } from '../../utils/responseHandler';
import {
    sendBookChapterSubmissionReceivedEmail,
    sendBookChapterSubmissionAdminEmail,
    sendBookChapterStatusChangedEmail
} from '../../utils/emails/bookChapterEmails';
import { BookChapterDiscussion } from '../../models/bookChapterDiscussion';
import notificationService from '../../services/notificationService';
import { NotificationType, NotificationCategory } from '../../models/notification';
import BookChapterFile from '../../models/bookChapterFile';
import IndividualChapter, { ChapterStatus } from '../../models/individualChapter';
import ChapterStatusHistory from '../../models/chapterStatusHistory';
import BookTitle from '../../models/bookTitle';
import DeliveryAddress from '../../models/deliveryAddress';

// Helper to resolve book title for display (e.g. in notifications)
export async function resolveDisplayBookTitle(bookTitle: string): Promise<string> {
    const bookId = parseInt(bookTitle);
    if (!isNaN(bookId) && bookTitle.trim() === bookId.toString()) {
        try {
            const bookTitleRecord = await BookTitle.findByPk(bookId);
            if (bookTitleRecord) {
                return bookTitleRecord.title;
            }
        } catch (err) {
            console.error('Failed to resolve book title for display:', err);
        }
    }
    return bookTitle;
}

// Helper function for new submission notifications
export async function sendNotificationsForNewSubmission(
    submission: BookChapterSubmission,
    author: User
) {
    try {
        const admins = await User.findAll({
            where: {
                role: UserRole.ADMIN,
                isActive: true,
            },
        });

        const mainAuthorName = submission.getMainAuthorName();
        const mainAuthor = submission.mainAuthor;

        // Resolve book title for notification if it's a numeric ID
        const displayBookTitle = await resolveDisplayBookTitle(submission.bookTitle);

        // Resolve chapter titles for email
        const resolvedChapterTitles = await submission.getResolvedChapterTitlesString();

        // Email to author (submitter)
        sendBookChapterSubmissionReceivedEmail(
            author.email,
            author.fullName,
            {
                bookTitle: displayBookTitle,
                chapters: resolvedChapterTitles,
                submissionDate: submission.submissionDate,
                submissionId: submission.id
            }
        ).catch((err: any) => console.error('Error emailing author:', err));

        // Get corresponding author email
        const correspondingAuthor = submission.getCorrespondingAuthor();
        const correspondingAuthorEmail = correspondingAuthor?.email;
        const correspondingAuthorName = `${correspondingAuthor?.firstName} ${correspondingAuthor?.lastName}`;

        // Send email to corresponding author if different from submitter
        if (correspondingAuthorEmail && correspondingAuthorEmail !== author.email) {
            sendBookChapterSubmissionReceivedEmail(
                correspondingAuthorEmail,
                correspondingAuthorName,
                {
                    bookTitle: displayBookTitle,
                    chapters: resolvedChapterTitles,
                    submissionDate: submission.submissionDate,
                    submissionId: submission.id
                }
            ).catch((err: any) => console.error('Error emailing corresponding author:', err));
        }

        // In-app notification to author
        await notificationService.createNotification({
            recipientId: author.id,
            senderId: author.id,
            type: NotificationType.SUCCESS,
            category: NotificationCategory.SUBMISSION,
            title: 'Abstract Submission Received',
            message: `Your abstract for "${displayBookTitle}" has been successfully submitted and is awaiting editorial review.`,
            relatedEntityId: submission.id,
            relatedEntityType: 'BookChapterSubmission',
        });


        // Email to all admins

        for (const admin of admins) {
            try {
                // In-app notification
                await notificationService.createNotification({
                    recipientId: admin.id,
                    senderId: submission.submittedBy,
                    type: NotificationType.INFO,
                    category: NotificationCategory.SUBMISSION,
                    title: 'New Book Chapter Submission',
                    message: `${mainAuthorName} has submitted a new book chapter: "${displayBookTitle}"`,
                    relatedEntityId: submission.id,
                    relatedEntityType: 'BookChapterSubmission',
                });

            } catch (notifErr) {
                console.error(`❌ Error creating notification for admin ${admin.id}: `, notifErr);
            }

            sendBookChapterSubmissionAdminEmail(
                admin.email,
                admin.fullName,
                {
                    authorName: mainAuthorName,
                    bookTitle: displayBookTitle,
                    chapters: resolvedChapterTitles,
                    submissionDate: submission.submissionDate,
                    submissionId: submission.id
                }
            ).catch((err: any) => console.error(`Error emailing admin ${admin.id}:`, err));
        }


    } catch (error) {
        console.error('❌ Error sending notifications:', error);
    }
}

// Helper notification functions
export async function notifyEditorOfFullChapterUpload(submission: BookChapterSubmission, author: User) {
    if (!submission.assignedEditorId) return;

    try {
        const editor = await User.findByPk(submission.assignedEditorId);
        if (!editor) return;

        // Resolve book title for display
        const displayBookTitle = await resolveDisplayBookTitle(submission.bookTitle);

        sendBookChapterStatusChangedEmail(
            editor.email,
            editor.fullName,
            {
                bookTitle: displayBookTitle,
                previousStatus: submission.status,
                newStatus: 'FULL_CHAPTER_UPLOADED',
                changedBy: author.fullName,
                submissionId: submission.id,
                adminMessage: `Author ${author.fullName} uploaded the full chapter.`
            }
        ).catch((err: any) => console.error('Error emailing editor:', err));

        // In-app notification
        await notificationService.createNotification({
            recipientId: editor.id,
            senderId: author.id,
            type: NotificationType.INFO,
            category: NotificationCategory.SUBMISSION,
            title: 'Full Chapter Uploaded',
            message: `${author.fullName} has uploaded the full chapter for "${displayBookTitle}".`,
            relatedEntityId: submission.id,
            relatedEntityType: 'BookChapterSubmission',
        });

    } catch (error) {
        console.error('❌ Error notifying editor of full chapter upload:', error);
    }
}


/**
 * @route GET /api/book-chapters/:id
 * @desc Get submission details by ID
 * @access Private (Author - own, Editor - assigned, Admin - all)
 */
export const getSubmissionById = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;

        if (!user) {
            return sendError(res, 'User not authenticated', 401);
        }

        const submissionId = parseInt(req.params.id);

        if (isNaN(submissionId)) {
            return sendError(res, 'Invalid submission ID', 400);
        }

        const submission = await BookChapterSubmission.findByPk(submissionId, {
            include: [
                {
                    model: User,
                    as: 'submitter',
                    attributes: ['id', 'fullName', 'email', 'username'],
                },
                {
                    model: User,
                    as: 'assignedEditor',
                    attributes: ['id', 'fullName', 'email'],
                },
                {
                    model: User,
                    as: 'designatedEditor',
                    attributes: ['id', 'fullName', 'email'],
                },
                {
                    model: BookChapterFile,
                    as: 'files',
                    include: [
                        {
                            model: User,
                            as: 'uploader',
                            attributes: ['id', 'fullName'],
                        },
                    ],
                },
                {
                    model: BookChapterReviewerAssignment,
                    as: 'reviewerAssignments',
                    include: [
                        {
                            model: User,
                            as: 'reviewer',
                            attributes: ['id', 'fullName', 'email'],
                        },
                    ],
                },
                {
                    model: IndividualChapter,
                    as: 'individualChapters',
                    include: [
                        {
                            model: ChapterReviewerAssignment,
                            as: 'reviewerAssignments',
                            include: [
                                {
                                    model: User,
                                    as: 'reviewer',
                                    attributes: ['id', 'fullName', 'email']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: DeliveryAddress,
                    as: 'deliveryAddress',
                }
            ],
        });

        if (!submission) {
            return sendError(res, 'Submission not found', 404);
        }

        // Self-Healing Status Check
        // If submission is stuck in UNDER_REVIEW but all chapters are decided, fix it.
        try {
            if (submission.individualChapters && submission.individualChapters.length > 0) {
                const allDecided = submission.individualChapters.every((ch: any) =>
                    ch.status === ChapterStatus.CHAPTER_APPROVED ||
                    ch.status === ChapterStatus.CHAPTER_REJECTED
                );

                // Check if stuck in a non-final state — include ALL post-approval statuses
                const isStuck = ![
                    BookChapterStatus.EDITORIAL_REVIEW,
                    BookChapterStatus.APPROVED,
                    BookChapterStatus.ISBN_APPLIED,
                    BookChapterStatus.PUBLICATION_IN_PROGRESS,
                    BookChapterStatus.PUBLISHED,
                    BookChapterStatus.REJECTED,
                ].includes(submission.status);

                if (allDecided && isStuck) {

                    const oldStatus = submission.status;
                    submission.status = BookChapterStatus.EDITORIAL_REVIEW;
                    await submission.save();

                    // Add history record for transparency
                    await BookChapterStatusHistory.create({
                        submissionId: submission.id,
                        previousStatus: oldStatus,
                        newStatus: BookChapterStatus.EDITORIAL_REVIEW,
                        changedBy: user.id,
                        action: 'System Self-Healing',
                        notes: 'Automatically corrected status mismatch (All chapters decided)',
                    });
                }
            }
        } catch (err) {
            console.error('Self-healing status check failed:', err);
            // Don't fail the request, just log it
        }

        // Check access permissions
        const isOwner = submission.submittedBy === user.id;
        const isAssignedEditor = submission.assignedEditorId === user.id;
        const isAdmin = user.hasRole(UserRole.ADMIN) || user.hasRole(UserRole.DEVELOPER);

        // Check if user is assigned reviewer (Submission Level - deprecated, check chapter level)
        const isReviewer = false; // Old assignedReviewers field removed

        // Check if user is assigned reviewer (Chapter Level)
        let isChapterReviewer = false;
        if (!isReviewer) {
            const chapterAssignment = await ChapterReviewerAssignment.findOne({
                where: { reviewerId: user.id },
                include: [{
                    model: IndividualChapter,
                    as: 'chapter',
                    where: {
                        submissionId: submissionId
                    },
                    required: true
                }]
            });
            isChapterReviewer = !!chapterAssignment;
        }

        if (!isOwner && !isAssignedEditor && !isAdmin && !isReviewer && !isChapterReviewer) {
            return sendError(res, 'You do not have permission to view this submission', 403);
        }

        return sendSuccess(res, submission, 'Submission retrieved successfully');
    } catch (error) {
        console.error('❌ Get submission error:', error);
        return sendError(res, 'Failed to retrieve submission', 500);
    }
};

/**
 * @route GET /api/book-chapters/:id/history
 * @desc Get submission status history
 * @access Private (Author - limited, Admin/Editor - full)
 */
export const getSubmissionHistory = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;

        if (!user) {
            return sendError(res, 'User not authenticated', 401);
        }

        const submissionId = parseInt(req.params.id);

        if (isNaN(submissionId)) {
            return sendError(res, 'Invalid submission ID', 400);
        }

        const submission = await BookChapterSubmission.findByPk(submissionId);

        if (!submission) {
            return sendError(res, 'Submission not found', 404);
        }

        // Check access
        const isOwner = submission.submittedBy === user.id;
        const isAssignedEditor = submission.assignedEditorId === user.id;
        const isAdmin = user.hasRole(UserRole.ADMIN) || user.hasRole(UserRole.DEVELOPER);

        // Check if user is an assigned reviewer (Submission Level)
        const reviewerAssignment = await BookChapterReviewerAssignment.findOne({
            where: {
                submissionId: submission.id,
                reviewerId: user.id
            }
        });

        // Check if user is an assigned reviewer (Chapter Level)
        const ChapterReviewerAssignmentModel = (await import('../../models/chapterReviewerAssignment')).default;
        const chapterReviewerAssignment = await ChapterReviewerAssignmentModel.findOne({
            where: {
                reviewerId: user.id,
            },
            include: [{
                model: IndividualChapter,
                as: 'chapter',
                where: {
                    submissionId: submission.id
                },
                required: true
            }]
        });

        const isAssignedReviewer = !!reviewerAssignment || !!chapterReviewerAssignment;

        if (!isOwner && !isAssignedEditor && !isAdmin && !isAssignedReviewer) {
            return sendError(res, 'You do not have permission to view this history', 403);
        }

        const history = await BookChapterStatusHistory.findAll({
            where: { submissionId },
            include: [
                {
                    model: User,
                    as: 'changedByUser',
                    attributes: ['id', 'fullName', 'role'],
                },
            ],
            order: [['changedAt', 'DESC']],
        });

        // Fetch Chapter History
        const chapterHistory = await ChapterStatusHistory.findAll({
            include: [
                {
                    model: IndividualChapter,
                    as: 'chapter',
                    where: { submissionId },
                    attributes: ['id', 'chapterTitle', 'chapterNumber'],
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'fullName', 'role'],
                },
            ],
            order: [['timestamp', 'DESC']],
        });

        // Normalize and merge history
        const normalizedSubmissionHistory = history.map(h => {
            const json = h.toJSON() as any;
            return {
                ...json,
                historyType: 'submission',
                changedByUser: json.changedByUser // Ensure it's carried over if needed, though toJSON usually includes it
            };
        });

        const normalizedChapterHistory = chapterHistory.map(h => {
            const json = h.toJSON() as any;
            return {
                ...json,
                historyType: 'chapter',
                // Map relevant fields to match SubmissionHistory
                changedByUser: json.user,
                newStatus: json.newStatus,
                changedAt: json.timestamp
            };
        });

        const combinedHistory = [...normalizedSubmissionHistory, ...normalizedChapterHistory].sort((a, b) => {
            return new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime();
        });

        return sendSuccess(res, combinedHistory, 'History retrieved successfully');
    } catch (error) {
        console.error('❌ Get submission history error:', error);
        return sendError(res, 'Failed to retrieve history', 500);
    }
};

/**
 * @route GET /api/book-chapters/:id/files
 * @desc Get all active files for a submission
 * @access Private (Author - own, Editor - assigned, Admin - all, Reviewer - assigned)
 */
export const getSubmissionFiles = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;
        if (!user) {
            return sendError(res, 'User not authenticated', 401);
        }

        const submissionId = parseInt(req.params.id);
        if (isNaN(submissionId)) {
            return sendError(res, 'Invalid submission ID', 400);
        }

        const submission = await BookChapterSubmission.findByPk(submissionId);
        if (!submission) {
            return sendError(res, 'Submission not found', 404);
        }

        // Permission checks
        const isOwner = submission.submittedBy === user.id;
        const isAssignedEditor = submission.assignedEditorId === user.id;
        const isAdmin = user.hasRole(UserRole.ADMIN) || user.hasRole(UserRole.DEVELOPER);

        // Check if user is assigned reviewer (Chapter Level)
        let isChapterReviewer = false;
        try {
            const ChapterReviewerAssignmentModel = (await import('../../models/chapterReviewerAssignment')).default;
            const chapterAssignment = await ChapterReviewerAssignmentModel.findOne({
                where: { reviewerId: user.id },
                include: [{
                    model: IndividualChapter,
                    as: 'chapter',
                    where: {
                        submissionId: submissionId
                    },
                    required: true
                }]
            });
            isChapterReviewer = !!chapterAssignment;
        } catch (e) { /* ignore */ }

        if (!isOwner && !isAssignedEditor && !isAdmin && !isChapterReviewer) {
            return sendError(res, 'You do not have permission to view these files', 403);
        }

        const files = await BookChapterFile.findAll({
            where: {
                submissionId,
                isActive: true
            },
            include: [
                {
                    model: User,
                    as: 'uploader',
                    attributes: ['id', 'fullName'],
                }
            ],
            // Exclude huge binary data from the listing
            attributes: { exclude: ['fileData'] },
            order: [['uploadDate', 'ASC']]
        });

        return sendSuccess(res, files, 'Files retrieved successfully');
    } catch (error) {
        console.error('❌ Get submission files error:', error);
        return sendError(res, 'Failed to retrieve files', 500);
    }
};

/**
 * @route GET /api/book-chapters/:id/discussions
 * @desc Get discussion messages for a submission
 * @access Private
 */
export const getSubmissionDiscussions = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;

        if (!user) {
            return sendError(res, 'User not authenticated', 401);
        }

        const submissionId = parseInt(req.params.id);
        if (isNaN(submissionId)) {
            return sendError(res, 'Invalid submission ID', 400);
        }

        const submission = await BookChapterSubmission.findByPk(submissionId);
        if (!submission) {
            return sendError(res, 'Submission not found', 404);
        }

        // Check access permissions
        const isOwner = submission.submittedBy === user.id;
        const isAssignedEditor = submission.assignedEditorId === user.id;
        const isAdmin = user.hasRole(UserRole.ADMIN) || user.hasRole(UserRole.DEVELOPER);
        // Check if user is a chapter-level reviewer for this submission
        let isReviewer = false;
        try {
            const ChapterReviewerAssignmentModel = (await import('../../models/chapterReviewerAssignment')).default;
            const chapterAssignment = await ChapterReviewerAssignmentModel.findOne({
                where: { reviewerId: user.id },
                include: [{
                    model: IndividualChapter,
                    as: 'chapter',
                    where: { submissionId: submissionId },
                    required: true
                }]
            });
            isReviewer = !!chapterAssignment;
        } catch (e) { /* ignore */ }

        if (!isOwner && !isAssignedEditor && !isAdmin && !isReviewer) {
            return sendError(res, 'You do not have permission to view these discussions', 403);
        }

        const whereClause: any = { submissionId };

        // Authors cannot see internal notes
        if (isOwner && !isAdmin && !isAssignedEditor && !isReviewer) {
            whereClause.isInternal = false;
        }

        const discussions = await BookChapterDiscussion.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'fullName', 'role', 'profilePicture'],
                },
            ],
            order: [['createdAt', 'ASC']],
        });

        return sendSuccess(res, discussions, 'Discussions retrieved successfully');
    } catch (error) {
        const fs = require('fs');
        const logData = `Error time: ${new Date().toISOString()}\nError: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}\n`;
        fs.appendFileSync('debug_error.log', logData);

        console.error('❌ Get discussions error:', error);
        // Log the actual error for debugging
        if (error instanceof Error) {
            console.error('Stack:', error.stack);
        }
        return sendError(res, 'Failed to get discussions', 500);
    }
};

/**
 * @route POST /api/book-chapters/:id/discussions
 * @desc Post a new discussion message
 * @access Private
 */
export const postSubmissionDiscussion = async (req: AuthRequest, res: Response) => {
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

        const submissionId = parseInt(req.params.id);
        const { message, isInternal } = req.body;

        if (isNaN(submissionId) || !message?.trim()) {
            await transaction.rollback();
            return sendError(res, 'Invalid submission ID or empty message', 400);
        }

        const submission = await BookChapterSubmission.findByPk(submissionId, { transaction });
        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        // Check access permissions
        const isOwner = submission.submittedBy === user.id;
        const isAssignedEditor = submission.assignedEditorId === user.id;
        const isAdmin = user.hasRole(UserRole.ADMIN) || user.hasRole(UserRole.DEVELOPER);
        // Check if user is a chapter-level reviewer for this submission
        let isReviewer = false;
        let isReviewerCompleted = false;
        try {
            const ChapterReviewerAssignmentModel = (await import('../../models/chapterReviewerAssignment')).default;
            const chapterAssignment = await ChapterReviewerAssignmentModel.findOne({
                where: { reviewerId: user.id },
                include: [{
                    model: IndividualChapter,
                    as: 'chapter',
                    where: { submissionId: submissionId },
                    required: true
                }]
            });
            if (chapterAssignment) {
                isReviewer = true;
                if (chapterAssignment.status === 'COMPLETED') {
                    isReviewerCompleted = true;
                }
            }
        } catch (e) { /* ignore */ }

        // If the only role granting them access is Reviewer, and they have already completed it, block them.
        if (!isOwner && !isAssignedEditor && !isAdmin && isReviewer && isReviewerCompleted) {
            await transaction.rollback();
            return sendError(res, 'You cannot post discussions on an assignment you have already completed.', 403);
        }

        if (!isOwner && !isAssignedEditor && !isAdmin && !isReviewer) {
            await transaction.rollback();
            return sendError(res, 'You do not have permission to post discussions here', 403);
        }

        // Only editors/admins can post internal notes
        if (isInternal && !isAssignedEditor && !isAdmin) {
            await transaction.rollback();
            return sendError(res, 'Only editors and admins can post internal notes', 403);
        }

        // Check if discussions are allowed (e.g. not published/rejected)
        // Using loose check, or could use submission.isActive() if implemented
        if (submission.status === BookChapterStatus.PUBLISHED) {
            await transaction.rollback();
            return sendError(res, 'Cannot post discussions on published submissions', 400);
        }

        const discussion = await BookChapterDiscussion.create(
            {
                submissionId,
                userId: user.id,
                message: message.trim(),
                isInternal: !!isInternal,
            },
            { transaction }
        );

        // Fetch created discussion with user info (using separate query to avoid including full user in create return)
        const discussionWithUser = await BookChapterDiscussion.findByPk(discussion.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'fullName', 'role', 'profilePicture']
            }],
            transaction
        });

        await transaction.commit();

        // Send notifications (async)
        const displayBookTitle = await resolveDisplayBookTitle(submission.bookTitle);
        const notificationPromises: Promise<any>[] = [];

        // 1. Notify Admin (always, unless sender is Admin) - Notify all admins
        if (!user.isAdminOrDeveloper()) {
            const admins = await User.findAll({ where: { role: UserRole.ADMIN, isActive: true } });
            admins.forEach(admin => {
                notificationPromises.push(
                    notificationService.createNotification({
                        recipientId: admin.id,
                        senderId: user.id,
                        type: NotificationType.INFO,
                        category: NotificationCategory.DISCUSSION,
                        title: 'New Discussion Message',
                        message: `${user.fullName} posted a message on "${displayBookTitle}"`,
                        relatedEntityId: submission.id,
                        relatedEntityType: 'BookChapterSubmission',
                    })
                );
            });
        }

        // 2. Notify Editor (if assigned & sender != Editor)
        if (submission.assignedEditorId && submission.assignedEditorId !== user.id) {
            notificationPromises.push(
                notificationService.createNotification({
                    recipientId: submission.assignedEditorId,
                    senderId: user.id,
                    type: NotificationType.INFO,
                    category: NotificationCategory.DISCUSSION,
                    title: 'New Discussion Message',
                    message: `${user.fullName} posted a message on "${displayBookTitle}"`,
                    relatedEntityId: submission.id,
                    relatedEntityType: 'BookChapterSubmission',
                })
            );
        }

        // 3. Notify Author (if sender != Author AND !isInternal)
        if (submission.submittedBy !== user.id && !isInternal) {
            notificationPromises.push(
                notificationService.createNotification({
                    recipientId: submission.submittedBy,
                    senderId: user.id,
                    type: NotificationType.INFO,
                    category: NotificationCategory.DISCUSSION,
                    title: 'New Discussion Message',
                    message: `New message on "${displayBookTitle}": ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
                    relatedEntityId: submission.id,
                    relatedEntityType: 'BookChapterSubmission',
                })
            );
        }

        Promise.all(notificationPromises).catch(err => console.error('❌ Error sending discussion notifications:', err));

        return sendSuccess(res, discussionWithUser, 'Message posted successfully', 201);
    } catch (error) {
        // Only rollback if transaction has not been committed
        try {
            await transaction.rollback();
        } catch (rollbackError) {
            // Ignore rollback error if transaction was already committed or closed
            console.warn('Transaction rollback failed (possibly already committed)', rollbackError);
        }

        console.error('❌ Post discussion error:', error);
        return sendError(res, 'Failed to post message', 500);
    }
};

/**
 * @route GET /api/book-chapters/files/:id
 * @desc Download a book chapter file
 * @access Private
 */
export const downloadFile = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;
        const fileId = parseInt(req.params.id);

        if (!user) {
            return sendError(res, 'User not authenticated', 401);
        }

        if (isNaN(fileId)) {
            return sendError(res, 'Invalid file ID', 400);
        }

        const file = await BookChapterFile.findByPk(fileId, {
            include: [
                {
                    model: BookChapterSubmission,
                    as: 'submission',
                    attributes: ['id', 'submittedBy', 'assignedEditorId'],
                },
            ],
        });

        if (!file) {
            return sendError(res, 'File not found', 404);
        }

        const submission = file.submission;

        if (!submission) {
            // Orphaned file?
            return sendError(res, 'File associated submission not found', 404);
        }

        // Permission check
        const isSubmitter = submission.submittedBy === user.id;
        const isEditor = submission.assignedEditorId === user.id;
        const isAdmin = user.hasRole(UserRole.ADMIN) || user.hasRole(UserRole.DEVELOPER);
        // Reviewer check via chapter-level assignments
        let isReviewer = false;
        try {
            const ChapterReviewerAssignmentModel = (await import('../../models/chapterReviewerAssignment')).default;
            const chapterAssignment = await ChapterReviewerAssignmentModel.findOne({
                where: { reviewerId: user.id },
                include: [{
                    model: IndividualChapter,
                    as: 'chapter',
                    where: { submissionId: submission.id },
                    required: true
                }]
            });
            isReviewer = !!chapterAssignment;
        } catch (e) { /* ignore */ }

        if (!isSubmitter && !isEditor && !isAdmin && !isReviewer) {
            return sendError(res, 'You do not have permission to download this file', 403);
        }

        // Set headers
        res.setHeader('Content-Type', file.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
        res.setHeader('Content-Length', file.fileSize);

        // Send file data
        // Assuming fileData is stored as Buffer/BLOB in DB based on BookChapterFile model usage
        res.send(file.fileData);

    } catch (error) {
        console.error('❌ Download file error:', error);
        return sendError(res, 'Failed to download file', 500);
    }
};

/**
 * @route GET /api/book-chapters/by-book-title
 * @desc Get all submissions for a specific book title (admin/editor only)
 *       Used during publication to aggregate all authors across submissions.
 * @access Private (Admin, Editor)
 * @query title - exact book title name OR numeric book title ID
 */
export const getSubmissionsByBookTitle = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;
        if (!user) return sendError(res, 'User not authenticated', 401);

        const { title } = req.query as { title?: string };
        if (!title?.trim()) return sendError(res, 'Book title is required', 400);

        // If title is numeric, treat it as a BookTitle ID and resolve the text title first
        let bookTitleText = title.trim();
        const possibleId = parseInt(bookTitleText);
        if (!isNaN(possibleId) && bookTitleText === possibleId.toString()) {
            const btRecord = await BookTitle.findByPk(possibleId);
            if (btRecord) {
                bookTitleText = btRecord.title;
            }
        }

        // Find all submissions where bookTitle matches the resolved text (case-insensitive)
        // Also match by numeric ID stored as string (legacy)
        const bookTitleRecord = await BookTitle.findOne({
            where: Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('title')),
                bookTitleText.toLowerCase()
            )
        });

        const whereConditions: any[] = [
            // Match by text title
            Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('bookTitle')),
                bookTitleText.toLowerCase()
            ),
        ];

        // Also match by numeric ID if we found a record
        if (bookTitleRecord) {
            whereConditions.push({ bookTitle: bookTitleRecord.id.toString() });
        }

        const submissions = await BookChapterSubmission.findAll({
            where: { [Op.or]: whereConditions },
            include: [
                {
                    model: User,
                    as: 'submitter',
                    attributes: ['id', 'fullName', 'email'],
                },
            ],
            order: [['submissionDate', 'ASC']],
        });

        return sendSuccess(res, { submissions, bookTitle: bookTitleText }, 'Submissions retrieved successfully');
    } catch (error) {
        console.error('❌ getSubmissionsByBookTitle error:', error);
        return sendError(res, 'Failed to retrieve submissions by book title', 500);
    }
};
