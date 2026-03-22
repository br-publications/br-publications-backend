import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import chapterService from '../services/chapterService';
import { ChapterStatus } from '../models/individualChapter';
import { sendSuccess, sendError } from '../utils/responseHandler';
import notificationService from '../services/notificationService';
import { NotificationType, NotificationCategory } from '../models/notification';
import IndividualChapter from '../models/individualChapter';
import BookChapterSubmission from '../models/bookChapterSubmission';
import User, { UserRole } from '../models/user';


/**
 * Get all chapters for a submission
 */
export const getSubmissionChapters = async (req: AuthRequest, res: Response) => {
    try {
        const { submissionId } = req.params;

        const chapters = await chapterService.getChaptersBySubmission(Number(submissionId));

        return sendSuccess(res, chapters, 'Chapters retrieved successfully');
    } catch (error: any) {
        console.error('Error fetching chapters:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * Get a single chapter by ID
 */
export const getChapter = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const chapter = await chapterService.getChapterById(Number(id));

        if (!chapter) {
            return sendError(res, 'Chapter not found', 404);
        }

        return sendSuccess(res, chapter, 'Chapter retrieved successfully');
    } catch (error: any) {
        console.error('Error fetching chapter:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * Get chapter progress for a submission
 */
export const getChapterProgress = async (req: AuthRequest, res: Response) => {
    try {
        const { submissionId } = req.params;

        const progress = await chapterService.getChapterProgress(Number(submissionId));

        return sendSuccess(res, progress, 'Chapter progress retrieved successfully');
    } catch (error: any) {
        console.error('Error fetching chapter progress:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * Upload manuscript for a chapter
 */
export const uploadManuscript = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { fileId } = req.body;
        const userId = req.authenticatedUser?.id;

        if (!userId) {
            return sendError(res, 'User not authenticated', 401);
        }

        if (!fileId) {
            return sendError(res, 'File ID is required', 400);
        }

        const chapter = await chapterService.uploadManuscript(Number(id), fileId, userId);

        return sendSuccess(res, chapter, 'Manuscript uploaded successfully');
    } catch (error: any) {
        console.error('Error uploading manuscript:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * Accept chapter abstract (Editor/Admin only)
 */
export const acceptAbstract = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;
        const userId = req.authenticatedUser?.id;

        if (!userId) {
            return sendError(res, 'User not authenticated', 401);
        }

        const chapter = await chapterService.updateChapterStatus(
            Number(id),
            ChapterStatus.MANUSCRIPTS_PENDING,
            userId,
            notes || 'Abstract accepted'
        );

        // Send notification to author
        const submission = await BookChapterSubmission.findByPk(chapter.submissionId);
        if (submission) {
            notificationService.createNotification({
                recipientId: submission.submittedBy,
                senderId: userId,
                type: NotificationType.SUCCESS,
                category: NotificationCategory.SUBMISSION,
                title: 'Abstract Accepted',
                message: `Your abstract for chapter "${chapter.chapterTitle}" has been accepted. Please upload the full manuscript.`,
                relatedEntityId: chapter.id,
                relatedEntityType: 'IndividualChapter',
            }).catch(err => console.error('Error sending abstract acceptance notification:', err));
        }

        return sendSuccess(res, chapter, 'Abstract accepted successfully');
    } catch (error: any) {
        console.error('Error accepting abstract:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * Reject chapter abstract (Editor/Admin only)
 */
export const rejectAbstract = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;
        const userId = req.authenticatedUser?.id;

        if (!userId) {
            return sendError(res, 'User not authenticated', 401);
        }

        if (!notes) {
            return sendError(res, 'Rejection reason is required', 400);
        }

        const chapter = await chapterService.updateChapterStatus(
            Number(id),
            ChapterStatus.CHAPTER_REJECTED,
            userId,
            notes
        );

        return sendSuccess(res, chapter, 'Abstract rejected');
    } catch (error: any) {
        console.error('Error rejecting abstract:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * Assign reviewers to a chapter (Editor only)
 */
export const assignReviewers = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { reviewerIds, deadline } = req.body;
        const userId = req.authenticatedUser?.id;

        if (!userId) {
            return sendError(res, 'User not authenticated', 401);
        }

        if (!reviewerIds || !Array.isArray(reviewerIds) || reviewerIds.length === 0) {
            return sendError(res, 'Reviewer IDs are required', 400);
        }

        if (reviewerIds.length > 2) {
            return sendError(res, 'Maximum 2 reviewers allowed per chapter', 400);
        }

        const deadlineDate = deadline ? new Date(deadline) : undefined;

        const assignments = await chapterService.assignReviewers(
            Number(id),
            reviewerIds,
            userId,
            deadlineDate
        );

        return sendSuccess(res, assignments, 'Reviewers assigned successfully');
    } catch (error: any) {
        console.error('Error assigning reviewers:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * Reviewer accepts/rejects assignment
 */
export const reviewerResponse = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params; // assignment ID
        const { action, reason } = req.body; // 'accept' or 'reject'
        const userId = req.authenticatedUser?.id;

        if (!userId) {
            return sendError(res, 'User not authenticated', 401);
        }

        if (!action || !['accept', 'reject'].includes(action)) {
            return sendError(res, 'Invalid action. Must be "accept" or "reject"', 400);
        }

        const ChapterReviewerAssignment = (await import('../models/chapterReviewerAssignment')).default;
        const assignment = await ChapterReviewerAssignment.findByPk(Number(id), {
            include: [{ model: IndividualChapter, as: 'chapter' }]
        });

        if (!assignment || !assignment.chapter) {
            return sendError(res, 'Assignment or chapter not found', 404);
        }

        if (assignment.reviewerId !== userId) {
            return sendError(res, 'Unauthorized', 403);
        }

        const chapter = assignment.chapter;
        const { bookTitle: resolvedBookTitle, chapterTitle: resolvedChapterTitle, submission } = await chapterService.resolveTitles(chapter);
        const reviewerName = req.authenticatedUser?.fullName || 'Reviewer';

        if (action === 'accept') {
            await assignment.accept();

            // Notify Editor
            notificationService.createNotification({
                recipientId: assignment.assignedBy,
                senderId: userId,
                type: NotificationType.SUCCESS,
                category: NotificationCategory.REVIEW,
                title: 'Review Assignment Accepted',
                message: `Reviewer ${reviewerName} has accepted the assignment for "${resolvedChapterTitle}".`,
                relatedEntityId: chapter.id,
                relatedEntityType: 'IndividualChapter',
            }).catch(console.error);

            // Notify Admin
            const admins = await User.findAll({ where: { role: UserRole.ADMIN, isActive: true } });
            for (const admin of admins) {
                notificationService.createNotification({
                    recipientId: admin.id,
                    senderId: userId,
                    type: NotificationType.SUCCESS,
                    category: NotificationCategory.REVIEW,
                    title: 'Review Assignment Accepted',
                    message: `Reviewer ${reviewerName} has accepted an assignment for "${resolvedChapterTitle}" in "${resolvedBookTitle}".`,
                    relatedEntityId: chapter.id,
                    relatedEntityType: 'IndividualChapter',
                }).catch(console.error);
            }

            // Email Notifications
            const { sendBookChapterReviewerResponseEmail } = await import('../utils/emails/bookChapterEmails');
            const assigner = await User.findByPk(assignment.assignedBy);

            // To Assigner (Editor)
            if (assigner && submission) {
                sendBookChapterReviewerResponseEmail(assigner.email, assigner.fullName, {
                    reviewerName,
                    action: 'Accepted',
                    bookTitle: resolvedBookTitle,
                    chapterTitle: resolvedChapterTitle,
                    submissionId: submission.id
                }).catch(console.error);
            }

            // Advance chapter status
            if (chapter.status === ChapterStatus.REVIEWER_ASSIGNMENT) {
                await chapterService.updateChapterStatus(
                    chapter.id,
                    ChapterStatus.UNDER_REVIEW,
                    userId,
                    'Reviewer has accepted the assignment. Peer review in progress.'
                );
            }

            return sendSuccess(res, assignment, 'Assignment accepted');
        } else {
            if (!reason) {
                return sendError(res, 'Rejection reason is required', 400);
            }
            await assignment.reject(reason);

            // Notify Editor
            notificationService.createNotification({
                recipientId: assignment.assignedBy,
                senderId: userId,
                type: NotificationType.WARNING,
                category: NotificationCategory.REVIEW,
                title: 'Review Assignment Declined',
                message: `Reviewer ${reviewerName} has declined the assignment for "${resolvedChapterTitle}". Reason: ${reason}`,
                relatedEntityId: chapter.id,
                relatedEntityType: 'IndividualChapter',
            }).catch(console.error);

            // Notify Admin
            const admins = await User.findAll({ where: { role: UserRole.ADMIN, isActive: true } });
            for (const admin of admins) {
                notificationService.createNotification({
                    recipientId: admin.id,
                    senderId: userId,
                    type: NotificationType.WARNING,
                    category: NotificationCategory.REVIEW,
                    title: 'Review Assignment Declined',
                    message: `Reviewer ${reviewerName} has declined an assignment for "${resolvedChapterTitle}". Reason: ${reason}`,
                    relatedEntityId: chapter.id,
                    relatedEntityType: 'IndividualChapter',
                }).catch(console.error);
            }

            // Email Notifications
            const { sendBookChapterReviewerResponseEmail } = await import('../utils/emails/bookChapterEmails');
            const assigner = await User.findByPk(assignment.assignedBy);

            // To Assigner (Editor)
            if (assigner && submission) {
                sendBookChapterReviewerResponseEmail(assigner.email, assigner.fullName, {
                    reviewerName,
                    action: 'Declined',
                    bookTitle: resolvedBookTitle,
                    chapterTitle: resolvedChapterTitle,
                    reason,
                    submissionId: submission.id
                }).catch(console.error);
            }

            return sendSuccess(res, assignment, 'Assignment rejected');
        }
    } catch (error: any) {
        console.error('Error processing reviewer response:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * Save review draft for a chapter (Reviewer only)
 */
export const saveReviewDraft = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params; // assignment ID
        const { recommendation, comments, confidentialComments } = req.body;
        const userId = req.authenticatedUser?.id;

        if (!userId) {
            return sendError(res, 'User not authenticated', 401);
        }

        const ChapterReviewerAssignment = (await import('../models/chapterReviewerAssignment')).default;
        const assignment = await ChapterReviewerAssignment.findByPk(Number(id));

        if (!assignment) {
            return sendError(res, 'Assignment not found', 404);
        }

        if (assignment.reviewerId !== userId) {
            return sendError(res, 'Unauthorized', 403);
        }

        await assignment.saveDraft(recommendation, comments, confidentialComments);

        return sendSuccess(res, assignment, 'Review draft saved successfully');
    } catch (error: any) {
        console.error('Error saving review draft:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * Submit review for a chapter (Reviewer only)
 */
export const submitReview = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params; // assignment ID
        const { recommendation, comments, confidentialComments } = req.body;
        const userId = req.authenticatedUser?.id;

        if (!userId) {
            return sendError(res, 'User not authenticated', 401);
        }

        if (!recommendation || !comments) {
            return sendError(res, 'Recommendation and comments are required', 400);
        }

        const validRecommendations = ['ACCEPT', 'REJECT', 'MAJOR_REVISION', 'MINOR_REVISION'];
        if (!validRecommendations.includes(recommendation)) {
            return sendError(res, 'Invalid recommendation', 400);
        }

        const ChapterReviewerAssignment = (await import('../models/chapterReviewerAssignment')).default;
        const assignment = await ChapterReviewerAssignment.findByPk(Number(id));

        if (!assignment) {
            return sendError(res, 'Assignment not found', 404);
        }

        await assignment.submitReview(recommendation, comments, confidentialComments);

        // Force transition to UNDER_REVIEW if still in REVIEWER_ASSIGNMENT
        // (Safeguard in case the accept transition was missed)
        const chapter = await IndividualChapter.findByPk(assignment.chapterId);
        if (!chapter) {
            return sendError(res, 'Chapter not found', 404);
        }
        if (chapter.status === ChapterStatus.REVIEWER_ASSIGNMENT) {
            await chapterService.updateChapterStatus(
                assignment.chapterId,
                ChapterStatus.UNDER_REVIEW,
                userId,
                'Review submitted. Advancing chapter status to Under Review.'
            );
        }

        // Check if all assigned reviewers have completed their reviews
        const allAssignments = await ChapterReviewerAssignment.findAll({
            where: { chapterId: assignment.chapterId }
        });

        // Consider 'COMPLETED' or 'REJECTED' (declined) as done. 
        // Only trigger if all non-rejected assignments are COMPLETED.
        // Or simpler: If all current assignments are either COMPLETED or REJECTED.
        const allDone = allAssignments.every((a: any) =>
            a.status === 'COMPLETED' || a.status === 'REJECTED'
        );

        if (allDone) {
            await chapterService.updateChapterStatus(
                assignment.chapterId,
                ChapterStatus.EDITORIAL_REVIEW,
                userId,
                'All reviewers have submitted their reviews.'
            );
        }

        // Notify Editor and Admins with premium emails and awaited promises
        const notificationPromises: Promise<any>[] = [];
        const recipientIds = new Set<number>();

        // 1. Resolve Display Titles
        const { bookTitle: resolvedBookTitle, chapterTitle: resolvedChapterTitle, submission } = await chapterService.resolveTitles(chapter);

        // 2. Resolve potential editors: assigner or submission's assigned/designated editors
        const potentialEditorIds = [
            assignment.assignedBy,
            submission?.assignedEditorId,
            submission?.designatedEditorId
        ].filter(id => id) as number[];

        const primaryEditorId = potentialEditorIds[0];
        const primaryEditor = primaryEditorId ? await User.findByPk(primaryEditorId) : null;

        if (primaryEditor) {
            recipientIds.add(primaryEditor.id);
            notificationPromises.push(
                notificationService.createNotification({
                    recipientId: primaryEditor.id,
                    senderId: userId,
                    type: NotificationType.SUCCESS,
                    category: NotificationCategory.REVIEW,
                    title: 'Chapter Review Submitted',
                    message: `Review submitted for chapter "${resolvedChapterTitle}". Recommendation: ${recommendation}`,
                    relatedEntityId: assignment.chapterId,
                    relatedEntityType: 'IndividualChapter',
                }),
                // Send Premium Email
                (async () => {
                    const { sendBookChapterReviewSubmittedEmail } = await import('../utils/emails/bookChapterEmails');
                    return sendBookChapterReviewSubmittedEmail(primaryEditor.email, primaryEditor.fullName, {
                        reviewerName: req.authenticatedUser?.fullName || 'Reviewer',
                        bookTitle: resolvedBookTitle,
                        chapterTitle: resolvedChapterTitle,
                        recommendation,
                        submissionId: submission?.id || 0
                    });
                })()
            );
        }

        // 3. Notify Admins
        const admins = await User.findAll({ where: { role: UserRole.ADMIN, isActive: true } });
        for (const admin of admins) {
            if (!recipientIds.has(admin.id) && admin.id !== userId) {
                recipientIds.add(admin.id);
                notificationPromises.push(
                    notificationService.createNotification({
                        recipientId: admin.id,
                        senderId: userId,
                        type: NotificationType.SUCCESS,
                        category: NotificationCategory.REVIEW,
                        title: 'Chapter Review Submitted',
                        message: `A reviewer has submitted a review for "${resolvedChapterTitle}". Recommendation: ${recommendation}`,
                        relatedEntityId: assignment.chapterId,
                        relatedEntityType: 'IndividualChapter',
                    })
                );
            }
        }

        // Execute all notifications and wait
        try {
            await Promise.all(notificationPromises);
        } catch (err) {
            console.error('❌ Error sending chapter review notifications:', err);
        }



        return sendSuccess(res, assignment, 'Review submitted successfully');
    } catch (error: any) {
        console.error('Error submitting review:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * Request revision for a chapter (Reviewer/Editor)
 */
export const requestRevision = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { reviewerComments } = req.body;
        const userId = req.authenticatedUser?.id;

        if (!userId) {
            return sendError(res, 'User not authenticated', 401);
        }

        if (!reviewerComments) {
            return sendError(res, 'Reviewer comments are required', 400);
        }

        const revision = await chapterService.requestRevision(
            Number(id),
            userId,
            reviewerComments
        );

        return sendSuccess(res, revision, 'Revision requested successfully');
    } catch (error: any) {
        console.error('Error requesting revision:', error);
        // Return 400 for business logic errors (like limit reached)
        return sendError(res, error.message, 400);
    }
};

/**
 * Submit revision for a chapter (Author)
 */
export const submitRevision = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params; // revision ID
        const { fileId, authorResponse } = req.body;
        const userId = req.authenticatedUser?.id;

        if (!userId) {
            return sendError(res, 'User not authenticated', 401);
        }

        if (!fileId) {
            return sendError(res, 'File ID is required', 400);
        }

        const ChapterRevision = (await import('../models/chapterRevision')).default;
        const revision = await ChapterRevision.findByPk(Number(id));

        if (!revision) {
            return sendError(res, 'Revision not found', 404);
        }

        await revision.submit(fileId, authorResponse);

        // Update chapter status
        await chapterService.updateChapterStatus(
            revision.chapterId,
            ChapterStatus.REVISION_SUBMITTED,
            userId,
            'Revision submitted'
        );

        return sendSuccess(res, revision, 'Revision submitted successfully');
    } catch (error: any) {
        console.error('Error submitting revision:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * Make editor decision on a chapter (Editor only)
 */
export const editorDecision = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { decision, notes } = req.body;
        const userId = req.authenticatedUser?.id;

        if (!userId) {
            return sendError(res, 'User not authenticated', 401);
        }

        if (!decision || !['APPROVED', 'REJECTED'].includes(decision)) {
            return sendError(res, 'Invalid decision. Must be "APPROVED" or "REJECTED"', 400);
        }

        if (decision === 'REJECTED' && !notes) {
            return sendError(res, 'Decision notes are mandatory when rejecting', 400);
        }

        const chapter = await chapterService.makeEditorDecision(
            Number(id),
            decision,
            userId,
            notes
        );

        return sendSuccess(res, chapter, `Chapter ${decision.toLowerCase()} successfully`);
    } catch (error: any) {
        console.error('Error making editor decision:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * Get status history for a chapter
 */
export const getStatusHistory = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const ChapterStatusHistory = (await import('../models/chapterStatusHistory')).default;
        const history = await ChapterStatusHistory.findAll({
            where: { chapterId: Number(id) },
            include: ['user'],
            order: [['timestamp', 'DESC']],
        });

        return sendSuccess(res, history, 'Status history retrieved successfully');
    } catch (error: any) {
        console.error('Error fetching status history:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * Check publishing eligibility for a submission
 */
export const checkPublishingEligibility = async (req: AuthRequest, res: Response) => {
    try {
        const { submissionId } = req.params;

        const eligibility = await chapterService.checkPublishingEligibility(Number(submissionId));

        return sendSuccess(res, eligibility, 'Publishing eligibility checked');
    } catch (error: any) {
        console.error('Error checking publishing eligibility:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * Get all assignments for current reviewer (Chapter Level)
 */
export const getReviewerAssignments = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.authenticatedUser?.id;

        if (!userId) {
            return sendError(res, 'User not authenticated', 401);
        }

        const ChapterReviewerAssignment = (await import('../models/chapterReviewerAssignment')).default;
        const { default: BookTitle } = await import('../models/bookTitle');
        const { default: BookChapter } = await import('../models/bookChapter');

        // Find all assignments for this reviewer
        const assignments = await ChapterReviewerAssignment.findAll({
            where: { reviewerId: userId },
            include: [
                {
                    model: IndividualChapter,
                    as: 'chapter',
                    attributes: ['id', 'chapterTitle', 'status', 'manuscriptFileId', 'revisionCount', 'currentRevisionNumber'],
                    include: [
                        {
                            model: BookChapterSubmission,
                            as: 'submission',
                            attributes: ['id', 'bookTitle', 'mainAuthor', 'submissionDate'],
                            include: ['submitter'] // Careful with this if it causes duplicates
                        },
                        {
                            model: (await import('../models/bookChapterFile')).default,
                            as: 'manuscriptFile',
                            attributes: ['id', 'fileName', 'fileSize', 'mimeType', 'fileType', 'uploadDate']
                        },
                        {
                            model: (await import('../models/chapterRevision')).default,
                            as: 'revisions',
                            include: [
                                {
                                    model: (await import('../models/bookChapterFile')).default,
                                    as: 'file',
                                    attributes: ['id', 'fileName', 'fileSize', 'mimeType', 'fileType', 'uploadDate']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: User,
                    as: 'assigner',
                    attributes: ['id', 'fullName']
                }
            ],
            order: [['assignedDate', 'DESC']],
            // @ts-ignore - distinct is valid in Sequelize find options but missing in type definition
            distinct: true
        });

        // Resolve titles if they are numeric IDs
        const resolvedAssignments = await Promise.all(assignments.map(async (assignment: any) => {
            const assignmentJSON = assignment.toJSON();

            if (assignmentJSON.chapter) {
                // Resolve Chapter Title
                if (assignmentJSON.chapter.chapterTitle && !isNaN(Number(assignmentJSON.chapter.chapterTitle))) {
                    const chapterRecord = await BookChapter.findByPk(Number(assignmentJSON.chapter.chapterTitle));
                    if (chapterRecord) {
                        assignmentJSON.chapter.chapterTitle = chapterRecord.chapterTitle;
                    }
                }

                // Resolve Book Title
                if (assignmentJSON.chapter.submission &&
                    assignmentJSON.chapter.submission.bookTitle &&
                    !isNaN(Number(assignmentJSON.chapter.submission.bookTitle))) {
                    const bookRecord = await BookTitle.findByPk(Number(assignmentJSON.chapter.submission.bookTitle));
                    if (bookRecord) {
                        assignmentJSON.chapter.submission.bookTitle = bookRecord.title;
                    }
                }
            }
            return assignmentJSON;
        }));

        return sendSuccess(res, resolvedAssignments, 'Reviewer assignments retrieved successfully');
    } catch (error: any) {
        console.error('Error fetching reviewer assignments:', error);
        return sendError(res, error.message, 500);
    }
};
