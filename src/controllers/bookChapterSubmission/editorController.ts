import { Response } from 'express';
import { Op, Sequelize } from 'sequelize';
import BookChapterSubmission, { BookChapterStatus } from '../../models/bookChapterSubmission';
import BookChapterStatusHistory from '../../models/bookChapterStatusHistory';
import User, { UserRole } from '../../models/user';
import { AuthRequest } from '../../middleware/auth';
import { sendError, sendSuccess } from '../../utils/responseHandler';
import { sendDummyEmail } from '../../utils/emailService';
import { notifyAuthorsProofEditing, notifyAuthorsProofSent, sendDecisionEmailToAuthors, sendBookChapterDecisionEmail, sendBookChapterDeadlineReminderEmail, sendBookChapterCommentEmail, sendBookChapterDecisionAdminEmail, sendBookChapterDecisionEditorEmail, sendBookChapterReviewerAssignedEmail, notifyAuthorsDeliveryDetailsRequested } from '../../utils/emails/bookChapterEmails';
import notificationService from '../../services/notificationService';
import { NotificationType, NotificationCategory } from '../../models/notification';
import BookChapterReviewerAssignment, { ReviewerAssignmentStatus } from '../../models/bookChapterReviewerAssignment';
import IndividualChapter, { ChapterStatus } from '../../models/individualChapter';
import ChapterStatusHistory from '../../models/chapterStatusHistory';
import BookChapterFile, { BookChapterFileType } from '../../models/bookChapterFile';
import DeliveryAddress from '../../models/deliveryAddress';

import { resolveDisplayBookTitle } from './commonController';


/**
 * @route GET /api/book-chapters/editor/submissions
 * @desc Get all submissions assigned to current editor
 * @access Private (Editor only)
 * 
 * OPTIMIZED: Combines 3 separate count queries into 1 for better performance
 */
export const getEditorSubmissions = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;

        if (!user || (!user.hasRole(UserRole.EDITOR) && !user.isAdminOrDeveloper())) {
            return sendError(res, 'Editor or Admin access required', 403);
        }

        const status = req.query.status as BookChapterStatus | undefined;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20; // Reduced from 50
        const offset = (page - 1) * limit;

        const where: any = { assignedEditorId: user.id };

        if (status) {
            where.status = status;
        }

        // Main query with optimized includes
        const { count, rows: submissions } = await BookChapterSubmission.findAndCountAll({
            where,
            limit,
            offset,
            subQuery: false, // Better performance for complex JOINs
            include: [
                {
                    model: User,
                    as: 'submitter',
                    attributes: ['id', 'fullName', 'email'], // Reduced attributes
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
                    where: { isActive: true },
                    required: false,
                    attributes: ['id', 'fileName', 'fileType', 'fileSize'], // Only necessary fields
                },
                {
                    model: BookChapterReviewerAssignment,
                    as: 'reviewerAssignments',
                    attributes: ['id', 'status', 'reviewerId'], // Only necessary fields
                    include: [
                        {
                            model: User,
                            as: 'reviewer',
                            attributes: ['id', 'fullName', 'email'],
                        },
                    ],
                },
                {
                    model: DeliveryAddress,
                    as: 'deliveryAddress',
                    required: false,
                },
            ],
            order: [['submissionDate', 'DESC']],
        });

        // OPTIMIZED: Single query to get all status counts using SQL CASE WHEN
        const statusCounts = await BookChapterSubmission.findOne({
            where: { assignedEditorId: user.id },
            attributes: [
                [
                    Sequelize.fn(
                        'SUM',
                        Sequelize.literal(
                            `CASE WHEN status IN ('${BookChapterStatus.ABSTRACT_SUBMITTED}') THEN 1 ELSE 0 END`
                        )
                    ),
                    'pendingReview'
                ],
                [
                    Sequelize.fn(
                        'SUM',
                        Sequelize.literal(
                            `CASE WHEN status IN ('${BookChapterStatus.REVIEWER_ASSIGNMENT}', '${BookChapterStatus.UNDER_REVIEW}', '${BookChapterStatus.EDITORIAL_REVIEW}') THEN 1 ELSE 0 END`
                        )
                    ),
                    'activeReview'
                ],
            ],
            raw: true,
        }) as any;

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
                statusCounts: {
                    pendingReview: parseInt(statusCounts?.pendingReview || '0'),
                    activeReview: parseInt(statusCounts?.activeReview || '0'),
                },
            },
            'Editor submissions retrieved successfully'
        );
    } catch (error) {
        console.error('❌ Get editor submissions error:', error);
        return sendError(res, 'Failed to retrieve submissions', 500);
    }
};

/**
 * @route POST /api/book-chapters/:id/editor-decision
 * @desc Editor accepts or rejects initial submission
 * @access Private (Editor)
 */
export const editorDecision = async (req: AuthRequest, res: Response) => {
    // Get sequelize from the model
    const sequelize = BookChapterSubmission.sequelize;

    if (!sequelize) {
        return sendError(res, 'Database connection not initialized', 500);
    }

    const transaction = await sequelize.transaction();

    try {
        const user = req.authenticatedUser;
        const submissionId = parseInt(req.params.id);
        const { decision, notes } = req.body; // 'accept' | 'reject'

        if (!user || (!user.hasRole(UserRole.EDITOR) && !user.isAdminOrDeveloper())) {
            await transaction.rollback();
            return sendError(res, 'Editor or Admin access required', 403);
        }

        if (isNaN(submissionId) || !decision) {
            await transaction.rollback();
            return sendError(res, 'Invalid submission ID or decision', 400);
        }

        if (!notes) {
            await transaction.rollback();
            return sendError(res, 'Decision notes are mandatory', 400);
        }

        const submission = await BookChapterSubmission.findByPk(submissionId, { transaction });

        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        // Verify user is the assigned editor, unless it's an admin or developer
        if (submission.assignedEditorId !== user.id && !user.isAdminOrDeveloper()) {
            await transaction.rollback();
            return sendError(res, 'You are not the assigned editor', 403);
        }

        // Prevent taking a decision if one has already been made (status changed from ABSTRACT_SUBMITTED)
        if (submission.status !== BookChapterStatus.ABSTRACT_SUBMITTED) {
            await transaction.rollback();

            // Try to find who made the decision
            const lastDecisionHistory = await BookChapterStatusHistory.findOne({
                where: {
                    submissionId: submission.id,
                    action: { [Op.in]: ['Abstract Accepted Awaiting Manuscript', 'Rejected', 'Abstract Accepted'] }
                },
                order: [['createdAt', 'DESC']],
                transaction
            });

            // Note: If we had an include for the user, we could show the name. For now, an informative message.
            return res.status(409).json({
                success: false,
                message: `The decision for this abstract has already been made. Current status: ${submission.status}.`,
            });
        }

        const previousStatus = submission.status;
        let newStatus: BookChapterStatus = previousStatus;

        if (decision === 'accept') {
            // Accepted means moving to abstract accepted / manuscript pending phase or directly to review?
            // Usually: INITIAL -> ASSIGNED -> EDITOR_REVIEWING -> (Decision) -> EDITOR_ACCEPTED / FULL_CHAPTER_PENDING
            // Let's assume EDITOR_ACCEPTED or FULL_CHAPTER_PENDING.
            // Based on `acceptAbstract` exists, maybe this determines if we proceed at all?
            // Let's look at `BookChapterStatus` enum usage.
            // We will map 'accept' to `EDITOR_ACCEPTED` for now, or `FULL_CHAPTER_PENDING` if abstract is good.
            newStatus = BookChapterStatus.MANUSCRIPTS_PENDING;
            // Often this triggers next step info to user
        } else if (decision === 'reject') {
            newStatus = BookChapterStatus.REJECTED;
        } else {
            await transaction.rollback();
            return sendError(res, 'Decision must be accept or reject', 400);
        }

        submission.status = newStatus;
        submission.lastUpdatedBy = user.id;
        if (notes) submission.notes = notes;
        await submission.save({ transaction });

        // History
        await BookChapterStatusHistory.create({
            submissionId: submission.id,
            previousStatus,
            newStatus,
            changedBy: user.id,
            action: decision === 'accept' ? 'Abstract Accepted Awaiting Manuscript' : 'Rejected',
            notes: notes || `Editor ${decision}ed the submission`,
            metadata: { decision }
        }, { transaction });

        // Step 2 Sync: If accepted, sync chapters to move them to MANUSCRIPTS_PENDING
        if (decision === 'accept') {
            const chapterService = (await import('../../services/chapterService')).default;
            await chapterService.syncChaptersFromSubmission(submission, transaction);

            // Explicitly transition chapters to MANUSCRIPTS_PENDING so the author can upload
            const individualChapters = await IndividualChapter.findAll({
                where: { submissionId: submission.id },
                transaction
            });
            for (const chapter of individualChapters) {
                if (chapter.status === ChapterStatus.ABSTRACT_SUBMITTED) {
                    chapter.status = ChapterStatus.MANUSCRIPTS_PENDING;
                    await chapter.save({ transaction });
                }
            }
        }

        await transaction.commit();


        // Notifications
        const displayBookTitle = await resolveDisplayBookTitle(submission.bookTitle);
        const resolvedChapterTitles = await submission.getResolvedChapterTitlesString();

        const mainAuthorRaw = typeof submission.mainAuthor === 'string' ? JSON.parse(submission.mainAuthor as any) : submission.mainAuthor;
        const coAuthorsRaw = typeof submission.coAuthors === 'string' ? JSON.parse(submission.coAuthors as any) : submission.coAuthors;

        // Collect all unique emails and names
        const participantMap = new Map<string, string>(); // email -> name

        if (mainAuthorRaw?.email) {
            participantMap.set(mainAuthorRaw.email.toLowerCase(), mainAuthorRaw.firstName || 'Author');
        }

        if (Array.isArray(coAuthorsRaw)) {
            coAuthorsRaw.forEach((author: any) => {
                if (author?.email) {
                    participantMap.set(author.email.toLowerCase(), author.firstName || 'Co-Author');
                }
            });
        }

        const submitter = await User.findByPk(submission.submittedBy);
        if (submitter?.email) {
            participantMap.set(submitter.email.toLowerCase(), submitter.fullName.split(' ')[0]);
        }

        // Resolve registered User records for all unique emails to get their IDs
        // (participantMap kept as reference but email sending now via sendDecisionEmailToAuthors)

        // Send emails to submitter + corresponding author (deduped)
        await sendDecisionEmailToAuthors(submission, submitter, {
            bookTitle: displayBookTitle,
            chapters: resolvedChapterTitles,
            decision: decision === 'accept' ? 'APPROVED' : 'REJECTED',
            editorName: user.fullName,
            editorNotes: notes || '',
            stage: 'Abstract Review',
        });

        // App notification for submitter
        if (submitter) {
            notificationService.createNotification({
                recipientId: submitter.id,
                type: decision === 'accept' ? NotificationType.ABSTRACT_ACCEPTED : NotificationType.WARNING,
                category: NotificationCategory.SUBMISSION_UPDATE,
                title: `Abstract ${decision === 'accept' ? 'Accepted' : 'Rejected'}`,
                message: `Your abstract for "${displayBookTitle}" has been ${decision === 'accept' ? 'accepted' : 'rejected'}.${notes ? ` Notes: ${notes}` : ''}`,
                relatedEntityId: submission.id,
                relatedEntityType: 'BookChapterSubmission'
            }).catch((notifyError: any) => console.error(`❌ Failed to create notification for submitter:`, notifyError));
        }

        // Notify Admins about the decision
        User.findAll({ where: { role: UserRole.ADMIN, isActive: true } }).then(admins => {
            admins.forEach(admin => {
                if (admin.id === user.id) return; // Skip notifying the user who made the decision

                notificationService.createNotification({
                    recipientId: admin.id,
                    senderId: user.id,
                    type: NotificationType.INFO,
                    category: NotificationCategory.SUBMISSION_UPDATE,
                    title: `Abstract ${decision === 'accept' ? 'Accepted' : 'Rejected'}`,
                    message: `${user.role === UserRole.ADMIN ? 'Admin' : 'Editor'} ${user.fullName} ${decision}ed the abstract for "${displayBookTitle}"`,
                    relatedEntityId: submission.id,
                    relatedEntityType: 'BookChapterSubmission'
                }).catch(console.error);

                // Notify Admins about the decision with professional template
                sendBookChapterDecisionAdminEmail(admin.email, admin.fullName, {
                    editorName: user.fullName,
                    bookTitle: displayBookTitle,
                    chapters: resolvedChapterTitles,
                    decision: decision === 'accept' ? 'Accepted' : 'Rejected',
                    submissionId: submission.id
                }).catch(console.error);
            });
        }).catch(console.error);

        // If an Admin made the decision and there is an Assigned Editor, notify the Editor
        if (user.role === UserRole.ADMIN && submission.assignedEditorId && submission.assignedEditorId !== user.id) {
            User.findByPk(submission.assignedEditorId).then(editor => {
                if (!editor) return;
                notificationService.createNotification({
                    recipientId: editor.id,
                    senderId: user.id,
                    type: NotificationType.INFO,
                    category: NotificationCategory.SUBMISSION_UPDATE,
                    title: `Abstract ${decision === 'accept' ? 'Accepted' : 'Rejected'}`,
                    message: `Admin ${user.fullName} ${decision}ed the abstract for "${displayBookTitle}"`,
                    relatedEntityId: submission.id,
                    relatedEntityType: 'BookChapterSubmission'
                }).catch(console.error);

                // Notify Editor about the decision with professional template
                sendBookChapterDecisionEditorEmail(editor.email, editor.fullName, {
                    adminName: user.fullName,
                    bookTitle: displayBookTitle,
                    chapters: resolvedChapterTitles,
                    decision: decision === 'accept' ? 'Accepted' : 'Rejected',
                    submissionId: submission.id
                }).catch(console.error);
            }).catch(console.error);
        }

        return sendSuccess(res, submission, `Submission ${decision}ed successfully`);

    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Editor decision rollback error:', rollbackError);
            }
        }
        console.error('❌ Editor decision error:', error);
        return sendError(res, 'Failed to process decision', 500);
    }
};

/**
 * @route POST /api/book-chapters/:id/assign-reviewers
 * @desc Editor assigns 2 reviewers to submission
 * @access Private (Editor - assigned only)
 */
export const assignReviewers = async (req: AuthRequest, res: Response) => {
    // Get sequelize from the model
    const sequelize = BookChapterSubmission.sequelize;

    if (!sequelize) {
        return sendError(res, 'Database connection not initialized', 500);
    }

    const transaction = await sequelize.transaction();

    try {
        const user = req.authenticatedUser;

        if (!user || (!user.hasRole(UserRole.EDITOR) && !user.isAdminOrDeveloper())) {
            await transaction.rollback();
            return sendError(res, 'Editor or Admin access required', 403);
        }

        const submissionId = parseInt(req.params.id);
        const { reviewer1Id, reviewer2Id, notes } = req.body;

        if (isNaN(submissionId) || !reviewer1Id || !reviewer2Id) {
            await transaction.rollback();
            return sendError(res, 'Both reviewer IDs are required', 400);
        }

        if (reviewer1Id === reviewer2Id) {
            await transaction.rollback();
            return sendError(res, 'Cannot assign the same reviewer twice', 400);
        }

        const submission = await BookChapterSubmission.findByPk(submissionId, { transaction });

        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        // Verify user is the assigned editor
        if (submission.assignedEditorId !== user.id && !user.isAdminOrDeveloper()) {
            await transaction.rollback();
            return sendError(res, 'You are not the assigned editor', 403);
        }

        // Verify submission is in correct status
        if (!submission.canAssignReviewers()) {
            await transaction.rollback();
            return sendError(
                res,
                'Reviewers can only be assigned after full chapter submission',
                400
            );
        }

        // Verify both users exist and have reviewer role
        const reviewer1 = await User.findByPk(reviewer1Id, { transaction });
        const reviewer2 = await User.findByPk(reviewer2Id, { transaction });

        if (!reviewer1 || !reviewer1.hasRole(UserRole.REVIEWER)) {
            await transaction.rollback();
            return sendError(res, 'Invalid reviewer 1. User must have REVIEWER role.', 400);
        }

        if (!reviewer2 || !reviewer2.hasRole(UserRole.REVIEWER)) {
            await transaction.rollback();
            return sendError(res, 'Invalid reviewer 2. User must have REVIEWER role.', 400);
        }

        // Check if reviewers are already assigned
        const existingAssignments = await BookChapterReviewerAssignment.findAll({
            where: {
                submissionId: submission.id,
                reviewerId: { [Op.in]: [reviewer1Id, reviewer2Id] },
            },
            transaction,
        });

        if (existingAssignments.length > 0) {
            await transaction.rollback();
            return sendError(res, 'One or both reviewers are already assigned to this submission', 400);
        }

        // Create reviewer assignments
        await Promise.all([
            BookChapterReviewerAssignment.create(
                {
                    submissionId: submission.id,
                    reviewerId: reviewer1Id,
                    assignedBy: user.id,
                    status: ReviewerAssignmentStatus.PENDING,
                    assignedDate: new Date(),
                },
                { transaction }
            ),
            BookChapterReviewerAssignment.create(
                {
                    submissionId: submission.id,
                    reviewerId: reviewer2Id,
                    assignedBy: user.id,
                    status: ReviewerAssignmentStatus.PENDING,
                    assignedDate: new Date(),
                },
                { transaction }
            ),
        ]);

        // Update submission
        const previousStatus = submission.status;
        submission.status = BookChapterStatus.UNDER_REVIEW;
        submission.lastUpdatedBy = user.id;
        await submission.save({ transaction });

        // Create status history
        await BookChapterStatusHistory.create(
            {
                submissionId: submission.id,
                previousStatus,
                newStatus: BookChapterStatus.UNDER_REVIEW,
                changedBy: user.id,
                action: 'Reviewers Assigned',
                notes: notes || 'Two reviewers assigned',
                metadata: {
                    reviewer1Id,
                    reviewer2Id,
                    reviewer1Name: reviewer1.fullName,
                    reviewer2Name: reviewer2.fullName,
                    assignedBy: user.fullName,
                },
            },
            { transaction }
        );

        await transaction.commit();

        // Send notifications
        const displayBookTitle = await resolveDisplayBookTitle(submission.bookTitle);
        const resolvedChapterTitles = await submission.getResolvedChapterTitlesString();

        Promise.all([
            // In-app notification to reviewer 1
            notificationService.createNotification({
                recipientId: reviewer1.id,
                senderId: user.id,
                type: NotificationType.INFO,
                category: NotificationCategory.REVIEW,
                title: 'New Review Assignment',
                message: `You have been assigned to review chapter: "${resolvedChapterTitles}"`,
                relatedEntityId: submission.id,
                relatedEntityType: 'BookChapterSubmission',
            }),
            // In-app notification to reviewer 2
            notificationService.createNotification({
                recipientId: reviewer2.id,
                senderId: user.id,
                type: NotificationType.INFO,
                category: NotificationCategory.REVIEW,
                title: 'New Review Assignment',
                message: `You have been assigned to review chapter: "${resolvedChapterTitles}"`,
                relatedEntityId: submission.id,
                relatedEntityType: 'BookChapterSubmission',
            }),
            // Email to reviewer 1
            sendBookChapterReviewerAssignedEmail(
                reviewer1.email,
                reviewer1.fullName,
                {
                    bookTitle: displayBookTitle,
                    chapterTitle: resolvedChapterTitles,
                    assignedBy: user.fullName,
                    deadline: null, // Can be updated if deadline is added to req.body
                    submissionId: submission.id,
                }
            ),
            // Email to reviewer 2
            sendBookChapterReviewerAssignedEmail(
                reviewer2.email,
                reviewer2.fullName,
                {
                    bookTitle: displayBookTitle,
                    chapterTitle: resolvedChapterTitles,
                    assignedBy: user.fullName,
                    deadline: null,
                    submissionId: submission.id,
                }
            ),
            // Notify admin
            User.findAll({ where: { role: UserRole.ADMIN, isActive: true } }).then(admins => {
                return Promise.all(
                    admins.map(async (admin) => {
                        // In-app notification to admin
                        await notificationService.createNotification({
                            recipientId: admin.id,
                            senderId: user.id, // Editor
                            type: NotificationType.INFO,
                            category: NotificationCategory.REVIEW,
                            title: 'Reviewers Assigned',
                            message: `${user.fullName} assigned reviewers for "${submission.bookTitle}"`,
                            relatedEntityId: submission.id,
                            relatedEntityType: 'BookChapterSubmission',
                        });

                        return sendDummyEmail({
                            to: admin.email,
                            subject: 'Reviewers Assigned to Book Chapter',
                            template: 'reviewers-assigned-admin',
                            data: {
                                adminName: admin.fullName,
                                submissionId: submission.id,
                                bookTitle: submission.bookTitle,
                                chapters: resolvedChapterTitles,
                                reviewer1Name: reviewer1.fullName,
                                reviewer2Name: reviewer2.fullName,
                                editorName: user.fullName,
                            },
                        });
                    })
                );
            }),
        ]).catch(err => console.error('❌ Error sending reviewer assignment emails:', err));

        return sendSuccess(res, submission, 'Reviewers assigned successfully');
    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Assign reviewers rollback error:', rollbackError);
            }
        }
        console.error('❌ Assign reviewers error:', error);
        return sendError(res, 'Failed to assign reviewers', 500);
    }
};

/**
 * @route POST /api/book-chapters/assignments/:assignmentId/reassign
 * @desc Reassign a reviewer (replace a declined/expired assignment)
 * @access Private (Editor only)
 */
export const reassignReviewer = async (req: AuthRequest, res: Response) => {
    // Get sequelize from the model
    const sequelize = BookChapterSubmission.sequelize;

    if (!sequelize) {
        return sendError(res, 'Database connection not initialized', 500);
    }

    const transaction = await sequelize.transaction();

    try {
        const user = req.authenticatedUser;

        if (!user || (!user.hasRole(UserRole.EDITOR) && !user.isAdminOrDeveloper())) {
            await transaction.rollback();
            return sendError(res, 'Editor or Admin access required', 403);
        }

        const assignmentId = parseInt(req.params.assignmentId);
        const { newReviewerId, notes } = req.body;

        if (isNaN(assignmentId) || !newReviewerId) {
            await transaction.rollback();
            return sendError(res, 'Assignment ID and new reviewer ID are required', 400);
        }

        const oldAssignment = await BookChapterReviewerAssignment.findByPk(assignmentId, { transaction });

        if (!oldAssignment) {
            await transaction.rollback();
            return sendError(res, 'Assignment not found', 404);
        }

        // Allow reassignment if declined, expired, or pending
        if (oldAssignment.status !== ReviewerAssignmentStatus.DECLINED &&
            oldAssignment.status !== ReviewerAssignmentStatus.EXPIRED &&
            oldAssignment.status !== ReviewerAssignmentStatus.PENDING) {
            await transaction.rollback();
            return sendError(res, 'Can only reassign declined, expired or pending reviewers', 400);
        }

        const submission = await BookChapterSubmission.findByPk(oldAssignment.submissionId, { transaction });
        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        // Verify user is the assigned editor
        if (submission.assignedEditorId !== user.id && !user.isAdminOrDeveloper()) {
            await transaction.rollback();
            return sendError(res, 'You are not the assigned editor', 403);
        }

        const newReviewer = await User.findByPk(newReviewerId);
        if (!newReviewer) {
            await transaction.rollback();
            return sendError(res, 'New reviewer not found', 404);
        }

        // Create new assignment
        const newAssignment = await BookChapterReviewerAssignment.create({
            submissionId: submission.id,
            reviewerId: newReviewerId,
            assignedBy: user.id,
            status: ReviewerAssignmentStatus.PENDING,
            assignedDate: new Date(),
            confidentialNotes: notes, // Store notes here if any
        }, { transaction });

        // Update submission reassignment — no longer track at submission level
        // (reviewers are tracked at chapter level)

        // Reset status if needed to ensure flow continues
        if (submission.status !== BookChapterStatus.UNDER_REVIEW) {
            submission.status = BookChapterStatus.UNDER_REVIEW;
        }

        submission.lastUpdatedBy = user.id;
        await submission.save({ transaction });

        await BookChapterStatusHistory.create({
            submissionId: submission.id,
            previousStatus: submission.status,
            newStatus: submission.status,
            changedBy: user.id,
            action: 'Reviewer Reassigned',
            notes: `Replaced reviewer ${oldAssignment.reviewerId} with ${newReviewer.fullName}`,
            metadata: {
                oldAssignmentId: oldAssignment.id,
                newAssignmentId: newAssignment.id,
                newReviewerId
            }
        }, { transaction });

        await transaction.commit();

        // Notify new reviewer
        const resolvedChapterTitles = await submission.getResolvedChapterTitlesString();
        sendDummyEmail({
            to: newReviewer.email,
            subject: 'New Book Chapter Review Assignment',
            template: 'reviewer-assigned',
            data: {
                reviewerName: newReviewer.fullName,
                submissionId: submission.id,
                bookTitle: submission.bookTitle,
                authorName: submission.getMainAuthorName(),
                chapters: resolvedChapterTitles,
                editorName: user.fullName,
                acceptLink: `${process.env.FRONTEND_URL}/reviewer/assignments/${submission.id}`,
            },
        }).catch(err => console.error('❌ Error sending new reviewer assignment emails:', err));

        return sendSuccess(res, { newAssignment }, 'Reviewer reassigned successfully');

    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Reassign reviewer rollback error:', rollbackError);
            }
        }
        console.error('❌ Reassign reviewer error:', error);
        return sendError(res, 'Failed to reassign reviewer', 500);
    }
};

/**
 * @route GET /api/book-chapters/:id/reviewers
 * @desc Get all reviewer assignments for a submission
 * @access Private (Editor/Admin)
 */
export const getSubmissionReviewers = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;
        const submissionId = parseInt(req.params.id);

        if (!user || (!user.hasRole(UserRole.EDITOR) && !user.hasRole(UserRole.ADMIN) && !user.hasRole(UserRole.DEVELOPER))) {
            return sendError(res, 'Editor or Admin access required', 403);
        }

        if (isNaN(submissionId)) {
            return sendError(res, 'Invalid submission ID', 400);
        }

        const assignments = await BookChapterReviewerAssignment.findAll({
            where: { submissionId },
            include: [
                {
                    model: User,
                    as: 'reviewer',
                    attributes: ['id', 'fullName', 'email'],
                },
            ],
            order: [['createdAt', 'DESC']], // Show newest assignments first
        });

        return sendSuccess(res, { assignments }, 'Reviewers retrieved successfully');
    } catch (error) {
        console.error('❌ Get submission reviewers error:', error);
        return sendError(res, 'Failed to fetch reviewers', 500);
    }
};

/**
 * @route POST /api/book-chapters/:submissionId/accept-abstract
 * @desc Editor accepts abstract and initiates manuscript collection
 * @access Private (Editor)
 */
export const acceptAbstract = async (req: AuthRequest, res: Response) => {
    const { submissionId } = req.params;
    const { notes } = req.body;
    const user = req.authenticatedUser;

    if (!user) {
        return sendError(res, 'User not authenticated', 401);
    }

    try {
        const submission = await BookChapterSubmission.findByPk(submissionId, {
            include: [
                { model: IndividualChapter, as: 'individualChapters' }
            ]
        });

        if (!submission) {
            return sendError(res, 'Submission not found', 404);
        }

        if (submission.assignedEditorId !== user.id && !user.isAdminOrDeveloper()) {
            return sendError(res, 'Not authorized to accept this abstract', 403);
        }

        const allowedStatuses = [
            BookChapterStatus.ABSTRACT_SUBMITTED,
            BookChapterStatus.MANUSCRIPTS_PENDING, // Allow re-triggering to fix chapter statuses
        ];

        if (!allowedStatuses.includes(submission.status)) {
            return res.status(409).json({
                success: false,
                message: `The decision for this abstract has already been made or moved forward. Current status: ${submission.status}.`,
            });
        }

        // Check if manuscripts already exist for all chapters
        const allChaptersHaveManuscripts = submission.individualChapters?.every(
            (ch: IndividualChapter) => ch.manuscriptFileId !== null
        ) || false;

        // Update submission status based on manuscript availability
        const oldStatus = submission.status;
        const newStatus = allChaptersHaveManuscripts
            ? BookChapterStatus.REVIEWER_ASSIGNMENT
            : BookChapterStatus.MANUSCRIPTS_PENDING;

        submission.status = newStatus;
        submission.lastUpdatedBy = user.id;
        await submission.save();

        // Update all individual chapters to MANUSCRIPT_PENDING if they are ABSTRACT_SUBMITTED
        if (submission.individualChapters) {
            await Promise.all(submission.individualChapters.map(async (chapter: IndividualChapter) => {
                if (chapter.status === ChapterStatus.ABSTRACT_SUBMITTED) {
                    chapter.status = ChapterStatus.MANUSCRIPTS_PENDING;
                    await chapter.save();
                }
            }));
        }

        // Create status history
        await BookChapterStatusHistory.create({
            submissionId: submission.id,
            previousStatus: oldStatus,
            newStatus: newStatus,
            changedBy: user.id,
            action: 'Abstract Accepted',
            notes: notes || 'Abstract accepted by editor',
            metadata: {},
        });

        // Resolve book title for notification if it's a numeric ID
        const displayBookTitle = await resolveDisplayBookTitle(submission.bookTitle);
        const mainAuthor = typeof submission.mainAuthor === 'string' ? JSON.parse(submission.mainAuthor as any) : submission.mainAuthor;

        // Notifications
        try {
            const mainAuthor = typeof submission.mainAuthor === 'string' ? JSON.parse(submission.mainAuthor as any) : submission.mainAuthor;
            const recipients = new Map<string, { id: number, name: string, email: string }>();

            // 1. Add Main Author
            if (mainAuthor && mainAuthor.email) {
                recipients.set(mainAuthor.email.toLowerCase(), {
                    id: submission.submittedBy,
                    name: mainAuthor.firstName || 'Author',
                    email: mainAuthor.email
                });
            }

            // 2. Add Submitter
            const submitter = await User.findByPk(submission.submittedBy);
            if (submitter && submitter.email) {
                recipients.set(submitter.email.toLowerCase(), {
                    id: submitter.id,
                    name: submitter.fullName.split(' ')[0],
                    email: submitter.email
                });
            }

            for (const [_, recipient] of recipients) {
                try {
                    await notificationService.createNotification({
                        recipientId: recipient.id,
                        type: NotificationType.ABSTRACT_ACCEPTED,
                        category: NotificationCategory.SUBMISSION_UPDATE,
                        title: 'Abstract Accepted',
                        message: allChaptersHaveManuscripts
                            ? `Your abstract for "${displayBookTitle}" has been accepted and manuscripts are received.`
                            : `Your abstract for "${displayBookTitle}" has been accepted! Please upload manuscripts for each chapter.`,
                        relatedEntityId: submission.id,
                        relatedEntityType: 'BookChapterSubmission'
                    });
                } catch (notifyError) {
                    console.error(`Failed to create notification for user ${recipient.id} (acceptAbstract):`, notifyError);
                }

                await sendBookChapterDecisionEmail(
                    recipient.email,
                    recipient.name,
                    {
                        bookTitle: displayBookTitle,
                        decision: 'APPROVED',
                        editorName: user.fullName,
                        editorNotes: notes || '',
                        stage: 'Abstract',
                        submissionId: submission.id
                    }
                ).catch(err => console.error(`Error sending acceptance email to ${recipient.email}:`, err));
            }
        } catch (notifyError) {
            console.error('Failed to send notification for abstract acceptance:', notifyError);
        }

        return sendSuccess(res, { submission }, 'Abstract accepted successfully');
    } catch (error) {
        console.error('Error accepting abstract:', error);
        return sendError(res, 'Failed to accept abstract', 500);
    }
};

/**
 * @route POST /api/book-chapters/:id/final-decision
 * @desc Editor makes final decision (approve/reject)
 * @access Private (Editor - assigned only)
 */
export const finalDecision = async (req: AuthRequest, res: Response) => {
    // Get sequelize from the model
    const sequelize = BookChapterSubmission.sequelize;

    if (!sequelize) {
        return sendError(res, 'Database connection not initialized', 500);
    }

    const transaction = await sequelize.transaction();

    try {
        const user = req.authenticatedUser;

        if (!user || (!user.hasRole(UserRole.EDITOR) && !user.hasRole(UserRole.ADMIN) && !user.hasRole(UserRole.DEVELOPER))) {
            await transaction.rollback();
            return sendError(res, 'Editor or Admin access required', 403);
        }

        const submissionId = parseInt(req.params.id);
        const { decision, notes, publicationDetails } = req.body;
        // decision: 'approve' | 'reject'
        // publicationDetails: { scheduledDate, volume, issue } (optional, for approved)

        if (isNaN(submissionId) || !decision) {
            await transaction.rollback();
            return sendError(res, 'Invalid submission ID or decision', 400);
        }

        if (!['approve', 'reject'].includes(decision)) {
            await transaction.rollback();
            return sendError(res, 'Decision must be "approve" or "reject"', 400);
        }

        if (!notes) {
            await transaction.rollback();
            return sendError(res, 'Decision notes are mandatory', 400);
        }

        const submission = await BookChapterSubmission.findByPk(submissionId, { transaction });

        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        // Verify user is the assigned editor or an admin
        if (submission.assignedEditorId !== user.id && !user.isAdminOrDeveloper()) {
            await transaction.rollback();
            return sendError(res, 'You are not the assigned editor or an admin', 403);
        }

        if (submission.status === BookChapterStatus.APPROVED || submission.status === BookChapterStatus.REJECTED || submission.status === BookChapterStatus.PUBLISHED) {
            await transaction.rollback();

            // Check history to see who already made the decision
            const lastDecisionHistory = await BookChapterStatusHistory.findOne({
                where: {
                    submissionId: submission.id,
                    newStatus: { [Op.in]: [BookChapterStatus.APPROVED, BookChapterStatus.REJECTED, BookChapterStatus.PUBLISHED] },
                    action: { [Op.in]: ['Final Approval', 'Final Rejection', 'Final Decision'] }
                },
                include: [{ model: User, as: 'user', attributes: ['fullName'] }],
                order: [['createdAt', 'DESC']]
            });

            const decisionMaker = (lastDecisionHistory as any)?.user?.fullName || (lastDecisionHistory as any)?.metadata?.editorName || 'another user';

            return res.status(409).json({
                success: false,
                message: `The final decision was already taken by ${decisionMaker}.`,
            });
        }

        // Verify submission is ready for final decision
        const isReadyStatus = submission.status === BookChapterStatus.EDITORIAL_REVIEW;

        // Also check if all individual chapters are decided (Safety check for stuck workflows)
        let allChaptersDecided = false;
        const individualChapters = await IndividualChapter.findAll({
            where: { submissionId: submission.id },
            transaction
        });

        if (individualChapters.length > 0) {
            allChaptersDecided = individualChapters.every(ch =>
                ch.status === ChapterStatus.CHAPTER_APPROVED ||
                ch.status === ChapterStatus.CHAPTER_REJECTED
            );
        }

        if (!isReadyStatus && !allChaptersDecided) {
            await transaction.rollback();
            return sendError(
                res,
                'Final decision can only be made after all reviews are completed or all chapters are decided',
                400
            );
        }

        // Get reviewer recommendations for reference
        const assignments = await BookChapterReviewerAssignment.findAll({
            where: {
                submissionId: submission.id,
                status: ReviewerAssignmentStatus.COMPLETED,
            },
            include: [
                {
                    model: User,
                    as: 'reviewer',
                    attributes: ['id', 'fullName'],
                },
            ],
            transaction,
        });

        // Update submission status
        const previousStatus = submission.status;
        const newStatus = decision === 'approve' ? BookChapterStatus.APPROVED : BookChapterStatus.REJECTED;

        // If rejecting, mark all active reviewer assignments as DECLINED/CANCELLED
        if (decision === 'reject') {
            await BookChapterReviewerAssignment.update(
                {
                    status: ReviewerAssignmentStatus.DECLINED,
                    confidentialNotes: 'System: Automatically declined due to submission rejection'
                },
                {
                    where: {
                        submissionId: submission.id,
                        status: {
                            [Op.in]: [
                                ReviewerAssignmentStatus.PENDING,
                                ReviewerAssignmentStatus.ACCEPTED,
                                ReviewerAssignmentStatus.IN_PROGRESS
                            ]
                        }
                    },
                    transaction
                }
            );
        }

        submission.status = newStatus;
        submission.finalApprovalDate = new Date();
        submission.lastUpdatedBy = user.id;
        if (notes) submission.notes = notes;
        await submission.save({ transaction });

        // Create status history
        await BookChapterStatusHistory.create(
            {
                submissionId: submission.id,
                previousStatus,
                newStatus,
                changedBy: user.id,
                action: decision === 'approve' ? 'Final Approval' : 'Final Rejection',
                notes: notes || `Editor made final decision: ${decision}`,
                metadata: {
                    decision,
                    editorName: user.fullName,
                    publicationDetails: publicationDetails || null,
                    reviewerRecommendations: assignments.map(a => ({
                        reviewerId: a.reviewerId,
                        recommendation: a.recommendation,
                    })),
                },
            },
            { transaction }
        );

        // If approved and final file exists, mark it as final approved
        if (decision === 'approve') {
            const latestFile = await BookChapterFile.findOne({
                where: {
                    submissionId: submission.id,
                    isActive: true,
                },
                order: [['uploadDate', 'DESC']],
                transaction,
            });

            if (latestFile) {
                // Create a final approved version
                await BookChapterFile.create(
                    {
                        submissionId: submission.id,
                        fileType: BookChapterFileType.FINAL_APPROVED,
                        fileName: latestFile.fileName,
                        fileData: latestFile.fileData,
                        fileUrl: latestFile.fileUrl,
                        fileSize: latestFile.fileSize,
                        mimeType: latestFile.mimeType,
                        uploadedBy: user.id,
                        description: 'Final approved version',
                        isActive: true,
                    },
                    { transaction }
                );
            }
        }

        await transaction.commit();

        // Send notifications
        const displayBookTitle = await resolveDisplayBookTitle(submission.bookTitle);
        const resolvedChapterTitles = await submission.getResolvedChapterTitlesString();
        const mainAuthor = submission.mainAuthor;

        // Unique recipients for Author and Submitter
        const recipients = new Map<string, { id: number, name: string, email: string }>();
        const mainAuthorParsed = typeof submission.mainAuthor === 'string' ? JSON.parse(submission.mainAuthor as any) : submission.mainAuthor;

        if (mainAuthorParsed && mainAuthorParsed.email) {
            recipients.set(mainAuthorParsed.email.toLowerCase(), {
                id: submission.submittedBy,
                name: mainAuthorParsed.firstName || 'Author',
                email: mainAuthorParsed.email
            });
        }

        const submitter = await User.findByPk(submission.submittedBy);
        if (submitter && submitter.email) {
            recipients.set(submitter.email.toLowerCase(), {
                id: submitter.id,
                name: submitter.fullName.split(' ')[0],
                email: submitter.email
            });
        }

        // Send emails to submitter + corresponding author via shared helper (Scenario 3: Final Book Decision)
        const submitterForEmail = await User.findByPk(submission.submittedBy);
        await sendDecisionEmailToAuthors(submission, submitterForEmail, {
            bookTitle: displayBookTitle,
            chapters: resolvedChapterTitles,
            decision: decision === 'approve' ? 'APPROVED' : 'REJECTED',
            editorName: user.fullName,
            editorNotes: notes || (decision === 'approve' ? 'Your chapter has been approved for publication.' : 'After careful review, we are unable to accept this submission.'),
            stage: 'Final Book Decision',
        });

        // App notification for submitter
        if (submitterForEmail) {
            notificationService.createNotification({
                recipientId: submitterForEmail.id,
                senderId: user.id,
                type: decision === 'approve' ? NotificationType.SUCCESS : NotificationType.ERROR,
                category: NotificationCategory.SUBMISSION,
                title: decision === 'approve' ? 'Book Chapter Approved 🎉' : 'Book Chapter Rejected',
                message: decision === 'approve'
                    ? `Congratulations! Your chapter "${displayBookTitle}" has been approved for publication. Notes: ${notes}`
                    : `Your chapter "${displayBookTitle}" has been rejected. Notes: ${notes}`,
                relatedEntityId: submission.id,
                relatedEntityType: 'BookChapterSubmission',
            }).catch((err: any) => console.error('❌ Error sending final decision notification:', err));
        }

        if (decision === 'reject') {
            Promise.all([
                // Notify the other role (Admin -> Editor or Editor -> Admin)
                (async () => {
                    try {
                        if (user.isAdminOrDeveloper()) {
                            // Admin made the decision -> Notify Editor
                            if (submission.assignedEditorId) {
                                const editor = await User.findByPk(submission.assignedEditorId);
                                if (editor) {
                                    await notificationService.createNotification({
                                        recipientId: editor.id,
                                        senderId: user.id,
                                        type: NotificationType.WARNING,
                                        category: NotificationCategory.SUBMISSION,
                                        title: 'Book Chapter Rejected',
                                        message: `Admin ${user.fullName} has rejected "${displayBookTitle}".`,
                                        relatedEntityId: submission.id,
                                        relatedEntityType: 'BookChapterSubmission',
                                    });

                                    await sendDummyEmail({
                                        to: editor.email,
                                        subject: 'Book Chapter Rejected',
                                        template: 'final-rejection-editor',
                                        data: {
                                            editorName: editor.fullName,
                                            submissionId: submission.id,
                                            bookTitle: displayBookTitle,
                                            chapters: resolvedChapterTitles,
                                            authorName: submission.getMainAuthorName(),
                                            adminName: user.fullName,
                                            rejectionReason: notes || 'No reason provided',
                                        },
                                    });
                                }
                            }
                        } else {
                            // Editor made the decision -> Notify Admins
                            const admins = await User.findAll({ where: { role: UserRole.ADMIN, isActive: true } });
                            await Promise.all(
                                admins.map(async (admin) => {
                                    await notificationService.createNotification({
                                        recipientId: admin.id,
                                        senderId: user.id,
                                        type: NotificationType.WARNING,
                                        category: NotificationCategory.SUBMISSION,
                                        title: 'Book Chapter Rejected',
                                        message: `Editor ${user.fullName} has rejected "${displayBookTitle}".`,
                                        relatedEntityId: submission.id,
                                        relatedEntityType: 'BookChapterSubmission',
                                    });

                                    return sendDummyEmail({
                                        to: admin.email,
                                        subject: 'Book Chapter Rejected',
                                        template: 'final-rejection-admin',
                                        data: {
                                            adminName: admin.fullName,
                                            submissionId: submission.id,
                                            bookTitle: displayBookTitle,
                                            chapters: resolvedChapterTitles,
                                            authorName: submission.getMainAuthorName(),
                                            editorName: user.fullName,
                                            rejectionReason: notes || 'No reason provided',
                                        },
                                    });
                                })
                            );
                        }
                    } catch (error) {
                        console.error('Failed to send cross-role rejection notification:', error);
                    }
                })(),
                // Notify all reviewers of final decision
                ...assignments.map(async (assignment) => {
                    const reviewer = (assignment as any).reviewer;
                    // In-app notification to reviewer
                    await notificationService.createNotification({
                        recipientId: reviewer.id,
                        senderId: user.id,
                        type: NotificationType.INFO,
                        category: NotificationCategory.REVIEW,
                        title: 'Final Decision Made',
                        message: `A final decision (REJECTED) has been made for "${displayBookTitle}".`,
                        relatedEntityId: submission.id,
                        relatedEntityType: 'BookChapterSubmission',
                    });

                    return sendDummyEmail({
                        to: reviewer.email,
                        subject: 'Final Decision Made on Book Chapter Review',
                        template: 'final-decision-reviewer',
                        data: {
                            reviewerName: reviewer.fullName,
                            submissionId: submission.id,
                            bookTitle: displayBookTitle,
                            chapters: resolvedChapterTitles,
                            decision: 'REJECTED',
                            editorName: user.fullName,
                        },
                    });
                }),
            ]).catch(err => console.error('❌ Error sending rejection emails:', err));
        } else {
            // APPROVED - cross-role notifications (author email already sent via sendDecisionEmailToAuthors above)
            Promise.all([
                // Notify the other role (Admin -> Editor or Editor -> Admin)
                (async () => {
                    try {
                        if (user.isAdminOrDeveloper()) {
                            // Admin made the decision -> Notify Editor
                            if (submission.assignedEditorId) {
                                const editor = await User.findByPk(submission.assignedEditorId);
                                if (editor) {
                                    await notificationService.createNotification({
                                        recipientId: editor.id,
                                        senderId: user.id,
                                        type: NotificationType.SUCCESS,
                                        category: NotificationCategory.SUBMISSION,
                                        title: 'Book Chapter Approved',
                                        message: `Admin ${user.fullName} has approved "${displayBookTitle}" for publication.`,
                                        relatedEntityId: submission.id,
                                        relatedEntityType: 'BookChapterSubmission',
                                    });
                                }
                            }
                        } else {
                            // Editor made the decision -> Notify Admins
                            const admins = await User.findAll({
                                where: { role: UserRole.ADMIN, isActive: true },
                            });
                            await Promise.all(
                                admins.map(async (admin) => {
                                    await notificationService.createNotification({
                                        recipientId: admin.id,
                                        senderId: user.id,
                                        type: NotificationType.SUCCESS,
                                        category: NotificationCategory.SUBMISSION,
                                        title: 'Book Chapter Approved',
                                        message: `Editor ${user.fullName} has approved "${displayBookTitle}" for publication.`,
                                        relatedEntityId: submission.id,
                                        relatedEntityType: 'BookChapterSubmission',
                                    });
                                })
                            );
                        }
                    } catch (error) {
                        console.error('Failed to send cross-role approval notification:', error);
                    }
                })(),
                // Notify all reviewers of final decision
                ...assignments.map(async (assignment: any) => {
                    const reviewer = assignment.reviewer;
                    await notificationService.createNotification({
                        recipientId: reviewer.id,
                        senderId: user.id,
                        type: NotificationType.INFO,
                        category: NotificationCategory.REVIEW,
                        title: 'Final Decision Made',
                        message: `A final decision (APPROVED) has been made for "${displayBookTitle}".`,
                        relatedEntityId: submission.id,
                        relatedEntityType: 'BookChapterSubmission',
                    });

                    return sendDummyEmail({
                        to: reviewer.email,
                        subject: 'Final Decision Made on Book Chapter Review',
                        template: 'final-decision-reviewer',
                        data: {
                            reviewerName: reviewer.fullName,
                            submissionId: submission.id,
                            bookTitle: displayBookTitle,
                            chapters: resolvedChapterTitles,
                            decision: 'APPROVED',
                            editorName: user.fullName,
                        },
                    });
                }),
            ]).catch((err: any) => console.error('❌ Error sending approval emails:', err));
        }
        return sendSuccess(
            res,
            {
                submission,
                message:
                    decision === 'approve'
                        ? 'Chapter approved successfully! Author has been notified.'
                        : 'Chapter rejected. Author has been notified.',
            },
            `Submission ${decision === 'approve' ? 'approved' : 'rejected'} successfully`
        );
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Final decision error:', error);
        return sendError(res, 'Failed to process final decision', 500);
    }
};


/**
 * @route POST /api/book-chapters/:id/apply-isbn
 * @desc Editor/Admin applies for ISBN — status → ISBN_APPLIED
 * @access Private (Editor/Admin)
 */
export const applyIsbn = async (req: AuthRequest, res: Response) => {
    const sequelize = BookChapterSubmission.sequelize;
    if (!sequelize) return sendError(res, 'Database connection not initialized', 500);

    const transaction = await sequelize.transaction();
    try {
        const user = req.authenticatedUser;
        const submissionId = parseInt(req.params.id);
        const { notes } = req.body;

        if (!user || (!user.hasRole(UserRole.EDITOR) && !user.hasRole(UserRole.ADMIN) && !user.hasRole(UserRole.DEVELOPER))) {
            await transaction.rollback();
            return sendError(res, 'Editor or Admin access required', 403);
        }

        const submission = await BookChapterSubmission.findByPk(submissionId, { transaction });
        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        if (submission.assignedEditorId !== user.id && !user.isAdminOrDeveloper()) {
            await transaction.rollback();
            return sendError(res, 'You are not the assigned editor', 403);
        }

        if (submission.status !== BookChapterStatus.APPROVED) {
            await transaction.rollback();
            return sendError(res, `Submission must be APPROVED before applying for ISBN (current: ${submission.status})`, 400);
        }

        const previousStatus = submission.status;
        submission.status = BookChapterStatus.ISBN_APPLIED;
        submission.lastUpdatedBy = user.id;
        await submission.save({ transaction });

        await BookChapterStatusHistory.create({
            submissionId: submission.id,
            previousStatus,
            newStatus: BookChapterStatus.ISBN_APPLIED,
            changedBy: user.id,
            action: 'Proof Editing Started',
            notes: notes || `Proof editing started by ${user.fullName}`,
            metadata: { editorName: user.fullName },
        }, { transaction });

        await transaction.commit();

        // Step 9 Fix: Notify Admin & Authors
        const displayBookTitle = await resolveDisplayBookTitle(submission.bookTitle) || submission.bookTitle;
        const submitter = await User.findByPk(submission.submittedBy);

        // Notify Admins (In-app)
        User.findAll({ where: { role: UserRole.ADMIN, isActive: true } }).then(admins => {
            admins.forEach(admin => {
                notificationService.createNotification({
                    recipientId: admin.id,
                    senderId: user.id,
                    type: NotificationType.INFO,
                    category: NotificationCategory.SUBMISSION,
                    title: 'Proof Editing Started',
                    message: `Proof editing has been started for "${displayBookTitle}" by ${user.fullName}.`,
                    relatedEntityId: submission.id,
                    relatedEntityType: 'BookChapterSubmission',
                }).catch(console.error);
            });
        }).catch(console.error);

        // Notify Authors (Email)
        notifyAuthorsProofEditing(submission, submitter, {
            bookTitle: displayBookTitle,
            editorName: user.fullName,
            notes: notes || `Proof editing has been started for your submission "${displayBookTitle}". Our team will now begin the final polishing and formatting process.`
        }).catch(err => console.error('❌ Error sending proof editing notifications:', err));

        return sendSuccess(res, { submission }, 'Proof editing started successfully');

    } catch (error) {
        await transaction.rollback();
        console.error('❌ Apply ISBN error:', error);
        return sendError(res, 'Failed to submit ISBN application', 500);
    }
};


/**
 * @route POST /api/book-chapters/:id/receive-isbn
 * @desc Editor/Admin records received ISBN and DOI — status → PUBLICATION_IN_PROGRESS
 * @access Private (Editor/Admin)
 */
export const receiveIsbn = async (req: AuthRequest, res: Response) => {
    const sequelize = BookChapterSubmission.sequelize;
    if (!sequelize) return sendError(res, 'Database connection not initialized', 500);

    const transaction = await sequelize.transaction();
    try {
        const user = req.authenticatedUser;
        const submissionId = parseInt(req.params.id);
        const { notes } = req.body;

        if (!user || (!user.hasRole(UserRole.EDITOR) && !user.hasRole(UserRole.ADMIN) && !user.hasRole(UserRole.DEVELOPER))) {
            await transaction.rollback();
            return sendError(res, 'Editor or Admin access required', 403);
        }

        const submission = await BookChapterSubmission.findByPk(submissionId, { transaction });
        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        if (submission.assignedEditorId !== user.id && !user.isAdminOrDeveloper()) {
            await transaction.rollback();
            return sendError(res, 'You are not the assigned editor', 403);
        }

        if (submission.status !== BookChapterStatus.ISBN_APPLIED) {
            if (submission.isbn) {
                await transaction.rollback();
                let recorderName = 'another user';
                if (submission.lastUpdatedBy) {
                    const recorder = await User.findByPk(submission.lastUpdatedBy);
                    if (recorder) recorderName = recorder.fullName;
                }
                const recordDate = submission.updatedAt ? new Date(submission.updatedAt).toLocaleString() : 'an unknown time';
                return sendError(res, `ISBN ${submission.isbn} was already recorded by ${recorderName} on ${recordDate}`, 409);
            }
            await transaction.rollback();
            return sendError(res, `Submission must be in ISBN_APPLIED status (current: ${submission.status})`, 400);
        }

        const previousStatus = submission.status;
        submission.status = BookChapterStatus.PUBLICATION_IN_PROGRESS;
        submission.lastUpdatedBy = user.id;
        await submission.save({ transaction });

        // Update associated BookChapters as Ready for Publication
        try {
            const { default: BookTitle } = await import('../../models/bookTitle');
            const { default: BookChapter } = await import('../../models/bookChapter');
            const { Op } = await import('sequelize');

            // Find the bookTitleId for the bookTitle string
            const bookTitleRecord = await BookTitle.findOne({
                where: { title: submission.bookTitle },
                transaction
            });

            if (bookTitleRecord) {
                const chapterTitles = submission.bookChapterTitles;
                if (chapterTitles && chapterTitles.length > 0) {
                    await BookChapter.update(
                        { isReadyForPublication: true },
                        {
                            where: {
                                bookTitleId: bookTitleRecord.id,
                                chapterTitle: { [Op.in]: chapterTitles }
                            },
                            transaction
                        }
                    );
                    console.log(`✅ Marked ${chapterTitles.length} chapters as Ready for Publication for "${submission.bookTitle}"`);
                }
            }
        } catch (updateErr) {
            console.error('❌ Error updating BookChapters isReadyForPublication flag:', updateErr);
        }

        await BookChapterStatusHistory.create({
            submissionId: submission.id,
            previousStatus,
            newStatus: BookChapterStatus.PUBLICATION_IN_PROGRESS,
            changedBy: user.id,
            action: 'Publication Started',
            notes: notes || `Publication started by ${user.fullName}`,
            metadata: { editorName: user.fullName },
        }, { transaction });

        await transaction.commit();

        // Notify author
        const displayBookTitle = await resolveDisplayBookTitle(submission.bookTitle);
        const mainAuthor = submission.mainAuthor;

        notificationService.createNotification({
            recipientId: submission.submittedBy,
            senderId: user.id,
            type: NotificationType.WARNING,
            category: NotificationCategory.SUBMISSION,
            title: 'Action Required: Submit Delivery Address',
            message: `Publication has been initiated for "${displayBookTitle}". Please submit your delivery address to proceed with publishing.`,
            relatedEntityId: submission.id,
            relatedEntityType: 'BookChapterSubmission',
        }).catch(console.error);

        const submitter = await User.findByPk(submission.submittedBy);
        notifyAuthorsDeliveryDetailsRequested(submission, submitter, {
            bookTitle: displayBookTitle || submission.bookTitle,
            chapters: await submission.getResolvedChapterTitlesString(),
            notes: notes || 'Publication has been initiated. Please log in and submit your delivery address to proceed with publishing.',
        }).catch(err => console.error('❌ Error sending delivery details request emails:', err));

        return sendSuccess(res, { submission }, 'Publication started successfully');

    } catch (error) {
        await transaction.rollback();
        console.error('❌ Receive ISBN error:', error);
        return sendError(res, 'Failed to record ISBN', 500);
    }
};


/**
 * @route POST /api/book-chapters/chapters/:chapterId/editorial-decision
 * @desc Editor makes per-chapter approve/reject decision after peer review
 * @access Private (Editor/Admin)
 */
export const chapterEditorialDecision = async (req: AuthRequest, res: Response) => {
    const sequelize = BookChapterSubmission.sequelize;
    if (!sequelize) return sendError(res, 'Database connection not initialized', 500);

    const transaction = await sequelize.transaction();
    try {
        const user = req.authenticatedUser;
        const chapterId = parseInt(req.params.chapterId);
        const { decision, notes } = req.body; // 'approve' | 'reject'

        if (!user || (!user.hasRole(UserRole.EDITOR) && !user.isAdminOrDeveloper())) {
            await transaction.rollback();
            return sendError(res, 'Editor or Admin access required', 403);
        }

        if (!decision || !['approve', 'reject'].includes(decision)) {
            await transaction.rollback();
            return sendError(res, 'Decision must be "approve" or "reject"', 400);
        }

        const chapter = await IndividualChapter.findByPk(chapterId, {
            include: [{ model: BookChapterSubmission, as: 'submission' }],
            transaction,
        });

        if (!chapter || !chapter.submission) {
            await transaction.rollback();
            return sendError(res, 'Chapter not found', 404);
        }

        const submission = chapter.submission;

        // Verify authorization
        if (submission.assignedEditorId !== user.id && !user.isAdminOrDeveloper()) {
            await transaction.rollback();
            return sendError(res, 'You are not the assigned editor for this submission', 403);
        }

        // Chapter must be in EDITORIAL_REVIEW for a decision
        if (chapter.status !== ChapterStatus.EDITORIAL_REVIEW) {
            await transaction.rollback();
            return sendError(res, `Chapter must be in EDITORIAL_REVIEW status (current: ${chapter.status})`, 400);
        }

        const previousChapterStatus = chapter.status;
        const newChapterStatus = decision === 'approve'
            ? ChapterStatus.CHAPTER_APPROVED
            : ChapterStatus.CHAPTER_REJECTED;

        chapter.status = newChapterStatus;
        chapter.editorDecision = decision === 'approve' ? 'APPROVED' : 'REJECTED';
        chapter.editorDecisionDate = new Date();
        chapter.editorDecisionNotes = notes || null;
        await chapter.save({ transaction });

        // Create chapter status history
        await ChapterStatusHistory.create({
            chapterId: chapter.id,
            previousStatus: previousChapterStatus,
            newStatus: newChapterStatus,
            changedBy: user.id,
            action: decision === 'approve' ? 'Chapter Approved' : 'Chapter Rejected',
            notes: notes || `Editor ${decision}ed the chapter`,
            metadata: { decision },
        }, { transaction });

        // Send notifications
        const displayBookTitle = await resolveDisplayBookTitle(submission.bookTitle);

        // Step 7 Fix: In-app notification to author
        notificationService.createNotification({
            recipientId: submission.submittedBy,
            senderId: user.id,
            type: decision === 'approve' ? NotificationType.SUCCESS : NotificationType.WARNING,
            category: NotificationCategory.SUBMISSION,
            title: decision === 'approve' ? 'Chapter Approved' : 'Chapter Rejected',
            message: `Your chapter "${chapter.chapterTitle}" in "${displayBookTitle}" has been ${decision === 'approve' ? 'approved' : 'rejected'} by the editor.`,
            relatedEntityId: submission.id,
            relatedEntityType: 'BookChapterSubmission',
        }).catch(console.error);

        // Check if ALL chapters in the submission have been decided
        const allChapters = await IndividualChapter.findAll({
            where: { submissionId: submission.id },
            transaction,
        });

        const allDecided = allChapters.every(
            (ch) => ch.status === ChapterStatus.CHAPTER_APPROVED || ch.status === ChapterStatus.CHAPTER_REJECTED
        );

        if (allDecided) {
            const previousSubmissionStatus = submission.status;

            // When all chapters are decided, the submission moves to EDITORIAL_REVIEW, awaiting the final book decision
            // (Step 7 -> Step 8 transition logic)
            if (previousSubmissionStatus !== BookChapterStatus.EDITORIAL_REVIEW && previousSubmissionStatus !== BookChapterStatus.APPROVED && previousSubmissionStatus !== BookChapterStatus.REJECTED) {
                submission.status = BookChapterStatus.EDITORIAL_REVIEW;
                submission.lastUpdatedBy = user.id;
                await submission.save({ transaction });

                await BookChapterStatusHistory.create({
                    submissionId: submission.id,
                    previousStatus: previousSubmissionStatus,
                    newStatus: BookChapterStatus.EDITORIAL_REVIEW,
                    changedBy: user.id,
                    action: 'All Chapters Decided',
                    notes: 'All chapters have received an editorial decision. Submission moved to Editorial Review phase.',
                    metadata: {},
                }, { transaction });

                // Notify Admin and Editor that all chapters are decided
                try {
                    const { default: notificationService } = await import('../../services/notificationService');
                    const { NotificationType, NotificationCategory } = await import('../../models/notification');

                    // Notify Editor if assigned
                    if (submission.assignedEditorId) {
                        await notificationService.createNotification({
                            recipientId: submission.assignedEditorId,
                            type: NotificationType.INFO,
                            category: NotificationCategory.SYSTEM,
                            title: 'All Chapters Decided',
                            message: `All chapters for "${submission.bookTitle}" have received editorial decisions. Await final book decision.`,
                            relatedEntityId: submission.id,
                            relatedEntityType: 'BookChapterSubmission'
                        });
                    }

                    // We could also notify Admin here if needed.
                } catch (notifyError) {
                    console.error('Failed to send notification for all chapters decided:', notifyError);
                }
            }
        }

        await transaction.commit();

        // Notifications
        const mainAuthor = submission.mainAuthor;

        sendDummyEmail({
            to: mainAuthor.email,
            subject: decision === 'approve'
                ? `Chapter "${chapter.chapterTitle}" Approved`
                : `Chapter "${chapter.chapterTitle}" — Decision`,
            template: 'chapter-editorial-decision',
            data: {
                authorName: mainAuthor.firstName,
                bookTitle: displayBookTitle,
                chapterTitle: chapter.chapterTitle,
                decision,
                notes: notes || '',
            },
        }).catch(console.error);

        return sendSuccess(
            res,
            { chapter, allDecided },
            `Chapter ${decision === 'approve' ? 'approved' : 'rejected'} successfully`
        );
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Chapter editorial decision error:', error);
        return sendError(res, 'Failed to process chapter editorial decision', 500);
    }
};

/**
 * @route POST /api/book-chapters/:id/submit-proof
 * @desc Editor uploads proof document for author confirmation
 * @access Private (Editor/Admin)
 */
export const submitProof = async (req: AuthRequest, res: Response) => {
    const sequelize = BookChapterSubmission.sequelize;
    if (!sequelize) return sendError(res, 'Database connection not initialized', 500);

    const transaction = await sequelize.transaction();
    try {
        const user = req.authenticatedUser;
        const submissionId = parseInt(req.params.id);
        const proofFile = req.file;

        console.log(`[SubmitProof] Request for submissionId: ${submissionId}, User: ${user?.id} (${user?.fullName})`);
        if (proofFile) {
            console.log(`[SubmitProof] File: ${proofFile.originalname}, Size: ${proofFile.size} bytes, Mime: ${proofFile.mimetype}`);
        } else {
            console.warn(`[SubmitProof] No file attached to request`);
        }

        if (!user || (!user.hasRole(UserRole.EDITOR) && !user.hasRole(UserRole.ADMIN))) {
            console.warn(`[SubmitProof] Access denied for user role: ${user?.role}`);
            await transaction.rollback();
            return sendError(res, 'Editor or Admin access required', 403);
        }

        if (!proofFile) {
            await transaction.rollback();
            return sendError(res, 'No proof file uploaded', 400);
        }

        const submission = await BookChapterSubmission.findByPk(submissionId, { transaction });
        if (!submission) {
            console.warn(`[SubmitProof] Submission ${submissionId} not found`);
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        // Verify authorization
        const isAssignedEditor = submission.assignedEditorId === user.id;
        const isAdminOrDev = user.hasRole(UserRole.ADMIN) || user.hasRole(UserRole.DEVELOPER);

        if (!isAssignedEditor && !isAdminOrDev) {
            console.warn(`[SubmitProof] User ${user.id} not authorized for submission ${submissionId}`);
            await transaction.rollback();
            return sendError(res, 'You are not authorized to send proof for this submission', 403);
        }

        console.log(`[SubmitProof] Saving proof document to database: ${proofFile.originalname} (${proofFile.size} bytes)`);

        // Extra validation for file metadata lengths (Sequelize limits)
        if (proofFile.originalname.length > 255) {
            await transaction.rollback();
            return sendError(res, `Filename too long: ${proofFile.originalname.length} characters (Max 255)`, 400);
        }
        if (proofFile.mimetype.length > 100) {
            await transaction.rollback();
            return sendError(res, `MIME type too long: ${proofFile.mimetype.length} characters (Max 100)`, 400);
        }

        // Save file
        const fileRecord = await BookChapterFile.create({
            submissionId: submission.id,
            uploadedBy: user.id,
            fileName: proofFile.originalname,
            fileData: proofFile.buffer,
            fileType: BookChapterFileType.PROOF_DOCUMENT,
            fileSize: proofFile.size,
            mimeType: proofFile.mimetype,
            isActive: true,
        }, { transaction });

        console.log(`[SubmitProof] File saved successfully. File ID: ${fileRecord.id}`);

        // Update submission
        submission.proofStatus = 'SENT';
        submission.lastUpdatedBy = user.id;
        await submission.save({ transaction });

        console.log(`[SubmitProof] Submission updated. Status: SENT`);

        await BookChapterStatusHistory.create({
            submissionId: submission.id,
            previousStatus: submission.status,
            newStatus: submission.status,
            changedBy: user.id,
            action: 'Proof Sent',
            notes: `Proof document "${proofFile.originalname}" sent to author for confirmation.`,
            metadata: { fileId: fileRecord.id },
        }, { transaction });

        await transaction.commit();
        console.log(`[SubmitProof] Transaction committed successfully`);

        // Notify author
        const displayBookTitle = await resolveDisplayBookTitle(submission.bookTitle);
        notificationService.createNotification({
            recipientId: submission.submittedBy,
            senderId: user.id,
            type: NotificationType.INFO,
            category: NotificationCategory.SUBMISSION,
            title: 'Proof for Review',
            message: `The editor has sent the proof for "${displayBookTitle}" for your review. Please confirm or request changes.`,
            relatedEntityId: submission.id,
            relatedEntityType: 'BookChapterSubmission',
        }).catch(err => console.error('[SubmitProof] Notification error:', err));

        // Send email notification to authors
        try {
            const submitterForEmail = await User.findByPk(submission.submittedBy);
            await notifyAuthorsProofSent(submission, submitterForEmail, { bookTitle: displayBookTitle });
            console.log(`[SubmitProof] Email notification sent successfully`);
        } catch (emailError) {
            console.error('❌ [SubmitProof] Error sending proof sent email:', emailError);
        }

        return sendSuccess(res, { submission, file: fileRecord }, 'Proof sent to author successfully');
    } catch (error: any) {
        if (transaction) await transaction.rollback();
        console.error('❌ [SubmitProof] CRITICAL ERROR:', error);
        
        // Extract useful error details
        const errorName = error?.name || 'UnknownError';
        const errorMessage = error?.message || 'Internal Server Error during proof submission';
        
        console.error(`[SubmitProof] Error Name: ${errorName}`);
        console.error(`[SubmitProof] Error Message: ${errorMessage}`);
        
        // Log Sequelize detailed errors if available
        if (error.errors && Array.isArray(error.errors)) {
            error.errors.forEach((e: any, idx: number) => {
                console.error(`[SubmitProof] Validation Error ${idx + 1}: ${e.path} - ${e.message}`);
            });
        }

        // Return descriptive error to client ONLY in this diagnostic phase
        return sendError(res, `Failed to submit proof: ${errorMessage} (${errorName})`, 500);
    }
};


