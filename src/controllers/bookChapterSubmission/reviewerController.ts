import { Response } from 'express';
import { Op } from 'sequelize';
import BookChapterSubmission, { BookChapterStatus } from '../../models/bookChapterSubmission';
import IndividualChapter, { ChapterStatus } from '../../models/individualChapter'; // Import if needed for stats
import BookChapterStatusHistory from '../../models/bookChapterStatusHistory';
import User, { UserRole } from '../../models/user';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendError } from '../../utils/responseHandler';
import { sendDummyEmail } from '../../utils/emailService';
import notificationService from '../../services/notificationService';
import { NotificationType, NotificationCategory } from '../../models/notification';
import BookChapterReviewerAssignment, { ReviewerAssignmentStatus, ReviewerRecommendation } from '../../models/bookChapterReviewerAssignment';
import BookChapterFile from '../../models/bookChapterFile';

import { resolveDisplayBookTitle } from './commonController';
import { 
    sendBookChapterReviewSubmittedEmail, 
    sendBookChapterAllReviewsCompletedEmail 
} from '../../utils/emails/bookChapterEmails';

/**
 * @route GET /api/book-chapters/reviewer/assignments
 * @desc Get all assignments for current reviewer
 * @access Private (Reviewer only)
 */
export const getReviewerAssignments = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;

        if (!user || (!user.hasRole(UserRole.REVIEWER) && !user.hasRole(UserRole.ADMIN) && !user.hasRole(UserRole.DEVELOPER))) {
            return sendError(res, 'Reviewer access required', 403);
        }

        const assignments = await BookChapterReviewerAssignment.findAll({
            where: {
                reviewerId: user.id,
                // Optional: Filter out declined or expired if desired, but good to see history
            },
            include: [
                {
                    model: BookChapterSubmission,
                    as: 'submission',
                    attributes: [
                        'id',
                        'bookTitle',
                        'status',
                        'submissionDate',
                        'abstract',
                        'keywords',
                        'revisionCount',
                        'currentRevisionNumber'
                    ],
                    include: [
                        {
                            model: User, // Include assigned editor
                            as: 'assignedEditor',
                            attributes: ['id', 'fullName', 'email']
                        },
                        {
                            model: BookChapterFile, // Include active files (manuscript)
                            as: 'files',
                            where: { isActive: true },
                            required: false,
                            attributes: ['id', 'fileName', 'fileType', 'fileSize', 'description', 'uploadDate']
                        }
                    ]
                },
            ],
            order: [['assignedDate', 'DESC']],
        });

        return sendSuccess(res, assignments, 'Assignments retrieved successfully');
    } catch (error) {
        console.error('❌ Get reviewer assignments error:', error);
        return sendError(res, 'Failed to fetch assignments', 500);
    }
};

/**
 * @route POST /api/book-chapters/assignments/:assignmentId/respond
 * @desc Reviewer accepts or declines assignment
 * @access Private (Reviewer - assigned only)
 */
export const reviewerRespond = async (req: AuthRequest, res: Response) => {
    // Get sequelize from the model
    const sequelize = BookChapterSubmission.sequelize;

    if (!sequelize) {
        return sendError(res, 'Database connection not initialized', 500);
    }

    const transaction = await sequelize.transaction();

    try {
        const user = req.authenticatedUser;
        const assignmentId = parseInt(req.params.assignmentId);
        const { response, reason } = req.body; // 'accept' | 'decline'

        if (!user || !user.hasRole(UserRole.REVIEWER)) {
            await transaction.rollback();
            return sendError(res, 'Reviewer access required', 403);
        }

        if (isNaN(assignmentId) || !response) {
            await transaction.rollback();
            return sendError(res, 'Assignment ID and response are required', 400);
        }

        if (!['accept', 'decline'].includes(response)) {
            await transaction.rollback();
            return sendError(res, 'Response must be "accept" or "decline"', 400);
        }

        const assignment = await BookChapterReviewerAssignment.findByPk(assignmentId, { transaction });

        if (!assignment) {
            await transaction.rollback();
            return sendError(res, 'Assignment not found', 404);
        }

        // Verify user is the assigned reviewer
        if (assignment.reviewerId !== user.id) {
            await transaction.rollback();
            return sendError(res, 'You are not the assigned reviewer for this assignment', 403);
        }

        // Verify assignment is pending
        if (assignment.status !== ReviewerAssignmentStatus.PENDING) {
            await transaction.rollback();
            return sendError(res, `Assignment is already ${assignment.status}`, 400);
        }

        const submission = await BookChapterSubmission.findByPk(assignment.submissionId, { transaction });

        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        // Update assignment status
        const previousStatus = assignment.status;
        const newStatus =
            response === 'accept'
                ? ReviewerAssignmentStatus.ACCEPTED
                : ReviewerAssignmentStatus.DECLINED;

        assignment.status = newStatus;
        if (response === 'accept') {
            assignment.responseDate = new Date();
        } else {
            assignment.completedDate = new Date(); // Declined is considered "complete" in a sense
            if (reason) assignment.confidentialNotes = reason;
        }
        await assignment.save({ transaction });

        // Update submission status based on all reviewers
        // If ANY reviewer accepts, move to UNDER_REVIEW (if not already)
        // If ALL reviewers decline, move back to ASSIGNED_TO_EDITOR? Or just stay pending?
        // Let's adopt a logic: If at least one Accepted, status = UNDER_REVIEW.

        if (newStatus === ReviewerAssignmentStatus.ACCEPTED) {
            if (submission.status !== BookChapterStatus.UNDER_REVIEW) {
                submission.status = BookChapterStatus.UNDER_REVIEW;
                submission.lastUpdatedBy = user.id;
                await submission.save({ transaction });
            }
        }

        // Create status history for the submission (reflecting reviewer action)
        await BookChapterStatusHistory.create(
            {
                submissionId: submission.id,
                previousStatus: submission.status, // Status might not change
                newStatus: submission.status,
                changedBy: user.id,
                action: response === 'accept' ? 'Review Assignment Accepted' : 'Review Assignment Declined',
                notes: `Reviewer ${user.fullName} ${response}ed the assignment.${reason ? ` Reason: ${reason}` : ''}`,
                metadata: {
                    assignmentId: assignment.id,
                    response,
                    reason,
                },
            },
            { transaction }
        );

        await transaction.commit();

        // Notify editor (async)
        const displayBookTitle = await resolveDisplayBookTitle(submission.bookTitle);
        const resolvedChapterTitles = await submission.getResolvedChapterTitlesString();

        if (submission.assignedEditorId) {
            const editor = await User.findByPk(submission.assignedEditorId);

            if (editor) {
                await notificationService.createNotification({
                    recipientId: editor.id,
                    senderId: user.id,
                    type: response === 'accept' ? NotificationType.SUCCESS : NotificationType.WARNING,
                    category: NotificationCategory.REVIEW,
                    title: response === 'accept' ? 'Reviewer Accepted' : 'Reviewer Declined',
                    message: `${user.fullName} has ${response}ed the review assignment for "${displayBookTitle}".`,
                    relatedEntityId: submission.id,
                    relatedEntityType: 'BookChapterSubmission',
                });

                await sendDummyEmail({
                    to: editor.email,
                    subject: `Reviewer ${response === 'accept' ? 'Accepted' : 'Declined'} Assignment`,
                    template: response === 'accept' ? 'reviewer-accepted' : 'reviewer-declined',
                    data: {
                        editorName: editor.fullName,
                        reviewerName: user.fullName,
                        submissionId: submission.id,
                        bookTitle: displayBookTitle,
                        chapters: resolvedChapterTitles,
                        reason: reason || 'No reason provided',
                    },
                });
            }
        }

        // Step 4 Fix: Notify Admins
        const admins = await User.findAll({ where: { role: UserRole.ADMIN, isActive: true } });
        for (const admin of admins) {
            await notificationService.createNotification({
                recipientId: admin.id,
                senderId: user.id,
                type: response === 'accept' ? NotificationType.SUCCESS : NotificationType.WARNING,
                category: NotificationCategory.REVIEW,
                title: response === 'accept' ? 'Reviewer Accepted' : 'Reviewer Declined',
                message: `${user.fullName} has ${response}ed the review assignment for "${displayBookTitle}".`,
                relatedEntityId: submission.id,
                relatedEntityType: 'BookChapterSubmission',
            });

            if (response === 'decline') {
                await sendDummyEmail({
                    to: admin.email,
                    subject: 'Reviewer Declined Assignment',
                    template: 'reviewer-declined-admin',
                    data: {
                        adminName: admin.fullName,
                        reviewerName: user.fullName,
                        submissionId: submission.id,
                        bookTitle: displayBookTitle,
                        chapters: resolvedChapterTitles,
                        reason: reason || 'No reason provided',
                    },
                });
            }
        }


        return sendSuccess(
            res,
            assignment,
            `Assignment ${response}ed successfully`
        );
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Reviewer respond error:', error);
        return sendError(res, 'Failed to process response', 500);
    }
};

/**
 * @route POST /api/book-chapters/assignments/:assignmentId/complete
 * @desc Reviewer completes review with final recommendation
 * @access Private (Reviewer - assigned only)
 */
export const completeReview = async (req: AuthRequest, res: Response) => {
    // Get sequelize from the model
    const sequelize = BookChapterSubmission.sequelize;

    if (!sequelize) {
        return sendError(res, 'Database connection not initialized', 500);
    }

    const transaction = await sequelize.transaction();

    try {
        const user = req.authenticatedUser;

        if (!user || (!user.hasRole(UserRole.REVIEWER) && !user.isAdminOrDeveloper())) { // Admin can force complete?
            await transaction.rollback();
            return sendError(res, 'Reviewer access required', 403);
        }

        const assignmentId = parseInt(req.params.assignmentId);
        const { recommendation, reviewerComments, confidentialNotes } = req.body;
        // recommendation: 'APPROVE' | 'REJECT' | 'REVISION_NEEDED'

        if (isNaN(assignmentId) || !recommendation || !reviewerComments) {
            await transaction.rollback();
            return sendError(res, 'Assignment ID, recommendation, and comments are required', 400);
        }

        if (!['APPROVE', 'REJECT', 'REVISION_NEEDED'].includes(recommendation)) {
            await transaction.rollback();
            return sendError(
                res,
                'Recommendation must be APPROVE, REJECT, or REVISION_NEEDED',
                400
            );
        }

        const assignment = await BookChapterReviewerAssignment.findByPk(assignmentId, { transaction });

        if (!assignment) {
            await transaction.rollback();
            return sendError(res, 'Assignment not found', 404);
        }

        // Verify user is the assigned reviewer (or admin)
        if (assignment.reviewerId !== user.id && !user.isAdminOrDeveloper()) {
            await transaction.rollback();
            return sendError(res, 'You are not the assigned reviewer for this assignment', 403);
        }

        // Verify assignment is in progress
        if (assignment.status !== ReviewerAssignmentStatus.IN_PROGRESS &&
            assignment.status !== ReviewerAssignmentStatus.ACCEPTED) {
            await transaction.rollback();
            return sendError(res, 'This assignment is not in progress', 400);
        }

        const submission = await BookChapterSubmission.findByPk(assignment.submissionId, {
            transaction,
        });

        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        // Update assignment
        assignment.status = ReviewerAssignmentStatus.COMPLETED;
        assignment.completedDate = new Date();
        assignment.recommendation = recommendation as ReviewerRecommendation;
        assignment.reviewerComments = reviewerComments;
        if (confidentialNotes) {
            assignment.confidentialNotes = confidentialNotes;
        }
        await assignment.save({ transaction });

        // Check if all reviewers have completed
        const allAssignments = await BookChapterReviewerAssignment.findAll({
            where: {
                submissionId: submission.id,
                status: { [Op.ne]: ReviewerAssignmentStatus.DECLINED }
            },
            transaction,
        });

        const allCompleted = allAssignments.every(
            a => a.status === ReviewerAssignmentStatus.COMPLETED
        );

        let statusChanged = false;
        let newStatus = submission.status;

        if (allCompleted) {
            // All reviewers completed - move to EDITORIAL_REVIEW
            const previousStatus = submission.status;
            newStatus = BookChapterStatus.EDITORIAL_REVIEW;
            submission.status = newStatus;
            submission.lastUpdatedBy = user.id;
            await submission.save({ transaction });
            statusChanged = true;

            // Create status history
            await BookChapterStatusHistory.create(
                {
                    submissionId: submission.id,
                    previousStatus,
                    newStatus,
                    changedBy: user.id,
                    action: 'All Reviews Completed',
                    notes: 'All reviewers have completed their reviews',
                    metadata: {
                        reviewerCount: allAssignments.length,
                        recommendations: allAssignments.map(a => ({
                            reviewerId: a.reviewerId,
                            recommendation: a.recommendation,
                        })),
                    },
                },
                { transaction }
            );
        } else {
            // Create history entry for single reviewer completion
            await BookChapterStatusHistory.create(
                {
                    submissionId: submission.id,
                    previousStatus: submission.status,
                    newStatus: submission.status,
                    changedBy: user.id,
                    action: 'Reviewer Completed Review',
                    notes: `Reviewer ${user.fullName} completed their review with recommendation: ${recommendation}`,
                    metadata: {
                        reviewerId: user.id,
                        recommendation
                    },
                },
                { transaction }
            );
        }

        await transaction.commit();

        // Identify unique notification recipients (Editor + Admins)
        const recipientIds = new Set<number>();
        const potentialEditorIds = [
            submission.assignedEditorId,
            submission.designatedEditorId,
            assignment.assignedBy
        ].filter(id => id) as number[];

        // Use the first available editor for the primary 'Editor' notification
        const primaryEditorId = potentialEditorIds[0];
        const primaryEditor = primaryEditorId ? await User.findByPk(primaryEditorId) : null;

        const displayBookTitle = await resolveDisplayBookTitle(submission.bookTitle);
        const resolvedChapterTitles = await submission.getResolvedChapterTitlesString();
        const notificationPromises: Promise<any>[] = [];

        if (primaryEditor) {
            recipientIds.add(primaryEditor.id);
            if (allCompleted) {
                const reviewSummary = allAssignments.map(a => ({
                    reviewerName: a.reviewerId === user.id ? user.fullName : 'Other Reviewer',
                    recommendation: a.recommendation,
                }));

                notificationPromises.push(
                    notificationService.createNotification({
                        recipientId: primaryEditor.id,
                        senderId: user.id,
                        type: NotificationType.SUCCESS,
                        category: NotificationCategory.REVIEW,
                        title: 'All Reviews Completed',
                        message: `All assigned reviews for "${displayBookTitle}" have been completed.`,
                        relatedEntityId: submission.id,
                        relatedEntityType: 'BookChapterSubmission',
                    }),
                    sendBookChapterAllReviewsCompletedEmail(
                        primaryEditor.email,
                        primaryEditor.fullName,
                        {
                            bookTitle: displayBookTitle,
                            chapters: resolvedChapterTitles,
                            authorName: submission.getMainAuthorName(),
                            reviewSummaryHtml: reviewSummary.map(r => `${r.reviewerName}: ${r.recommendation}`).join('<br>'),
                            submissionId: submission.id
                        }
                    )
                );
            } else {
                notificationPromises.push(
                    notificationService.createNotification({
                        recipientId: primaryEditor.id,
                        senderId: user.id,
                        type: NotificationType.INFO,
                        category: NotificationCategory.REVIEW,
                        title: 'Reviewer Completed Review',
                        message: `Reviewer ${user.fullName} has completed their review for "${displayBookTitle}".`,
                        relatedEntityId: submission.id,
                        relatedEntityType: 'BookChapterSubmission',
                    }),
                    sendBookChapterReviewSubmittedEmail(
                        primaryEditor.email,
                        primaryEditor.fullName,
                        {
                            reviewerName: user.fullName,
                            bookTitle: displayBookTitle,
                            chapterTitle: resolvedChapterTitles,
                            recommendation,
                            submissionId: submission.id
                        }
                    )
                );
            }
        }

        // 2. Notify Admins
        if (allCompleted) {
            const reviewSummary = allAssignments.map(a => ({
                reviewerName: a.reviewerId === user.id ? user.fullName : 'Other Reviewer',
                recommendation: a.recommendation,
            }));

            const admins = await User.findAll({ where: { role: UserRole.ADMIN, isActive: true } });
            admins.forEach(admin => {
                if (!recipientIds.has(admin.id) && admin.id !== user.id) {
                    recipientIds.add(admin.id);
                    notificationPromises.push(
                        notificationService.createNotification({
                            recipientId: admin.id,
                            senderId: user.id,
                            type: NotificationType.INFO,
                            category: NotificationCategory.REVIEW,
                            title: 'All Reviews Completed',
                            message: `All reviewers have completed their task for "${displayBookTitle}".`,
                            relatedEntityId: submission.id,
                            relatedEntityType: 'BookChapterSubmission',
                        }),
                        sendDummyEmail({
                            to: admin.email,
                            subject: `All Reviews Completed: ${displayBookTitle}`,
                            template: 'reviews-completed-admin',
                            data: {
                                adminName: admin.fullName,
                                submissionId: submission.id,
                                bookTitle: displayBookTitle,
                                chapters: resolvedChapterTitles,
                                reviewSummary,
                            },
                        })
                    );
                }
            });
        }

        // Execute all notifications and wait for them to finish
        try {
            await Promise.all(notificationPromises);
        } catch (err) {
            console.error('❌ Error sending reviewer completion notifications:', err);
        }

        return sendSuccess(
            res,
            {
                assignment,
                submission,
                allCompleted,
                message: allCompleted
                    ? 'All reviews completed. Editor can now make final decision.'
                    : 'Review completed successfully. Waiting for other reviewers.',
            },
            'Review completed successfully'
        );

    } catch (error) {
        await transaction.rollback();
        console.error('❌ Complete review error:', error);
        return sendError(res, 'Failed to complete review', 500);
    }
};

/**
 * @route POST /api/book-chapters/:id/request-revision
 * @desc Reviewer requests revision from author
 * @access Private (Reviewer)
 */
export const requestRevision = async (req: AuthRequest, res: Response) => {
    // Get sequelize from the model
    const sequelize = BookChapterSubmission.sequelize;

    if (!sequelize) {
        return sendError(res, 'Database connection not initialized', 500);
    }

    const transaction = await sequelize.transaction();

    try {
        const user = req.authenticatedUser;
        const submissionId = parseInt(req.params.id);
        const { comments, requiredChanges } = req.body;

        if (!user || (!user.hasRole(UserRole.REVIEWER) && !user.hasRole(UserRole.ADMIN) && !user.hasRole(UserRole.DEVELOPER))) {
            await transaction.rollback();
            return sendError(res, 'Reviewer access required', 403);
        }

        if (isNaN(submissionId) || !comments || !requiredChanges) {
            await transaction.rollback();
            return sendError(res, 'Comments and required changes are required', 400);
        }

        const submission = await BookChapterSubmission.findByPk(submissionId, { transaction });

        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        // Check if user is assigned Reviewer
        const assignment = await BookChapterReviewerAssignment.findOne({
            where: {
                submissionId,
                reviewerId: user.id,
                status: { [Op.in]: [ReviewerAssignmentStatus.ACCEPTED, ReviewerAssignmentStatus.IN_PROGRESS] }
            },
            transaction
        });

        if (!assignment && !user.isAdminOrDeveloper()) {
            await transaction.rollback();
            return sendError(res, 'You are not an active reviewer for this submission, or you have already completed your review.', 403);
        }

        // Check if Revisions allowed
        if (!submission.canRequestRevision()) {
            await transaction.rollback();
            return sendError(res, 'Maximum revision limit (3) reached or submission status invalid for revision request', 400);
        }

        // Valid statuses for requesting revision: UNDER_REVIEW
        // Actually strict UNDER_REVIEW is best
        if (submission.status !== BookChapterStatus.UNDER_REVIEW) {
            await transaction.rollback();
            return sendError(res, 'Submission must be under review to request revisions', 400);
        }

        // Update assignment to IN_PROGRESS (if not already)
        if (assignment && assignment.status !== ReviewerAssignmentStatus.IN_PROGRESS) {
            assignment.status = ReviewerAssignmentStatus.IN_PROGRESS;
            await assignment.save({ transaction });
        }

        // NOTE: In some workflows, Reviewer Requesting Revision updates status to REVISION_REQUESTED immediately.
        // In others, it's a recommendation to Editor.
        // Based on `bookChapterSubmissionController.ts`, it seems to update status directly.

        const previousStatus = submission.status;
        // Revisions are now handled at the chapter level; submission stays UNDER_REVIEW
        submission.lastUpdatedBy = user.id;
        await submission.save({ transaction });

        // Create status history
        await BookChapterStatusHistory.create(
            {
                submissionId: submission.id,
                previousStatus: previousStatus,
                newStatus: BookChapterStatus.UNDER_REVIEW,
                changedBy: user.id,
                action: 'Revision Requested',
                notes: `Reviewer requested revision`,
                metadata: {
                    comments,
                    requiredChanges,
                    reviewerId: user.id
                },
            },
            { transaction }
        );

        // If we want to store the request details specifically linked to assignment?
        // Maybe update assignment notes?
        if (assignment) {
            assignment.reviewerComments = (assignment.reviewerComments ? assignment.reviewerComments + '\n\n' : '') + `[Revision Request]: ${comments}\n[Changes]: ${requiredChanges}`;
            await assignment.save({ transaction });
        }

        await transaction.commit();

        // Notify Author
        const displayBookTitle = await resolveDisplayBookTitle(submission.bookTitle);
        const resolvedChapterTitles = await submission.getResolvedChapterTitlesString();
        const mainAuthor = submission.mainAuthor;

        const editor = submission.assignedEditorId ? await User.findByPk(submission.assignedEditorId) : null;

        try {
            await Promise.all([
                // In-app notification to Author (Step 5 Fix)
                notificationService.createNotification({
                    recipientId: submission.submittedBy,
                    senderId: user.id,
                    type: NotificationType.WARNING,
                    category: NotificationCategory.REVIEW,
                    title: 'Revision Requested',
                    message: `The reviewer has requested a revision for your submission "${displayBookTitle}".`,
                    relatedEntityId: submission.id,
                    relatedEntityType: 'BookChapterSubmission',
                }),
                // Email to Author
                sendDummyEmail({
                    to: mainAuthor.email,
                    subject: 'Revision Requested for Your Book Chapter',
                    template: 'revision-requested',
                    data: {
                        authorName: mainAuthor.firstName,
                        submissionId: submission.id,
                        bookTitle: displayBookTitle,
                        chapters: resolvedChapterTitles,
                        reviewerComments: comments,
                        requiredChanges: requiredChanges,
                        uploadLink: `${process.env.FRONTEND_URL}/author/submissions/${submission.id}/upload-revision`,
                        deadlineDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString() // +14 days default
                    },
                }),
                // Email to Editor
                editor ? sendDummyEmail({
                    to: editor.email,
                    subject: 'Reviewer Requested Revision',
                    template: 'revision-requested-editor', // assumption
                    data: {
                        editorName: editor.fullName,
                        submissionId: submission.id,
                        bookTitle: displayBookTitle,
                        chapters: resolvedChapterTitles,
                        revisionNumber: submission.revisionCount,
                        reviewerName: user.fullName,
                    },
                }) : Promise.resolve(),
            ]);
        } catch (err) {
            console.error('❌ Error sending revision request notifications:', err);
        }

        return sendSuccess(
            res,
            { submission, revisionCount: submission.revisionCount },
            `Revision ${submission.revisionCount} requested successfully`
        );
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Request revision error:', error);
        return sendError(res, 'Failed to request revision', 500);
    }
};

/**
 * @route POST /api/book-chapters/assignments/:assignmentId/start
 * @desc Reviewer starts review status
 * @access Private (Reviewer - assigned only)
 */
export const startReview = async (req: AuthRequest, res: Response) => {
    // Get sequelize from the model
    const sequelize = BookChapterSubmission.sequelize;

    if (!sequelize) {
        return sendError(res, 'Database connection not initialized', 500);
    }

    const transaction = await sequelize.transaction();

    try {
        const user = req.authenticatedUser;
        const assignmentId = parseInt(req.params.assignmentId);

        if (!user || !user.hasRole(UserRole.REVIEWER)) {
            await transaction.rollback();
            return sendError(res, 'Reviewer access required', 403);
        }

        if (isNaN(assignmentId)) {
            await transaction.rollback();
            return sendError(res, 'Invalid assignment ID', 400);
        }

        const assignment = await BookChapterReviewerAssignment.findByPk(assignmentId, { transaction });

        if (!assignment) {
            await transaction.rollback();
            return sendError(res, 'Assignment not found', 404);
        }

        // Verify user is the assigned reviewer
        if (assignment.reviewerId !== user.id) {
            await transaction.rollback();
            return sendError(res, 'You are not the assigned reviewer for this assignment', 403);
        }

        // Verify assignment is ACCEPTED
        if (assignment.status !== ReviewerAssignmentStatus.ACCEPTED &&
            assignment.status !== ReviewerAssignmentStatus.IN_PROGRESS) {
            await transaction.rollback();
            return sendError(res, 'Assignment must be ACCEPTED to start review', 400);
        }

        // If already in progress, just return success
        if (assignment.status === ReviewerAssignmentStatus.IN_PROGRESS) {
            await transaction.commit();
            return sendSuccess(res, assignment, 'Review already started');
        }

        // Update assignment status
        assignment.status = ReviewerAssignmentStatus.IN_PROGRESS;
        await assignment.save({ transaction });

        const submission = await BookChapterSubmission.findByPk(assignment.submissionId, { transaction });
        if (submission && submission.status !== BookChapterStatus.UNDER_REVIEW) {
            const previousStatus = submission.status;
            submission.status = BookChapterStatus.UNDER_REVIEW;
            submission.lastUpdatedBy = user.id;
            await submission.save({ transaction });

            await BookChapterStatusHistory.create({
                submissionId: submission.id,
                previousStatus,
                newStatus: BookChapterStatus.UNDER_REVIEW,
                changedBy: user.id,
                action: 'Review Started',
                notes: `Reviewer ${user.fullName} started review.`,
                metadata: { assignmentId }
            }, { transaction });
        }

        await transaction.commit();

        return sendSuccess(res, assignment, 'Review started successfully');
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Start review error:', error);
        return sendError(res, 'Failed to start review', 500);
    }
};
