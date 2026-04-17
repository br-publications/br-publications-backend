import { Response } from 'express';
import { Op, Sequelize } from 'sequelize';
import TextBookSubmission, { TextBookStatus } from '../models/textBookSubmission';
import PublishedBook, { BookType } from '../models/publishedBook';
import TextBookFile, { TextBookFileType } from '../models/textBookFile';
import TextBookRevision from '../models/textBookRevision';
import TextBookStatusHistory from '../models/textBookStatusHistory';
import TextBookDiscussion from '../models/textBookDiscussion';
import User, { UserRole } from '../models/user';
import DeliveryAddress from '../models/deliveryAddress';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/responseHandler';
import {
    sendTextBookSubmissionAdminEmail,
    sendTextBookDecisionEmail,
    sendTextBookProposalDecisionEmail,
    sendTextBookRevisionRequestedEmail,
    sendTextBookRevisionSubmittedEmail,
    sendTextBookSubmissionReceivedEmail,
    sendTextBookStatusChangedEmail,
    sendTextBookCommentEmail,
    sendTextBookBulkUploadReportEmail,
    sendDeliveryDetailsRequestEmail,
    sendTextBookPublishedEmail
} from '../utils/emailService';

import notificationService from '../services/notificationService';
import { NotificationType, NotificationCategory } from '../models/notification';

/**
 * Helper function to send notification + email
 */
/**
 * Helper function to send notification (DB only)
 */
async function createNotification(
    recipientId: number,
    senderId: number,
    type: NotificationType,
    category: NotificationCategory,
    title: string,
    message: string,
    submissionId: number
) {
    try {
        const notification = await notificationService.createNotification({
            recipientId,
            senderId,
            type,
            category,
            title,
            message,
            relatedEntityId: submissionId,
            relatedEntityType: 'TextBookSubmission'
        });
    } catch (error) {
        console.error('[NotificationTrigger] Error creating notification:', error);
    }
}

/**
 * Helper function to create status history entry
 */
async function createStatusHistory(
    submissionId: number,
    oldStatus: TextBookStatus,
    newStatus: TextBookStatus,
    changedBy: number,
    comments: string | null,
    transaction: any
) {
    await TextBookStatusHistory.create(
        {
            submissionId,
            previousStatus: oldStatus,
            newStatus,
            changedBy,
            notes: comments,
            changedAt: new Date()
        },
        { transaction }
    );
}

/**
 * Helper function to create discussion entry
 */
async function createDiscussion(
    submissionId: number,
    senderId: number,
    message: string,
    transaction: any
) {
    await TextBookDiscussion.create(
        {
            submissionId,
            senderId,
            message
        },
        { transaction }
    );
}

/**
 * @route POST /api/textbooks/submit
 * @desc Submit new text book
 * @access Private (Authenticated users - will be changed to author role)
 */
export const submitTextBook = async (req: AuthRequest, res: Response) => {
    let transaction: any = null;
    try {
        const sequelize = TextBookSubmission.sequelize;
        if (!sequelize) {
            return sendError(res, 'Database connection not initialized', 500);
        }
        transaction = await sequelize.transaction();
        const user = req.authenticatedUser;
        if (!user) {
            await transaction.rollback();
            return sendError(res, 'User not authenticated', 401);
        }

        // Parse JSON fields from multipart/form-data
        const mainAuthor = JSON.parse(req.body.mainAuthor);
        const coAuthors = req.body.coAuthors ? JSON.parse(req.body.coAuthors) : null;
        const bookTitle = req.body.bookTitle;
        const isDirectSubmission = req.body.isDirectSubmission === 'true';
        const isBulkSubmission = req.body.isBulkSubmission === 'true';

        // Get uploaded files
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const contentFile = files?.contentFile?.[0];
        const fullTextFile = files?.fullTextFile?.[0];

        // Validate required fields
        if (!mainAuthor || !mainAuthor.firstName || !bookTitle) {
            console.error(`[Submit-TextBook] Validation failed. bookTitle: ${!!bookTitle}, mainAuthor: ${!!mainAuthor}, firstName: ${mainAuthor?.firstName}`);
            await transaction.rollback();
            return sendError(res, 'At least Author First Name and Book Title are required.', 400);
        }

        // Upgrade user role to AUTHOR if currently USER
        if (user.role === UserRole.USER) {
            user.role = UserRole.AUTHOR;
            await user.save({ transaction });
        }

        // Create submission
        const submission = await TextBookSubmission.create(
            {
                submittedBy: user.id,
                mainAuthor,
                coAuthors,
                bookTitle,
                status: TextBookStatus.INITIAL_SUBMITTED,
                isDirectSubmission,
                isBulkSubmission,
                currentRevisionNumber: 0,
                submissionDate: new Date()
            },
            { transaction }
        );

        // Save files if provided
        if (contentFile) {
            await TextBookFile.create(
                {
                    submissionId: submission.id,
                    fileType: TextBookFileType.CONTENT_FILE,
                    fileName: contentFile.originalname,
                    fileSize: contentFile.size,
                    mimeType: contentFile.mimetype,
                    fileData: contentFile.buffer,
                    uploadedBy: user.id,
                    uploadedAt: new Date()
                },
                { transaction }
            );
        }

        if (fullTextFile) {
            await TextBookFile.create(
                {
                    submissionId: submission.id,
                    fileType: TextBookFileType.FULL_TEXT,
                    fileName: fullTextFile.originalname,
                    fileSize: fullTextFile.size,
                    mimeType: fullTextFile.mimetype,
                    fileData: fullTextFile.buffer,
                    uploadedBy: user.id,
                    uploadedAt: new Date()
                },
                { transaction }
            );
        }

        // Create initial status history
        await createStatusHistory(
            submission.id,
            TextBookStatus.INITIAL_SUBMITTED,
            TextBookStatus.INITIAL_SUBMITTED,
            user.id,
            'Initial submission',
            transaction
        );

        await transaction.commit();

        // Notify all admins about new submission (SKIP for direct/bulk submissions)
        if (!isDirectSubmission && !isBulkSubmission) {
            const admins = await User.findAll({
                where: { role: UserRole.ADMIN, isActive: true }
            });

            for (const admin of admins) {
                // Send DB Notification
                await createNotification(
                    admin.id,
                    user.id,
                    NotificationType.INFO,
                    NotificationCategory.TEXTBOOK_SUBMISSION,
                    'New Text Book Submission',
                    `${mainAuthor.firstName} ${mainAuthor.lastName} submitted a new text book: "${bookTitle}"`,
                    submission.id
                );

                // Send Email
                sendTextBookSubmissionAdminEmail(
                    admin.email,
                    admin.fullName,
                    {
                        bookTitle: bookTitle,
                        authorName: `${mainAuthor.firstName} ${mainAuthor.lastName}`,
                        submissionDate: new Date(),
                        submissionId: submission.id
                    }
                ).catch(err => console.error(`Error emailing admin ${admin.id}:`, err));
            }
        }

        // Send confirmation email to author (SKIP for direct/bulk submissions)
        if (user.email && !isDirectSubmission && !isBulkSubmission) {
            // DB Notification for Author
            await createNotification(
                user.id,
                user.id,
                NotificationType.SUCCESS,
                NotificationCategory.TEXTBOOK_SUBMISSION,
                'Submission Received',
                `Your text book submission "${bookTitle}" has been received.`,
                submission.id
            );

            sendTextBookSubmissionReceivedEmail(
                user.email,
                user.fullName,
                {
                    bookTitle: bookTitle,
                    submissionId: submission.id,
                    submissionDate: submission.submissionDate
                }
            ).catch(err => console.error(`Error emailing author ${user.id}:`, err));
        }

        return sendSuccess(
            res,
            {
                submission: {
                    id: submission.id,
                    status: submission.status,
                    submissionDate: submission.submissionDate,
                    bookTitle: submission.bookTitle
                }
            },
            'Text book submitted successfully',
            201
        );
    } catch (error: any) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Submit text book rollback error:', rollbackError);
            }
        }
        console.error('Submit text book error:', error);
        // Surfacing the detailed error for debugging purposes on the live site
        const detail = error.errors ? ` - ${JSON.stringify(error.errors)}` : '';
        return sendError(res, `Failed to submit text book: ${error.message}${detail}`, 500);
    }
};

/**
 * @route GET /api/textbooks/my-submissions
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
        const status = req.query.status as TextBookStatus | undefined;
        const search = req.query.search as string | undefined;

        const offset = (page - 1) * limit;
        const where: any = { submittedBy: user.id };

        if (status) {
            const statusArray = (status as string).split(',').map(s => s.trim());
            if (statusArray.length > 1) {
                where.status = { [Op.in]: statusArray };
            } else {
                where.status = statusArray[0];
            }
        }

        if (search) {
            where[Op.or] = [
                { bookTitle: { [Op.like]: `%${search}%` } },
                Sequelize.literal(`("mainAuthor"->>'firstName' || ' ' || "mainAuthor"->>'lastName') ILIKE '%${search}%'`),
                Sequelize.literal(`"mainAuthor"->>'email' ILIKE '%${search}%'`),
                { isbnNumber: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: submissions } = await TextBookSubmission.findAndCountAll({
            where,
            limit,
            offset,
            distinct: true,
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'fullName', 'email']
                },
                {
                    model: TextBookFile,
                    as: 'files',
                    attributes: ['id', 'fileType', 'fileName', 'fileSize', 'mimeType', 'revisionNumber', 'uploadedAt']
                },
                {
                    model: TextBookStatusHistory,
                    as: 'statusHistory',
                    include: [
                        {
                            model: User,
                            as: 'changedByUser',
                            attributes: ['id', 'fullName', 'role']
                        }
                    ]
                },
                {
                    model: DeliveryAddress, as: 'deliveryAddress'
                }
            ],
            order: [['submissionDate', 'DESC']]
        });

        return sendSuccess(res, {
            submissions,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get my submissions error:', error);
        return sendError(res, 'Failed to retrieve submissions', 500);
    }
};

/**
 * @route GET /api/textbooks/:id
 * @desc Get submission by ID
 * @access Private (Author or Admin)
 */
export const getSubmissionById = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;
        if (!user) {
            return sendError(res, 'User not authenticated', 401);
        }

        const submissionId = parseInt(req.params.id);

        const submission = await TextBookSubmission.findByPk(submissionId, {
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'fullName', 'email']
                },
                {
                    model: TextBookFile,
                    as: 'files',
                    attributes: ['id', 'fileType', 'fileName', 'fileSize', 'mimeType', 'revisionNumber', 'uploadedAt']
                },
                {
                    model: TextBookRevision,
                    as: 'revisions',
                    include: [
                        {
                            model: User,
                            as: 'submittedByUser',
                            attributes: ['id', 'fullName']
                        }
                    ]
                },
                {
                    model: TextBookStatusHistory,
                    as: 'statusHistory',
                    include: [
                        {
                            model: User,
                            as: 'changedByUser',
                            attributes: ['id', 'fullName', 'role']
                        }
                    ],
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: DeliveryAddress, as: 'deliveryAddress'
                }
            ]
        });

        if (!submission) {
            return sendError(res, 'Submission not found', 404);
        }

        // Check permission
        const isOwner = submission.submittedBy === user.id;
        const isAdmin = user.isAdminOrDeveloper();

        if (!isOwner && !isAdmin) {
            return sendError(res, 'You do not have permission to view this submission', 403);
        }

        return sendSuccess(res, submission);
    } catch (error: any) {
        console.error('Get submission by ID error:', error);
        return sendError(res, 'Failed to retrieve submission', 500);
    }
};

/**
 * @route GET /api/textbooks/admin/submissions
 * @desc Get all submissions (admin only)
 * @access Private (Admin)
 */
export const getAdminSubmissions = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;
        if (!user || !user.isAdminOrDeveloper()) {
            return sendError(res, 'Admin access required', 403);
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as TextBookStatus | undefined;
        const search = req.query.search as string | undefined;
        const showAll = req.query.showAll === 'true';

        const offset = (page - 1) * limit;
        const where: any = {};

        // Hide direct and bulk submissions by default unless showAll is true
        if (showAll) {
            // Include everything
        } else if (req.query.isDirectSubmission === 'true') {
            where.isDirectSubmission = true;
        } else if (req.query.isBulkSubmission === 'true') {
            where.isBulkSubmission = true;
        } else {
            where.isDirectSubmission = false;
            where.isBulkSubmission = false;
        }

        if (status) {
            const statusArray = (status as string).split(',').map(s => s.trim());
            if (statusArray.length > 1) {
                where.status = { [Op.in]: statusArray };
            } else {
                where.status = statusArray[0];
            }
        }

        if (search) {
            where[Op.or] = [
                { bookTitle: { [Op.like]: `%${search}%` } },
                // JSON search with Sequelize literal to ensure correct casting and concatenation for full name search
                Sequelize.literal(`("mainAuthor"->>'firstName' || ' ' || "mainAuthor"->>'lastName') ILIKE '%${search}%'`),
                Sequelize.literal(`"mainAuthor"->>'email' ILIKE '%${search}%'`),
                { isbnNumber: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: submissions } = await TextBookSubmission.findAndCountAll({
            where,
            limit,
            offset,
            distinct: true,
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'fullName', 'email']
                },
                {
                    model: TextBookFile,
                    as: 'files',
                    attributes: ['id', 'fileType', 'fileName', 'fileSize', 'mimeType', 'revisionNumber', 'uploadedAt']
                },
                {
                    model: TextBookStatusHistory,
                    as: 'statusHistory',
                    include: [
                        {
                            model: User,
                            as: 'changedByUser',
                            attributes: ['id', 'fullName', 'role']
                        }
                    ]
                },
                {
                    model: DeliveryAddress, as: 'deliveryAddress'
                }
            ],
            order: [['submissionDate', 'DESC']]
        });

        return sendSuccess(res, {
            submissions,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error: any) {
        console.error('Get admin submissions error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve submissions', error: error.message });
    }
};

/**
 * @route POST /api/textbooks/:id/proposal-decision
 * @desc Admin makes decision on initial proposal (accept/reject)
 * @access Private (Admin)
 */
export const proposalDecision = async (req: AuthRequest, res: Response) => {
    let transaction: any = null;
    try {
        const sequelize = TextBookSubmission.sequelize;
        if (!sequelize) {
            return sendError(res, 'Database connection not initialized', 500);
        }
        transaction = await sequelize.transaction();
        const user = req.authenticatedUser;
        if (!user || !user.isAdminOrDeveloper()) {
            await transaction.rollback();
            return sendError(res, 'Admin access required', 403);
        }

        const submissionId = parseInt(req.params.id);
        const { decision, comments } = req.body;

        if (!decision || !['accept', 'reject'].includes(decision)) {
            await transaction.rollback();
            return sendError(res, 'Valid decision (accept/reject) is required', 400);
        }

        const submission = await TextBookSubmission.findByPk(submissionId, { transaction });

        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        // Validate current status
        if (![TextBookStatus.INITIAL_SUBMITTED, TextBookStatus.PROPOSAL_UNDER_REVIEW].includes(submission.status)) {
            await transaction.rollback();
            return sendError(res, 'Proposal decision can only be made on initial or under review submissions', 400);
        }

        const oldStatus = submission.status;
        const newStatus = decision === 'accept' ? TextBookStatus.PROPOSAL_ACCEPTED : TextBookStatus.PROPOSAL_REJECTED;

        // Update submission
        submission.status = newStatus;
        submission.lastUpdatedBy = user.id;
        if (decision === 'accept') {
            submission.proposalAcceptedDate = new Date();
        }
        if (comments) {
            submission.adminNotes = comments;
        }
        await submission.save({ transaction });

        // Create status history
        await createStatusHistory(
            submission.id,
            oldStatus,
            newStatus,
            user.id,
            comments || null,
            transaction
        );

        // Create discussion post for proposal decision
        if (comments) {
            await createDiscussion(
                submission.id,
                user.id,
                `Proposal ${decision === 'accept' ? 'Accepted' : 'Rejected'}: ${comments}`,
                transaction
            );
        }

        await transaction.commit();

        // Notify author
        const notificationTitle = decision === 'accept'
            ? 'Proposal Accepted'
            : 'Proposal Rejected';
        const notificationMessage = decision === 'accept'
            ? `Your text book proposal "${submission.bookTitle}" has been accepted. You may now proceed with revisions if requested.`
            : `Your text book proposal "${submission.bookTitle}" has been rejected.`;

        const author = await User.findByPk(submission.submittedBy);
        if (author) {
            // DB Notification
            await createNotification(
                submission.submittedBy,
                user.id,
                decision === 'accept' ? NotificationType.SUCCESS : NotificationType.WARNING,
                NotificationCategory.TEXTBOOK_SUBMISSION,
                notificationTitle,
                notificationMessage,
                submission.id
            );

            // Email
            sendTextBookProposalDecisionEmail(
                author.email,
                author.fullName,
                {
                    bookTitle: submission.bookTitle,
                    decision: decision === 'accept' ? 'ACCEPTED' : 'REJECTED',
                    adminName: user.fullName,
                    adminNotes: comments || undefined,
                    submissionId: submission.id
                }
            ).catch(err => console.error('Error emailing author:', err));
        }

        return sendSuccess(res, submission, `Proposal ${decision}ed successfully`);
    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Proposal decision rollback error:', rollbackError);
            }
        }
        console.error('Proposal decision error:', error);
        return sendError(res, 'Failed to process proposal decision', 500);
    }
};

/**
 * @route POST /api/textbooks/:id/request-revision
 * @desc Admin requests revision from author
 * @access Private (Admin)
 */
export const requestRevision = async (req: AuthRequest, res: Response) => {
    let transaction: any = null;
    try {
        const sequelize = TextBookSubmission.sequelize;
        if (!sequelize) {
            return sendError(res, 'Database connection not initialized', 500);
        }
        transaction = await sequelize.transaction();
        const user = req.authenticatedUser;
        if (!user || !user.isAdminOrDeveloper()) {
            await transaction.rollback();
            return sendError(res, 'Admin access required', 403);
        }

        const submissionId = parseInt(req.params.id);
        const { comments } = req.body;

        if (!comments || comments.trim() === '') {
            await transaction.rollback();
            return sendError(res, 'Revision comments are required', 400);
        }

        const submission = await TextBookSubmission.findByPk(submissionId, { transaction });

        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        // Validate current status
        if (![TextBookStatus.PROPOSAL_ACCEPTED, TextBookStatus.REVISION_SUBMITTED].includes(submission.status)) {
            await transaction.rollback();
            return sendError(res, 'Revisions can only be requested after proposal acceptance or revision submission', 400);
        }

        // Check revision limit
        if (submission.currentRevisionNumber >= 5) {
            await transaction.rollback();
            return sendError(res, 'Maximum revision limit (5) reached', 400);
        }

        const oldStatus = submission.status;

        // Update submission
        submission.status = TextBookStatus.REVISION_REQUESTED;
        submission.currentRevisionNumber += 1;
        submission.lastUpdatedBy = user.id;
        submission.adminNotes = comments;
        await submission.save({ transaction });

        // Create revision record
        await TextBookRevision.create(
            {
                submissionId: submission.id,
                revisionNumber: submission.currentRevisionNumber,
                requestedBy: user.id,
                requestComments: comments,
                status: 'PENDING'
            },
            { transaction }
        );

        // Create status history
        await createStatusHistory(
            submission.id,
            oldStatus,
            TextBookStatus.REVISION_REQUESTED,
            user.id,
            comments,
            transaction
        );

        // Create discussion post for revision request
        await createDiscussion(
            submission.id,
            user.id,
            `Revision Requested (Rev #${submission.currentRevisionNumber}): ${comments}`,
            transaction
        );

        await transaction.commit();

        // Notify author
        // Notify author
        const author = await User.findByPk(submission.submittedBy);
        if (author) {
            // DB Notification
            await createNotification(
                submission.submittedBy,
                user.id,
                NotificationType.INFO,
                NotificationCategory.TEXTBOOK_SUBMISSION,
                'Revision Requested',
                `Revision requested for "${submission.bookTitle}"`,
                submission.id
            );

            // Email
            sendTextBookRevisionRequestedEmail(
                author.email,
                author.fullName,
                {
                    bookTitle: submission.bookTitle,
                    adminName: user.fullName,
                    comments: comments,
                    revisionNumber: submission.currentRevisionNumber,
                    submissionId: submission.id
                }
            ).catch(err => console.error('Error emailing author:', err));
        }

        return sendSuccess(res, submission, 'Revision requested successfully');
    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Request revision rollback error:', rollbackError);
            }
        }
        console.error('Request revision error:', error);
        return sendError(res, 'Failed to request revision', 500);
    }
};

/**
 * @route POST /api/textbooks/:id/submit-revision
 * @desc Author submits revision
 * @access Private (Author)
 */
export const submitRevision = async (req: AuthRequest, res: Response) => {
    let transaction: any = null;
    try {
        const sequelize = TextBookSubmission.sequelize;
        if (!sequelize) {
            return sendError(res, 'Database connection not initialized', 500);
        }
        transaction = await sequelize.transaction();
        const user = req.authenticatedUser;
        if (!user) {
            await transaction.rollback();
            return sendError(res, 'User not authenticated', 401);
        }

        const submissionId = parseInt(req.params.id);
        const { comments } = req.body;

        const submission = await TextBookSubmission.findByPk(submissionId, { transaction });

        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        // Check permission
        if (submission.submittedBy !== user.id) {
            await transaction.rollback();
            return sendError(res, 'You do not have permission to submit revision for this submission', 403);
        }

        // Validate current status
        if (submission.status !== TextBookStatus.REVISION_REQUESTED) {
            await transaction.rollback();
            return sendError(res, 'Revision can only be submitted when revision is requested', 400);
        }

        // Get uploaded file
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const revisionFile = files?.revisionFile?.[0];

        if (!revisionFile) {
            await transaction.rollback();
            return sendError(res, 'Revision file is required', 400);
        }

        const oldStatus = submission.status;

        // Update submission
        submission.status = TextBookStatus.REVISION_SUBMITTED;
        submission.lastUpdatedBy = user.id;
        await submission.save({ transaction });

        // Save revision file
        await TextBookFile.create(
            {
                submissionId: submission.id,
                fileType: TextBookFileType.REVISION,
                fileName: revisionFile.originalname,
                fileSize: revisionFile.size,
                mimeType: revisionFile.mimetype,
                fileData: revisionFile.buffer,
                revisionNumber: submission.currentRevisionNumber,
                uploadedBy: user.id,
                uploadedAt: new Date()
            },
            { transaction }
        );

        // Update revision record
        const revision = await TextBookRevision.findOne({
            where: {
                submissionId: submission.id,
                revisionNumber: submission.currentRevisionNumber
            },
            transaction
        });

        if (revision) {
            revision.submittedBy = user.id;
            revision.submissionComments = comments || null;
            revision.status = 'SUBMITTED';
            revision.submittedAt = new Date();
            await revision.save({ transaction });
        }

        // Create status history
        await createStatusHistory(
            submission.id,
            oldStatus,
            TextBookStatus.REVISION_SUBMITTED,
            user.id,
            comments || null,
            transaction
        );

        // Create discussion post for revision submission
        if (comments) {
            await createDiscussion(
                submission.id,
                user.id,
                `Revision Submitted (Rev #${submission.currentRevisionNumber}): ${comments}`,
                transaction
            );
        }

        await transaction.commit();

        // Notify admins
        const admins = await User.findAll({
            where: { role: UserRole.ADMIN, isActive: true }
        });

        for (const admin of admins) {
            // DB Notification
            await createNotification(
                admin.id,
                user.id,
                NotificationType.INFO,
                NotificationCategory.TEXTBOOK_SUBMISSION,
                'Revision Submitted',
                `${submission.mainAuthor.firstName} ${submission.mainAuthor.lastName} submitted revision ${submission.currentRevisionNumber} for "${submission.bookTitle}"`,
                submission.id
            );

            // Email
            sendTextBookRevisionSubmittedEmail(
                admin.email,
                admin.fullName,
                {
                    bookTitle: submission.bookTitle,
                    authorName: `${submission.mainAuthor.firstName} ${submission.mainAuthor.lastName}`,
                    revisionNumber: submission.currentRevisionNumber,
                    submissionId: submission.id,
                    authorMessage: comments || undefined
                }
            ).catch(err => console.error(`Error emailing admin ${admin.id}:`, err));
        }

        return sendSuccess(res, submission, 'Revision submitted successfully');
    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Submit revision rollback error:', rollbackError);
            }
        }
        console.error('Submit revision error:', error);
        return sendError(res, 'Failed to submit revision', 500);
    }
};

/**
 * @route POST /api/textbooks/:id/final-decision
 * @desc Admin makes final decision on submission (accept/reject)
 * @access Private (Admin)
 */
export const finalDecision = async (req: AuthRequest, res: Response) => {
    let transaction: any = null;
    try {
        const sequelize = TextBookSubmission.sequelize;
        if (!sequelize) {
            return sendError(res, 'Database connection not initialized', 500);
        }
        transaction = await sequelize.transaction();
        const user = req.authenticatedUser;
        if (!user || !user.isAdminOrDeveloper()) {
            await transaction.rollback();
            return sendError(res, 'Admin access required', 403);
        }

        const submissionId = parseInt(req.params.id);
        const { decision, comments } = req.body;

        if (!decision || !['accept', 'reject'].includes(decision)) {
            await transaction.rollback();
            return sendError(res, 'Valid decision (accept/reject) is required', 400);
        }

        const submission = await TextBookSubmission.findByPk(submissionId, { transaction });

        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        // Validate current status
        if (![TextBookStatus.PROPOSAL_ACCEPTED, TextBookStatus.REVISION_SUBMITTED].includes(submission.status)) {
            await transaction.rollback();
            return sendError(res, 'Final decision can only be made after proposal acceptance or revision submission', 400);
        }

        const oldStatus = submission.status;
        const newStatus = decision === 'accept' ? TextBookStatus.SUBMISSION_ACCEPTED : TextBookStatus.SUBMISSION_REJECTED;

        // Update submission
        submission.status = newStatus;
        submission.lastUpdatedBy = user.id;
        if (decision === 'accept') {
            submission.approvalDate = new Date();
        }
        if (comments) {
            submission.adminNotes = comments;
        }
        await submission.save({ transaction });

        // Create status history
        await createStatusHistory(
            submission.id,
            oldStatus,
            newStatus,
            user.id,
            comments || null,
            transaction
        );

        // Create discussion post for final decision
        if (comments) {
            await createDiscussion(
                submission.id,
                user.id,
                `Submission ${decision === 'accept' ? 'Accepted' : 'Rejected'}: ${comments}`,
                transaction
            );
        }

        await transaction.commit();

        // Notify author
        const notificationTitle = decision === 'accept'
            ? 'Submission Accepted'
            : 'Submission Rejected';
        const notificationMessage = decision === 'accept'
            ? `Your text book submission "${submission.bookTitle}" has been accepted! ISBN application will be processed next.`
            : `Your text book submission "${submission.bookTitle}" has been rejected.`;

        const author = await User.findByPk(submission.submittedBy);
        if (author) {
            // DB Notification
            await createNotification(
                submission.submittedBy,
                user.id,
                decision === 'accept' ? NotificationType.SUCCESS : NotificationType.WARNING,
                NotificationCategory.TEXTBOOK_SUBMISSION,
                notificationTitle,
                notificationMessage,
                submission.id
            );

            // Email
            sendTextBookDecisionEmail(
                author.email,
                author.fullName,
                {
                    bookTitle: submission.bookTitle,
                    decision: decision === 'accept' ? 'APPROVED' : 'REJECTED',
                    adminName: user.fullName,
                    adminNotes: comments || undefined,
                    submissionId: submission.id
                }
            ).catch(err => console.error('Error emailing author:', err));
        }

        return sendSuccess(res, submission, `Submission ${decision}ed successfully`);
    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Final decision rollback error:', rollbackError);
            }
        }
        console.error('Final decision error:', error);
        return sendError(res, 'Failed to process final decision', 500);
    }
};

/**
 * @route POST /api/textbooks/:id/apply-isbn
 * @desc Admin applies for ISBN
 * @access Private (Admin)
 */
export const applyIsbn = async (req: AuthRequest, res: Response) => {
    let transaction: any = null;
    try {
        const sequelize = TextBookSubmission.sequelize;
        if (!sequelize) {
            return sendError(res, 'Database connection not initialized', 500);
        }
        transaction = await sequelize.transaction();
        const user = req.authenticatedUser;
        if (!user || !user.isAdminOrDeveloper()) {
            await transaction.rollback();
            return sendError(res, 'Admin access required', 403);
        }

        const submissionId = parseInt(req.params.id);
        const { comments } = req.body;

        const submission = await TextBookSubmission.findByPk(submissionId, { transaction });

        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        // Validate current status
        if (submission.status !== TextBookStatus.SUBMISSION_ACCEPTED) {
            await transaction.rollback();
            return sendError(res, 'ISBN can only be applied after submission acceptance', 400);
        }

        const oldStatus = submission.status;

        // Update submission
        submission.status = TextBookStatus.ISBN_APPLIED;
        submission.lastUpdatedBy = user.id;
        submission.isbnAppliedDate = new Date();
        if (comments) {
            submission.adminNotes = comments;
        }
        await submission.save({ transaction });

        // Create status history
        await createStatusHistory(
            submission.id,
            oldStatus,
            TextBookStatus.ISBN_APPLIED,
            user.id,
            comments || 'ISBN application submitted',
            transaction
        );

        // Create discussion post for ISBN application
        if (comments) {
            await createDiscussion(
                submission.id,
                user.id,
                `ISBN Applied: ${comments}`,
                transaction
            );
        }

        await transaction.commit();

        // Notify author
        const author = await User.findByPk(submission.submittedBy);
        if (author) {
            // DB Notification
            await createNotification(
                Number(submission.submittedBy),
                Number(user.id),
                NotificationType.INFO,
                NotificationCategory.TEXTBOOK_SUBMISSION,
                'ISBN Application Submitted',
                `ISBN application has been submitted for "${submission.bookTitle}"`,
                Number(submission.id)
            );

            // Email
            sendTextBookStatusChangedEmail(
                author.email,
                author.fullName,
                {
                    bookTitle: submission.bookTitle,
                    previousStatus: oldStatus,
                    newStatus: TextBookStatus.ISBN_APPLIED,
                    changedBy: user.fullName,
                    adminMessage: comments || undefined,
                    submissionId: submission.id
                }
            ).catch(err => console.error('Error emailing author:', err));
        }

        return sendSuccess(res, submission, 'ISBN application submitted successfully');
    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Apply ISBN rollback error:', rollbackError);
            }
        }
        console.error('Apply ISBN error:', error);
        return sendError(res, 'Failed to apply for ISBN', 500);
    }
};

/**
 * @route POST /api/textbooks/:id/receive-isbn
 * @desc Admin records ISBN receipt
 * @access Private (Admin)
 */
export const receiveIsbn = async (req: AuthRequest, res: Response) => {
    let transaction: any = null;
    try {
        const sequelize = TextBookSubmission.sequelize;
        if (!sequelize) {
            return sendError(res, 'Database connection not initialized', 500);
        }
        transaction = await sequelize.transaction();
        const user = req.authenticatedUser;
        if (!user || !user.isAdminOrDeveloper()) {
            await transaction.rollback();
            return sendError(res, 'Admin access required', 403);
        }

        const submissionId = parseInt(req.params.id);
        const { isbnNumber, doiNumber, comments } = req.body;

        if (!isbnNumber) {
            await transaction.rollback();
            return sendError(res, 'ISBN number is required', 400);
        }

        const submission = await TextBookSubmission.findByPk(submissionId, { transaction });

        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        // Validate current status
        if (submission.status !== TextBookStatus.ISBN_APPLIED) {
            await transaction.rollback();
            return sendError(res, 'ISBN can only be recorded after application', 400);
        }

        const oldStatus = submission.status;

        // Update submission
        submission.status = TextBookStatus.AWAITING_DELIVERY_DETAILS;
        submission.lastUpdatedBy = user.id;
        submission.isbnNumber = isbnNumber;
        submission.doiNumber = doiNumber;
        submission.isbnReceivedDate = new Date();
        if (comments) {
            submission.adminNotes = comments;
        }
        await submission.save({ transaction });

        // Create status history
        await createStatusHistory(
            submission.id,
            oldStatus,
            TextBookStatus.AWAITING_DELIVERY_DETAILS,
            user.id,
            comments || `ISBN: ${isbnNumber}${doiNumber ? `, DOI: ${doiNumber}` : ''}. Awaiting delivery address from author.`,
            transaction
        );

        // Create discussion post for ISBN receipt
        await createDiscussion(
            submission.id,
            user.id,
            `ISBN Number: ${isbnNumber}\nDOI Number: ${doiNumber || 'N/A'}\nComments: ${comments || 'None'}`,
            transaction
        );

        await transaction.commit();

        // Notify author
        const author = await User.findByPk(submission.submittedBy);
        if (author) {
            // DB Notification
            await createNotification(
                Number(submission.submittedBy),
                Number(user.id),
                NotificationType.INFO,
                NotificationCategory.TEXTBOOK_SUBMISSION,
                'Delivery Address Required',
                `ISBN assigned for "${submission.bookTitle}". Please provide your delivery address in the Author Actions tab.`,
                Number(submission.id)
            );

            // Email
            sendDeliveryDetailsRequestEmail(
                author.email,
                author.fullName,
                {
                    bookTitle: submission.bookTitle,
                    isbnNumber: isbnNumber,
                    doiNumber: doiNumber,
                    submissionId: submission.id
                }
            ).catch(err => console.error('Error emailing author:', err));
        }

        return sendSuccess(res, submission, 'ISBN recorded successfully');
    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Receive ISBN rollback error:', rollbackError);
            }
        }
        console.error('Receive ISBN error:', error);
        return sendError(res, 'Failed to record ISBN', 500);
    }
};

/**
 * @route POST /api/textbooks/:id/start-publication
 * @desc Admin starts publication process
 * @access Private (Admin)
 */
export const startPublication = async (req: AuthRequest, res: Response) => {
    let transaction: any = null;
    try {
        const sequelize = TextBookSubmission.sequelize;
        if (!sequelize) {
            return sendError(res, 'Database connection not initialized', 500);
        }
        transaction = await sequelize.transaction();
        const user = req.authenticatedUser;
        if (!user || !user.isAdminOrDeveloper()) {
            await transaction.rollback();
            return sendError(res, 'Admin access required', 403);
        }

        const submissionId = parseInt(req.params.id);
        const { comments } = req.body;

        const submission = await TextBookSubmission.findByPk(submissionId, { transaction });

        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        // Validate current status
        if (submission.status !== TextBookStatus.ISBN_RECEIVED &&
            submission.status !== TextBookStatus.AWAITING_DELIVERY_DETAILS &&
            submission.status !== TextBookStatus.DELIVERY_ADDRESS_RECEIVED) {
            await transaction.rollback();
            return sendError(res, 'Publication can only be started after ISBN receipt or delivery address receipt', 400);
        }

        const oldStatus = submission.status;

        // Update submission
        submission.status = TextBookStatus.PUBLICATION_IN_PROGRESS;
        submission.lastUpdatedBy = user.id;
        submission.publicationStartDate = new Date();
        if (comments) {
            submission.adminNotes = comments;
        }
        await submission.save({ transaction });

        // Create status history
        await createStatusHistory(
            submission.id,
            oldStatus,
            TextBookStatus.PUBLICATION_IN_PROGRESS,
            user.id,
            comments || 'Publication process started',
            transaction
        );

        // Create discussion post for publication start
        if (comments) {
            await createDiscussion(
                submission.id,
                user.id,
                `Publication Started: ${comments}`,
                transaction
            );
        }

        await transaction.commit();

        // Notify author
        const author = await User.findByPk(submission.submittedBy);
        if (author) {
            // DB Notification
            // DB Notification
            await createNotification(
                submission.submittedBy,
                user.id,
                NotificationType.INFO,
                NotificationCategory.TEXTBOOK_SUBMISSION,
                'Publication Started',
                `Publication process has started for "${submission.bookTitle}"`,
                submission.id
            );

            // Email
            sendTextBookStatusChangedEmail(
                author.email,
                author.fullName,
                {
                    bookTitle: submission.bookTitle,
                    previousStatus: oldStatus,
                    newStatus: TextBookStatus.PUBLICATION_IN_PROGRESS,
                    changedBy: user.fullName,
                    adminMessage: comments || 'Publication process started',
                    submissionId: submission.id
                }
            ).catch(err => console.error('Error emailing author:', err));
        }

        return sendSuccess(res, submission, 'Publication started successfully');
    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Start publication rollback error:', rollbackError);
            }
        }
        console.error('Start publication error:', error);
        return sendError(res, 'Failed to start publication', 500);
    }
};

/**
 * @route POST /api/textbooks/:id/publish
 * @desc Admin publishes text book
 * @access Private (Admin)
 */
export const publishTextBook = async (req: AuthRequest, res: Response) => {
    let transaction: any = null;
    try {
        const sequelize = TextBookSubmission.sequelize;
        if (!sequelize) {
            return sendError(res, 'Database connection not initialized', 500);
        }
        transaction = await sequelize.transaction();
        const user = req.authenticatedUser;
        if (!user || !user.isAdminOrDeveloper()) {
            await transaction.rollback();
            return sendError(res, 'Admin access required', 403);
        }

        const submissionId = parseInt(req.params.id);

        // Parse form data
        let publicationDetails: any = {};
        if (req.body.publicationDetails) {
            try {
                publicationDetails = JSON.parse(req.body.publicationDetails);
            } catch (e) {
                console.error('Error parsing publicationDetails:', e);
                await transaction.rollback();
                return sendError(res, 'Invalid publication details format', 400);
            }
        }

        const comments = req.body.comments;
        const coverImageFile = req.file;

        const submission = await TextBookSubmission.findByPk(submissionId, { transaction });

        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        // Validate current status
        // Allow INITIAL_SUBMITTED if admin (Direct Publishing)
        const isDirectPublishing = user.isAdminOrDeveloper() && submission.status === TextBookStatus.INITIAL_SUBMITTED;

        if (submission.status !== TextBookStatus.PUBLICATION_IN_PROGRESS && !isDirectPublishing) {
            await transaction.rollback();
            return sendError(res, 'Text book can only be published when publication is in progress', 400);
        }

        // Check if Delivery Address exists
        if (!isDirectPublishing) {
            const DeliveryAddress = (await import('../models/deliveryAddress')).default;
            const deliveryAddress = await DeliveryAddress.findOne({ where: { textBookSubmissionId: submission.id } });
            if (!deliveryAddress) {
                await transaction.rollback();
                return sendError(res, 'Cannot publish until the author submits their delivery address.', 400);
            }
        }

        // For direct publishing, assign ISBN/DOI from publication details
        if (isDirectPublishing) {
            if (publicationDetails.isbnNumber) submission.isbnNumber = publicationDetails.isbnNumber;
            if (publicationDetails.doiNumber) submission.doiNumber = publicationDetails.doiNumber;

            // Auto-fill other tracking dates/fields for consistency
            submission.approvalDate = new Date();
            submission.isbnReceivedDate = new Date();
            submission.publicationStartDate = new Date();
        }

        // Validate ISBN
        if (!submission.isbnNumber) {
            await transaction.rollback();
            return sendError(res, 'ISBN must be assigned before publication', 400);
        }

        const oldStatus = submission.status;

        // Update submission
        submission.status = TextBookStatus.PUBLISHED;
        submission.lastUpdatedBy = user.id;
        submission.publishDate = new Date();
        if (comments) {
            submission.adminNotes = comments;
        }
        await submission.save({ transaction });

        // Handle Cover Image
        let coverImageUrl = null;
        if (coverImageFile) {
            const savedFile = await TextBookFile.create(
                {
                    submissionId: submission.id,
                    fileType: TextBookFileType.COVER_IMAGE,
                    fileName: coverImageFile.originalname,
                    fileSize: coverImageFile.size,
                    mimeType: coverImageFile.mimetype,
                    fileData: coverImageFile.buffer,
                    uploadedBy: user.id,
                    uploadedAt: new Date()
                },
                { transaction }
            );
            // Construct download URL
            coverImageUrl = `/api/textbooks/${submission.id}/download/${savedFile.id}`;
        }

        // Create PublishedBook record
        const {
            pricing,
        } = publicationDetails;

        // Defensive parsing of JSON fields if they are strings
        let parsedMainAuthor = submission.mainAuthor;
        if (typeof parsedMainAuthor === 'string') {
            try {
                parsedMainAuthor = JSON.parse(parsedMainAuthor);
            } catch (e) {
                console.error('[PublishTextBook] Error parsing mainAuthor:', e);
            }
        }

        let parsedCoAuthors = submission.coAuthors;
        if (typeof parsedCoAuthors === 'string') {
            try {
                parsedCoAuthors = JSON.parse(parsedCoAuthors);
            } catch (e) {
                console.error('[PublishTextBook] Error parsing coAuthors:', e);
            }
        }

        // Determine correct author name (Prefer request payload, fallback to submission)
        const authorName = publicationDetails.author ||
            `${parsedMainAuthor?.firstName || 'Unknown'} ${parsedMainAuthor?.lastName || ''}`.trim();

        // Properly map co-authors to comma-separated names
        let coAuthorsString = null;
        if (Array.isArray(parsedCoAuthors)) {
            coAuthorsString = parsedCoAuthors
                .map((a: any) => `${a.firstName || ''} ${a.lastName || ''}`.trim())
                .filter(n => !!n)
                .join(', ');
        }

        await PublishedBook.create({
            submissionId: null, // This is for chapters
            textBookSubmissionId: submission.id,
            bookType: BookType.TEXTBOOK,
            title: submission.bookTitle,
            author: authorName,
            coAuthors: coAuthorsString,
            coverImage: coverImageUrl,
            category: publicationDetails.category || 'General',
            description: publicationDetails.description || '',
            isbn: submission.isbnNumber,
            publishedDate: new Date().getFullYear().toString(),
            pages: publicationDetails.pages || 0,
            indexedIn: publicationDetails.indexedIn ? (Array.isArray(publicationDetails.indexedIn) ? publicationDetails.indexedIn.join(', ') : publicationDetails.indexedIn) : null,
            releaseDate: publicationDetails.releaseDate || null,
            copyright: publicationDetails.copyright || null,
            doi: submission.doiNumber,
            pricing: pricing || null,
            googleLink: publicationDetails.googleLink || null,
            flipkartLink: publicationDetails.flipkartLink || null,
            amazonLink: publicationDetails.amazonLink || null,
            isHidden: false,
            isFeatured: false,
            // Map other fields from publicationDetails if they exist
            // e.g. keywords -> generic mapping?
            // For now this covers the main requirements
        }, { transaction });

        // Create status history
        await createStatusHistory(
            submission.id,
            oldStatus,
            TextBookStatus.PUBLISHED,
            user.id,
            comments || 'Text book published',
            transaction
        );

        await transaction.commit();

        // Notify author
        const authorEmail = parsedMainAuthor?.email;
        // Reuse authorName from above


        console.log(`[Publish-TextBook] Notification phase for book "${submission.bookTitle}", author email: ${authorEmail || 'MISSING'}`);

        if (!authorEmail || authorEmail.trim() === '' || authorEmail.toLowerCase() === 'n/a' || authorEmail.toLowerCase() === 'undefined') {
            console.warn(`[Publish-TextBook] Skipping author notifications for submission ${submission.id} due to missing or invalid email.`);
        } else {
            // Find user by email for DB notification (optional)
            const authorUser = await User.findOne({ where: { email: authorEmail, isActive: true } });

            if (authorUser) {
                // DB Notification (only if user exists)
                await createNotification(
                    authorUser.id,
                    user.id,
                    NotificationType.SUCCESS,
                    NotificationCategory.TEXTBOOK_SUBMISSION,
                    'Text Book Published',
                    `Congratulations! Your text book "${submission.bookTitle}" has been published!`,
                    submission.id
                );
            }

            // Email (always send to the email from the form)
            sendTextBookPublishedEmail(
                authorEmail,
                authorName,
                {
                    bookTitle: submission.bookTitle,
                    publishDate: new Date().toLocaleDateString(),
                    isbn: submission.isbnNumber,
                    doi: submission.doiNumber || undefined,
                    submissionId: submission.id
                }
            ).catch(err => console.error('[Publish-TextBook] Error emailing author:', err));
        }

        return sendSuccess(res, submission, 'Text book published successfully');
    } catch (error: any) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Publish text book rollback error:', rollbackError);
            }
        }

        if (error.errors) {
            // Optional: Handle validation errors
        }
        return sendError(res, `Failed to publish text book: ${error.message}${error.errors ? ' - ' + JSON.stringify(error.errors) : ''}`, 500);
    }
};
/**
 * @route POST /api/textbooks/check-isbn
 * @desc Check if ISBNs are available (not already taken)
 * @access Private (Author or Admin)
 */
export const checkIsbnAvailability = async (req: AuthRequest, res: Response) => {
    try {
        const { isbns } = req.body;

        if (!isbns || !Array.isArray(isbns)) {
            return sendError(res, 'Invalid input: isbns must be an array of strings', 400);
        }

        if (isbns.length === 0) {
            return sendSuccess(res, { existingIsbns: [] });
        }

        // Normalize ISBNs
        const normalizedIsbns = isbns.map((isbn: string) => isbn.trim());

        // 1. Check PublishedBook table
        const publishedBooks = await PublishedBook.findAll({
            where: {
                isbn: {
                    [Op.in]: normalizedIsbns
                }
            },
            attributes: ['isbn']
        });

        const existingIsbns = new Set<string>();

        publishedBooks.forEach(book => {
            if (book.isbn) existingIsbns.add(book.isbn);
        });

        return sendSuccess(res, { existingIsbns: Array.from(existingIsbns) });

    } catch (error) {
        console.error('Error checking ISBN availability:', error);
        return sendError(res, 'Failed to check ISBN availability', 500);
    }
};

/**
 * @route POST /api/textbooks/bulk-report
 * @desc Send bulk upload report email
 * @access Private (Admin)
 */
export const sendBulkUploadReport = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;
        if (!user || !user.isAdminOrDeveloper()) {
            return sendError(res, 'Admin access required', 403);
        }

        const { successCount, failureCount, totalTime, logs } = req.body;

        if (typeof successCount !== 'number' || typeof failureCount !== 'number') {
            return sendError(res, 'Invalid request body', 400);
        }

        // Send Email to Admin
        await sendTextBookBulkUploadReportEmail(
            user.email,
            user.fullName,
            {
                successCount,
                failureCount,
                totalTime,
                logs
            }
        ).catch(err => console.error('Error emailing bulk report:', err));

        return sendSuccess(res, null, 'Bulk upload report sent successfully');
    } catch (error) {
        console.error('Send bulk upload report error:', error);
        return sendError(res, 'Failed to send report', 500);
    }
};

/**
 * @route GET /api/textbooks/:id/download/:fileId
 * @desc Download a file
 * @access Private (Author or Admin)
 */
export const downloadFile = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;
        if (!user) {
            return sendError(res, 'User not authenticated', 401);
        }

        const submissionId = parseInt(req.params.id);
        const fileId = parseInt(req.params.fileId);

        const submission = await TextBookSubmission.findByPk(submissionId);

        if (!submission) {
            return sendError(res, 'Submission not found', 404);
        }

        // Check permission
        const isOwner = submission.submittedBy === user.id;
        const isAdmin = user.isAdminOrDeveloper();

        if (!isOwner && !isAdmin) {
            return sendError(res, 'You do not have permission to download this file', 403);
        }

        const file = await TextBookFile.findOne({
            where: {
                id: fileId,
                submissionId
            }
        });

        if (!file) {
            return sendError(res, 'File not found', 404);
        }

        res.setHeader('Content-Type', file.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
        res.setHeader('Content-Length', file.fileSize.toString());

        return res.send(file.fileData);
    } catch (error) {
        console.error('Download file error:', error);
        return sendError(res, 'Failed to download file', 500);
    }
};

/**
 * @route POST /api/textbooks/:id/discussions
 * @desc Send a discussion message
 * @access Private (Author or Admin)
 */
export const sendDiscussionMessage = async (req: AuthRequest, res: Response) => {
    let transaction: any = null;
    try {
        const sequelize = TextBookSubmission.sequelize;
        if (!sequelize) {
            return sendError(res, 'Database connection not initialized', 500);
        }
        transaction = await sequelize.transaction();
        const user = req.authenticatedUser;
        if (!user) {
            await transaction.rollback();
            return sendError(res, 'User not authenticated', 401);
        }

        const submissionId = parseInt(req.params.id);
        const { message } = req.body;

        if (!message || message.trim() === '') {
            await transaction.rollback();
            return sendError(res, 'Message is required', 400);
        }

        const submission = await TextBookSubmission.findByPk(submissionId, { transaction });

        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        // Check permission
        const isOwner = submission.submittedBy === user.id;
        const isAdmin = user.isAdminOrDeveloper();

        if (!isOwner && !isAdmin) {
            await transaction.rollback();
            return sendError(res, 'You do not have permission to send messages for this submission', 403);
        }

        // Create discussion message
        const discussion = await TextBookDiscussion.create(
            {
                submissionId,
                senderId: user.id,
                message: message.trim()
            },
            { transaction }
        );

        await transaction.commit();

        // Send notification
        let recipientId: number | null = null;

        if (isAdmin) {
            // Admin sent message, notify author
            recipientId = submission.submittedBy;
        }

        if (recipientId) {
            // Admin sent message, notify author
            // Admin sent message, notify author (DB)
            createNotification(
                recipientId,
                user.id,
                NotificationType.INFO,
                NotificationCategory.TEXTBOOK_SUBMISSION,
                'New Discussion Message',
                `New message for "${submission.bookTitle}"`,
                submission.id
            );

            // Email Author
            const recipient = await User.findByPk(recipientId);
            if (recipient) {
                sendTextBookCommentEmail(
                    recipient.email,
                    recipient.fullName,
                    {
                        bookTitle: submission.bookTitle,
                        commenterName: user.fullName,
                        message: message.trim(),
                        submissionId: submission.id,
                        isReply: false
                    }
                ).catch((err: any) => console.error('Error emailing recipient:', err));
            }
        } else {
            // Author sent message, notify all admins
            const admins = await User.findAll({
                where: { role: UserRole.ADMIN, isActive: true }
            });

            for (const admin of admins) {
                // (DB)
                createNotification(
                    admin.id,
                    user.id,
                    NotificationType.INFO,
                    NotificationCategory.TEXTBOOK_SUBMISSION,
                    'New Discussion Message',
                    `${submission.mainAuthor.firstName} ${submission.mainAuthor.lastName} sent a message for "${submission.bookTitle}"`,
                    submission.id
                );

                // Email Admin
                sendTextBookCommentEmail(
                    admin.email,
                    admin.fullName,
                    {
                        bookTitle: submission.bookTitle,
                        commenterName: user.fullName,
                        message: message.trim(),
                        submissionId: submission.id,
                        isReply: false
                    }
                ).catch((err: any) => console.error(`Error emailing admin ${admin.id}:`, err));
            }
        }

        return sendSuccess(res, discussion, 'Message sent successfully');
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Send discussion message error:', error);
        return sendError(res, 'Failed to send message', 500);
    }
};

/**
 * @route GET /api/textbooks/:id/discussions
 * @desc Get all discussion messages for a submission
 * @access Private (Author or Admin)
 */
export const getDiscussions = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;
        if (!user) {
            return sendError(res, 'User not authenticated', 401);
        }

        const submissionId = parseInt(req.params.id);
        const submission = await TextBookSubmission.findByPk(submissionId);

        if (!submission) {
            return sendError(res, 'Submission not found', 404);
        }

        // Check permission
        const isOwner = submission.submittedBy === user.id;
        const isAdmin = user.isAdminOrDeveloper();

        if (!isOwner && !isAdmin) {
            return sendError(res, 'You do not have permission to view discussions', 403);
        }

        const discussions = await TextBookDiscussion.findAll({
            where: { submissionId },
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'fullName']
                }
            ],
            order: [['createdAt', 'ASC']]
        });

        return sendSuccess(res, discussions, 'Discussions retrieved successfully');
    } catch (error) {
        console.error('Get discussions error:', error);
        return sendError(res, 'Failed to retrieve discussions', 500);
    }
};
/**
 * @route GET /api/textbooks/stats
 * @desc Get submission statistics
 * @access Private (Author or Admin)
 */
export const getSubmissionStats = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;
        if (!user) {
            return sendError(res, 'User not authenticated', 401);
        }

        const isAdmin = user.isAdminOrDeveloper();
        const where: any = {};

        // If not admin, filter by user
        if (!isAdmin) {
            where.submittedBy = user.id;
        }

        // Regular stats (NO direct, NO bulk)
        const regularWhere = { ...where, isDirectSubmission: false, isBulkSubmission: false };
        const regularStats = await TextBookSubmission.count({
            where: regularWhere,
            group: ['status']
        });

        // Bulk count
        const bulkCount = await TextBookSubmission.count({
            where: { ...where, isBulkSubmission: true }
        });

        // Direct count
        const directCount = await TextBookSubmission.count({
            where: { ...where, isDirectSubmission: true }
        });

        // Initialize all status counts to 0 for regular submissions
        const result: Record<string, number> = {};
        Object.values(TextBookStatus).forEach(status => {
            result[status] = 0;
        });

        // Fill in actual counts for regular submissions
        (regularStats as any[]).forEach((item: { status: string; count: string }) => {
            result[item.status] = parseInt(item.count);
        });

        // Calculate aggregated counts for dashboard tabs (Regular only)
        // These keys map to the frontend TABS
        const aggregated = {
            // Admin specific keys
            new: (result[TextBookStatus.INITIAL_SUBMITTED] || 0),
            review: (result[TextBookStatus.PROPOSAL_UNDER_REVIEW] || 0) +
                (result[TextBookStatus.REVISION_REQUESTED] || 0) +
                (result[TextBookStatus.REVISION_SUBMITTED] || 0) +
                (result[TextBookStatus.PROPOSAL_ACCEPTED] || 0),
            processing: (result[TextBookStatus.SUBMISSION_ACCEPTED] || 0) +
                (result[TextBookStatus.ISBN_APPLIED] || 0) +
                (result[TextBookStatus.ISBN_RECEIVED] || 0) +
                (result[TextBookStatus.AWAITING_DELIVERY_DETAILS] || 0) +
                (result[TextBookStatus.DELIVERY_ADDRESS_RECEIVED] || 0) +
                (result[TextBookStatus.PUBLICATION_IN_PROGRESS] || 0),
            completed: (result[TextBookStatus.SUBMISSION_REJECTED] || 0) +
                (result[TextBookStatus.PROPOSAL_REJECTED] || 0) +
                (result[TextBookStatus.PUBLISHED] || 0) +
                (result[TextBookStatus.WITHDRAWN] || 0),

            // Author specific keys (Restored)

            underReview: (result[TextBookStatus.PROPOSAL_UNDER_REVIEW] || 0) +
                (result[TextBookStatus.REVISION_REQUESTED] || 0) +
                (result[TextBookStatus.REVISION_SUBMITTED] || 0),
            approved: (result[TextBookStatus.SUBMISSION_ACCEPTED] || 0) +
                (result[TextBookStatus.ISBN_APPLIED] || 0) +
                (result[TextBookStatus.ISBN_RECEIVED] || 0) +
                (result[TextBookStatus.PROPOSAL_ACCEPTED] || 0) +
                (result[TextBookStatus.AWAITING_DELIVERY_DETAILS] || 0) +
                (result[TextBookStatus.DELIVERY_ADDRESS_RECEIVED] || 0) +
                (result[TextBookStatus.PUBLICATION_IN_PROGRESS] || 0), // Added PUBLICATION_IN_PROGRESS here as it fits approved
            rejected: (result[TextBookStatus.SUBMISSION_REJECTED] || 0) +
                (result[TextBookStatus.PROPOSAL_REJECTED] || 0),
            published: (result[TextBookStatus.PUBLISHED] || 0),

            // Common/Special
            bulk: bulkCount,
            direct: directCount,
            all: Object.values(result).reduce((a, b) => a + b, 0) + bulkCount + directCount // Sum of ALL submissions
        };

        return sendSuccess(res, {
            byStatus: result,
            aggregated
        });
    } catch (error: any) {
        console.error('Get submission stats error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve submission statistics', error: error.message });
    }
};



