import { Op } from 'sequelize';
import IndividualChapter, { ChapterStatus } from '../models/individualChapter';

import ChapterReviewerAssignment, { ReviewerAssignmentStatus as ChapterReviewerStatus, ReviewerRecommendation } from '../models/chapterReviewerAssignment';
import BookChapterReviewerAssignment, { ReviewerAssignmentStatus as SubmissionReviewerStatus } from '../models/bookChapterReviewerAssignment';
import ChapterRevision from '../models/chapterRevision';
import ChapterStatusHistory from '../models/chapterStatusHistory';
import BookChapterSubmission, { BookChapterStatus } from '../models/bookChapterSubmission';
import BookChapterFile from '../models/bookChapterFile';
import notificationService from './notificationService';
import Notification, { NotificationType, NotificationCategory } from '../models/notification';
import User, { UserRole } from '../models/user';

class ChapterService {
    /**
     * Create individual chapters from a submission
     */
    async createChaptersFromSubmission(submission: BookChapterSubmission, transaction?: any) {
        const chapters = [];

        // Import BookChapter and BookTitle models dynamically to avoid circular deps
        const { default: BookChapter } = await import('../models/bookChapter');
        const { default: BookTitle } = await import('../models/bookTitle');

        // Check if bookChapterTitles contains numeric IDs instead of strings
        const hasNumericIds = submission.bookChapterTitles.some(title =>
            !isNaN(Number(title))
        );

        // If we have numeric IDs, resolve them to actual titles
        let resolvedTitles: string[] = [];
        if (hasNumericIds) {
            // Find the book title ID from the submission's bookTitle field
            const bookTitleRecord = await BookTitle.findOne({
                where: { title: submission.bookTitle },
                ...(transaction ? { transaction } : {})
            });

            if (bookTitleRecord) {
                // Fetch all chapters for this book title
                const bookChapters = await BookChapter.findAll({
                    where: { bookTitleId: bookTitleRecord.id, isActive: true },
                    attributes: ['id', 'chapterTitle'],
                    ...(transaction ? { transaction } : {})
                });

                // Create a map of ID -> chapterTitle
                const chapterMap = new Map<number, string>();
                bookChapters.forEach((ch: any) => {
                    chapterMap.set(ch.id, ch.chapterTitle);
                });

                // Resolve each ID to its title
                resolvedTitles = submission.bookChapterTitles.map(title => {
                    const id = Number(title);
                    if (!isNaN(id) && chapterMap.has(id)) {
                        return chapterMap.get(id)!;
                    }
                    // Fallback to original value if not found
                    return title;
                });
            } else {
                // Book title not found, use original values
                resolvedTitles = submission.bookChapterTitles;
            }
        } else {
            // Already have title strings, use as-is
            resolvedTitles = submission.bookChapterTitles;
        }

        for (const [index, title] of resolvedTitles.entries()) {
            const chapter = await IndividualChapter.create({
                submissionId: submission.id,
                chapterTitle: title,
                chapterNumber: index + 1,
                status: ChapterStatus.ABSTRACT_SUBMITTED,
                revisionCount: 0,
                currentRevisionNumber: 0,
            }, transaction ? { transaction } : {});

            // Create initial status history
            await ChapterStatusHistory.create({
                chapterId: chapter.id,
                previousStatus: null,
                newStatus: ChapterStatus.ABSTRACT_SUBMITTED,
                changedBy: submission.submittedBy,
                action: 'Chapter created',
                notes: 'Initial chapter submission',
            }, transaction ? { transaction } : {});

            chapters.push(chapter);
        }

        return chapters;
    }

    /**
     * Synchronize individual chapters when a submission is updated
     */
    async syncChaptersFromSubmission(submission: BookChapterSubmission, transaction?: any) {


        // Resolve numeric IDs in bookChapterTitles to actual strings (reusing logic)
        const { default: BookChapter } = await import('../models/bookChapter');
        const { default: BookTitle } = await import('../models/bookTitle');

        const hasNumericIds = submission.bookChapterTitles.some(title => !isNaN(Number(title)));
        let resolvedTitles: string[] = [];

        if (hasNumericIds) {
            // Re-resolve book title record if it might have changed
            const bookTitleRecord = await BookTitle.findOne({
                where: { title: submission.bookTitle },
                ...(transaction ? { transaction } : {})
            });

            if (bookTitleRecord) {
                const bookChapters = await BookChapter.findAll({
                    where: { bookTitleId: bookTitleRecord.id, isActive: true },
                    attributes: ['id', 'chapterTitle'],
                    ...(transaction ? { transaction } : {})
                });

                const chapterMap = new Map<number, string>();
                bookChapters.forEach((ch: any) => {
                    chapterMap.set(ch.id, ch.chapterTitle);
                });

                resolvedTitles = submission.bookChapterTitles.map(title => {
                    const id = Number(title);
                    if (!isNaN(id) && chapterMap.has(id)) {
                        return chapterMap.get(id)!;
                    }
                    return title;
                });
            } else {
                resolvedTitles = submission.bookChapterTitles;
            }
        } else {
            resolvedTitles = submission.bookChapterTitles;
        }



        // Fetch existing chapters
        const existingChapters = await IndividualChapter.findAll({
            where: { submissionId: submission.id },
            ...(transaction ? { transaction } : {})
        });



        // 1. Identify chapters to remove (exist in DB but not in new list)
        const chaptersToRemove = existingChapters.filter(c => !resolvedTitles.includes(c.chapterTitle));
        if (chaptersToRemove.length > 0) {

            for (const chapter of chaptersToRemove) {
                await chapter.destroy({ transaction });
            }
        }

        // 2. Identify and update/create chapters
        for (const [index, title] of resolvedTitles.entries()) {
            const chapterNumber = index + 1;
            const existingChapter = existingChapters.find(c => c.chapterTitle === title);

            if (existingChapter) {
                // Update chapter number if it changed
                if (existingChapter.chapterNumber !== chapterNumber) {

                    existingChapter.chapterNumber = chapterNumber;
                    await existingChapter.save({ transaction });
                }
            } else {
                // Create new chapter

                const newChapter = await IndividualChapter.create({
                    submissionId: submission.id,
                    chapterTitle: title,
                    chapterNumber,
                    status: ChapterStatus.ABSTRACT_SUBMITTED,
                    revisionCount: 0,
                    currentRevisionNumber: 0,
                }, transaction ? { transaction } : {});

                // Create initial status history
                await ChapterStatusHistory.create({
                    chapterId: newChapter.id,
                    previousStatus: null,
                    newStatus: ChapterStatus.ABSTRACT_SUBMITTED,
                    changedBy: submission.submittedBy,
                    action: 'Chapter created (Submission update)',
                    notes: 'Chapter added during submission update',
                }, transaction ? { transaction } : {});
            }
        }


        return true;
    }

    /**
     * Get all chapters for a submission
     */
    async getChaptersBySubmission(submissionId: number) {
        return await IndividualChapter.findAll({
            where: { submissionId },
            order: [['chapterNumber', 'ASC']],
            include: [
                {
                    association: 'reviewerAssignments',
                    include: ['reviewer', 'assigner'],
                },
                {
                    association: 'revisions',
                },
                {
                    association: 'statusHistory',
                    include: ['user'],
                    order: [['timestamp', 'DESC']],
                },
            ],
        });
    }

    /**
     * Get a single chapter by ID
     */
    async getChapterById(chapterId: number) {
        return await IndividualChapter.findByPk(chapterId, {
            include: [
                {
                    association: 'submission',
                },
                {
                    association: 'reviewerAssignments',
                    include: ['reviewer', 'assigner'],
                },
                {
                    association: 'revisions',
                    include: ['requester', 'file'],
                },
                {
                    association: 'statusHistory',
                    include: ['user'],
                    order: [['timestamp', 'DESC']],
                },
                {
                    association: 'manuscriptFile',
                },
            ],
        });
    }

    /**
     * Helper to resolve book and chapter titles (handles numeric IDs)
     */
    public async resolveTitles(chapter: IndividualChapter) {
        const submission = await BookChapterSubmission.findByPk(chapter.submissionId);
        let bookTitle = submission?.bookTitle || 'Unknown Book';
        let chapterTitle = chapter.chapterTitle;

        // Dynamic imports to avoid circular dependencies
        const { default: BookTitleModel } = await import('../models/bookTitle');
        const { default: BookChapterModel } = await import('../models/bookChapter');

        // Resolve Book Title if numeric
        if (bookTitle && !isNaN(Number(bookTitle))) {
            const titleRecord = await BookTitleModel.findByPk(Number(bookTitle));
            if (titleRecord) {
                bookTitle = titleRecord.title;
            }
        }

        // Resolve Chapter Title if numeric
        if (chapterTitle && !isNaN(Number(chapterTitle))) {
            const chRecord = await BookChapterModel.findByPk(Number(chapterTitle));
            if (chRecord) {
                chapterTitle = chRecord.chapterTitle;
            }
        }

        return { bookTitle, chapterTitle, submission };
    }

    /**
     * Assign reviewers to a chapter
     */
    async assignReviewers(
        chapterId: number,
        reviewerIds: number[],
        assignedBy: number,
        deadline?: Date
    ) {
        // Validate max 2 reviewers
        if (reviewerIds.length > 2) {
            throw new Error('Maximum 2 reviewers allowed per chapter');
        }

        const chapter = await IndividualChapter.findByPk(chapterId);
        if (!chapter) {
            throw new Error('Chapter not found');
        }

        if (!chapter.canAssignReviewers()) {
            throw new Error(`Cannot assign reviewers to chapter in status: ${chapter.status}`);
        }

        const assignments = [];
        const reviewDeadline = deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default

        // Resolve titles for notification
        const { bookTitle, chapterTitle, submission } = await this.resolveTitles(chapter);

        // Fetch assigner details for notification
        const assigner = await User.findByPk(assignedBy);
        const assignerName = assigner?.fullName || 'Editor';

        for (const reviewerId of reviewerIds) {
            // Check if already assigned
            let assignment = await ChapterReviewerAssignment.findOne({
                where: { chapterId, reviewerId }
            });

            if (!assignment) {
                assignment = await ChapterReviewerAssignment.create({
                    chapterId,
                    reviewerId,
                    assignedBy,
                    status: ChapterReviewerStatus.PENDING,
                    assignedDate: new Date(),
                    deadline: reviewDeadline,
                });
            }
            assignments.push(assignment);

            // Send notifications
            notificationService.createNotification({
                recipientId: reviewerId,
                senderId: assignedBy,
                type: NotificationType.INFO,
                category: NotificationCategory.REVIEW,
                title: 'New Chapter Review Assignment',
                message: `You have been assigned to review the chapter "${chapterTitle}" for the book "${bookTitle}".`,
                relatedEntityId: chapterId,
                relatedEntityType: 'IndividualChapter',
            }).catch(err => console.error('Error sending reviewer notification:', err));

            // Send email notification using the specific function
            const { sendBookChapterReviewerAssignedEmail } = await import('../utils/emails/bookChapterEmails');
            User.findByPk(reviewerId).then(reviewer => {
                if (reviewer && submission) {
                    sendBookChapterReviewerAssignedEmail(
                        reviewer.email,
                        reviewer.fullName,
                        {
                            bookTitle,
                            chapterTitle,
                            assignedBy: assignerName,
                            deadline: reviewDeadline,
                            submissionId: submission.id,
                        }
                    ).catch(err => console.error('Error sending reviewer assignment email:', err));
                }
            }).catch(err => console.error('Error fetching reviewer for email:', err));
        }

        // Update chapter status and assigned reviewers
        const previousStatus = chapter.status;
        chapter.status = ChapterStatus.REVIEWER_ASSIGNMENT;
        chapter.assignedReviewers = reviewerIds;
        chapter.reviewDeadline = reviewDeadline;
        await chapter.save();

        // Create status history
        await ChapterStatusHistory.create({
            chapterId,
            previousStatus,
            newStatus: ChapterStatus.REVIEWER_ASSIGNMENT,
            changedBy: assignedBy,
            action: 'Reviewers assigned',
            notes: `Assigned ${reviewerIds.length} reviewer(s)`,
            metadata: { reviewerIds, deadline: reviewDeadline },
        });

        return assignments;
    }

    /**
     * Update chapter status
     */
    async updateChapterStatus(
        chapterId: number,
        newStatus: ChapterStatus,
        changedBy: number,
        notes?: string,
        metadata?: any
    ) {
        const chapter = await IndividualChapter.findByPk(chapterId);
        if (!chapter) {
            throw new Error('Chapter not found');
        }

        const previousStatus = chapter.status;
        chapter.status = newStatus;
        await chapter.save();

        // Create status history
        // Step 6 Fix: Specific action for Peer Review Completed
        let action = `Status changed to ${newStatus}`;
        if (newStatus === ChapterStatus.EDITORIAL_REVIEW) {
            action = 'Peer Review Completed';
        }

        // Helper to resolve book and chapter titles (handles numeric IDs)
        const { bookTitle: resolvedBookTitle, chapterTitle: resolvedChapterTitles } = await this.resolveTitles(chapter);

        await ChapterStatusHistory.create({
            chapterId,
            previousStatus,
            newStatus,
            changedBy,
            action,
            notes,
            metadata,
        });

        const submission = await BookChapterSubmission.findByPk(chapter.submissionId);

        // Notify for Revisions
        if (newStatus === ChapterStatus.REVISION_SUBMITTED && submission) {
            const { sendBookChapterRevisionSubmittedToReviewerEmail } = await import('../utils/emails/bookChapterEmails');
            const author = await User.findByPk(changedBy);
            const chapterReviewers = await ChapterReviewerAssignment.findAll({ where: { chapterId: chapter.id } });
            const submissionReviewers = await BookChapterReviewerAssignment.findAll({ where: { submissionId: chapter.submissionId } });

            // Fetch the latest revision to find who requested it
            const latestRevision = await ChapterRevision.findOne({
                where: { chapterId: chapter.id },
                order: [['revisionNumber', 'DESC']]
            });

            // Build the set of reviewer user IDs
            const reviewerUserIds = new Set<number>();

            // Chapter-level reviewers (exclude only REJECTED)
            for (const r of chapterReviewers) {
                if (r.status !== ChapterReviewerStatus.REJECTED) {
                    reviewerUserIds.add(r.reviewerId);
                }
            }

            // Submission-level reviewers (exclude DECLINED & EXPIRED)
            for (const r of submissionReviewers) {
                if (r.status !== SubmissionReviewerStatus.DECLINED && r.status !== SubmissionReviewerStatus.EXPIRED) {
                    reviewerUserIds.add(r.reviewerId);
                }
            }

            // Also include the person who requested the revision
            if (latestRevision && latestRevision.requestedBy) {
                reviewerUserIds.add(latestRevision.requestedBy);
            }

            for (const revUserId of reviewerUserIds) {
                const reviewerUser = await User.findByPk(revUserId);
                if (!reviewerUser) {
                    continue;
                }

                // Skip the author who uploaded the revision
                if (revUserId === changedBy) {
                    continue;
                }

                // App Notification — await so failures are captured
                await notificationService.createNotification({
                    recipientId: revUserId,
                    senderId: changedBy,
                    type: NotificationType.INFO,
                    category: NotificationCategory.REVIEW,
                    title: 'Chapter Revision Uploaded',
                    message: `Author has submitted a revision for chapter "${resolvedChapterTitles}" in "${resolvedBookTitle}". Please review the updated manuscript.`,
                    relatedEntityId: chapter.id,
                    relatedEntityType: 'IndividualChapter',
                }).catch(err => console.error(`[REVISION_SUBMITTED] ❌ Error sending app notification to reviewer ${revUserId}:`, err));

                // Email — fire and forget (non-critical)
                sendBookChapterRevisionSubmittedToReviewerEmail(reviewerUser.email, reviewerUser.fullName, {
                    authorName: author?.fullName || 'Author',
                    bookTitle: resolvedBookTitle,
                    chapterTitle: resolvedChapterTitles,
                    revisionNumber: chapter.revisionCount,
                    submissionId: submission.id,
                }).catch(err => console.error(`[REVISION_SUBMITTED] ❌ Error sending email to reviewer ${reviewerUser.email}:`, err));
            }
        }


        // Update parent submission status if chapter moves to UNDER_REVIEW
        if (newStatus === ChapterStatus.UNDER_REVIEW) {
            const submission = await BookChapterSubmission.findByPk(chapter.submissionId);
            // Update if currently in a pre-review state
            if (submission && [
                BookChapterStatus.REVIEWER_ASSIGNMENT,
                BookChapterStatus.MANUSCRIPTS_PENDING
            ].includes(submission.status)) {

                const allChapters = await IndividualChapter.findAll({
                    where: { submissionId: submission.id }
                });

                // Statuses that are past REVIEWER_ASSIGNMENT
                const advancedStatuses = [
                    ChapterStatus.UNDER_REVIEW,
                    ChapterStatus.REVISION_REQUESTED,
                    ChapterStatus.ADDITIONAL_REVISION_REQUESTED,
                    ChapterStatus.REVISION_SUBMITTED,
                    ChapterStatus.EDITORIAL_REVIEW,
                    ChapterStatus.CHAPTER_APPROVED,
                    ChapterStatus.CHAPTER_REJECTED
                ];

                const allAdvanced = allChapters.every(c => advancedStatuses.includes(c.status));

                if (allAdvanced) {
                    const oldStatus = submission.status;
                    submission.status = BookChapterStatus.UNDER_REVIEW;
                    submission.lastUpdatedBy = changedBy;
                    await submission.save();

                    try {
                        const { default: BookChapterStatusHistory } = await import('../models/bookChapterStatusHistory');
                        await BookChapterStatusHistory.create({
                            submissionId: submission.id,
                            previousStatus: oldStatus,
                            newStatus: BookChapterStatus.UNDER_REVIEW,
                            changedBy: changedBy,
                            action: 'Submission Under Review',
                            notes: `All chapters have moved to review phase or beyond. Logic triggered by status sync.`
                        });
                    } catch (err) {
                        console.error('Error syncing submission status to UNDER_REVIEW:', err);
                    }
                }
            }
        }

        // Handle Step 6: Peer Review Completion Gate for ALL chapters 
        if (newStatus === ChapterStatus.EDITORIAL_REVIEW) {
            const submission = await BookChapterSubmission.findByPk(chapter.submissionId);
            // Verify we haven't already advanced past this stage
            if (submission && [
                BookChapterStatus.UNDER_REVIEW,
                BookChapterStatus.REVIEWER_ASSIGNMENT,
                BookChapterStatus.MANUSCRIPTS_PENDING
            ].includes(submission.status)) {

                const allChapters = await IndividualChapter.findAll({
                    where: { submissionId: submission.id }
                });

                // Statuses that are EDITORIAL_REVIEW or beyond
                const advancedStatuses = [
                    ChapterStatus.EDITORIAL_REVIEW,
                    ChapterStatus.CHAPTER_APPROVED,
                    ChapterStatus.CHAPTER_REJECTED
                ];

                const allAdvanced = allChapters.every(c => advancedStatuses.includes(c.status));

                if (allAdvanced) {
                    // Do NOT change submission status yet. Just log history and notify per Step 6 rules.
                    try {
                        const { default: BookChapterStatusHistory } = await import('../models/bookChapterStatusHistory');

                        // Check if we already logged this to avoid duplicates
                        const existingLog = await BookChapterStatusHistory.findOne({
                            where: {
                                submissionId: submission.id,
                                action: 'Peer Review Completed'
                            }
                        });

                        if (!existingLog) {
                            await BookChapterStatusHistory.create({
                                submissionId: submission.id,
                                previousStatus: submission.status,
                                newStatus: submission.status,
                                changedBy: changedBy,
                                action: 'Peer Review Completed',
                                notes: `All chapters have completed peer review. Awaiting editorial decisions.`
                            });

                            const { default: notificationService } = await import('../services/notificationService');
                            const { NotificationType, NotificationCategory } = await import('../models/notification');



                            // Notify Editor
                            if (submission.assignedEditorId) {
                                await notificationService.createNotification({
                                    recipientId: submission.assignedEditorId,
                                    type: NotificationType.INFO,
                                    category: NotificationCategory.REVIEW,
                                    title: 'Peer Review Completed',
                                    message: `All chapters for "${resolvedBookTitle}" have completed peer review. Please make editorial decisions.`,
                                    relatedEntityId: submission.id,
                                    relatedEntityType: 'BookChapterSubmission'
                                });
                            }

                            // Step 6 Fix: Consolidated In-app to Admin
                            const { sendBookChapterPeerReviewCompletedEditorEmail } = await import('../utils/emailService');
                            const admins = await User.findAll({ where: { role: UserRole.ADMIN, isActive: true } });
                            for (const admin of admins) {
                                await notificationService.createNotification({
                                    recipientId: admin.id,
                                    type: NotificationType.INFO,
                                    category: NotificationCategory.REVIEW,
                                    title: 'Peer Review Completed',
                                    message: `All chapters for submission "${resolvedBookTitle}" have completed peer review.`,
                                    relatedEntityId: submission.id,
                                    relatedEntityType: 'BookChapterSubmission'
                                });
                            }

                            if (submission.assignedEditorId) {
                                const editor = await User.findByPk(submission.assignedEditorId);
                                if (editor) {
                                    const allResolvedChapterTitles = await submission.getResolvedChapterTitlesString();
                                    const chaptersArray = allResolvedChapterTitles ? allResolvedChapterTitles.split(', ') : [];
                                    
                                    await sendBookChapterPeerReviewCompletedEditorEmail(
                                        editor.email,
                                        editor.fullName,
                                        {
                                            bookTitle: resolvedBookTitle,
                                            chapters: chaptersArray,
                                            submissionId: submission.id,
                                        }
                                    );
                                }
                            }
                        }

                    } catch (err) {
                        console.error('Error logging Peer Review Completed gate:', err);
                    }
                }
            }
        }

        return chapter;
    }

    /**
     * Request revision for a chapter
     */
    async requestRevision(
        chapterId: number,
        requestedBy: number,
        reviewerComments: string
    ) {
        // Use model's sequelize instance to avoid import issues
        const sequelize = IndividualChapter.sequelize;
        if (!sequelize) {
            throw new Error('Database connection not established');
        }

        // ── PRE-FLIGHT VALIDATION (before any transaction) ──────────────────
        const chapterForValidation = await IndividualChapter.findByPk(chapterId);
        if (!chapterForValidation) {
            throw new Error('Chapter not found');
        }

        if (chapterForValidation.revisionCount >= 3) {
            throw new Error('Maximum revision limit (3) reached for this chapter');
        }
        if (!chapterForValidation.canRequestRevision()) {
            throw new Error(`Cannot request revision: chapter is in status '${chapterForValidation.status}'. Must be in review or revision state.`);
        }
        if (chapterForValidation.status === ChapterStatus.REVISION_REQUESTED || chapterForValidation.status === ChapterStatus.ADDITIONAL_REVISION_REQUESTED) {
            throw new Error('revision was already raised please wait for the author response');
        }
        // ────────────────────────────────────────────────────────────────────

        const transaction = await sequelize.transaction();

        try {
            const chapter = await IndividualChapter.findByPk(chapterId, { transaction });
            if (!chapter) {
                throw new Error('Chapter not found');
            }

            // Capture previous status BEFORE mutating chapter.status
            const previousStatusBeforeChange = chapter.status;

            // Start a new revision round
            const revisionNumber = chapter.revisionCount + 1;

            // Create new revision request record
            const revision = await ChapterRevision.create({
                chapterId,
                revisionNumber,
                requestedBy,
                requestedDate: new Date(),
                reviewerComments,
                status: 'PENDING',
            }, { transaction });

            // Update chapter status — always a new revision round now
            chapter.revisionCount = revisionNumber;
            chapter.currentRevisionNumber = revisionNumber;
            chapter.status = ChapterStatus.REVISION_REQUESTED;
            await chapter.save({ transaction });

            // Create status history with the CORRECT previous status (captured before mutation)
            await ChapterStatusHistory.create({
                chapterId,
                previousStatus: previousStatusBeforeChange,
                newStatus: ChapterStatus.REVISION_REQUESTED,
                changedBy: requestedBy,
                action: `Revision ${revisionNumber} requested`,
                notes: reviewerComments,
            }, { transaction });

            await transaction.commit();

            // Send notification to author(s) (outside transaction)
            // Wrapped in try-catch so notification failures don't report as total request failures
            try {
                const submission = await BookChapterSubmission.findByPk(chapter.submissionId);
                if (submission) {
                    const { sendBookChapterRevisionRequestedEmail } = await import('../utils/emails/bookChapterEmails');
                    const { bookTitle: resolvedBookTitle, chapterTitle: resolvedChapterTitle } = await this.resolveTitles(chapter);

                    // 1. Notify Submitter
                    const submitter = await User.findByPk(submission.submittedBy);
                    if (submitter) {
                        // App Notification
                        notificationService.createNotification({
                            recipientId: submitter.id,
                            senderId: requestedBy,
                            type: NotificationType.WARNING,
                            category: NotificationCategory.REVIEW,
                            title: 'Revision Requested',
                            message: `Revision requested for chapter "${resolvedChapterTitle}" (Revision ${revisionNumber}/3)`,
                            relatedEntityId: chapterId,
                            relatedEntityType: 'IndividualChapter',
                        }).catch(err => console.error('Error sending submitter app notification:', err));

                        // Email
                        sendBookChapterRevisionRequestedEmail(submitter.email, submitter.fullName, {
                            bookTitle: resolvedBookTitle,
                            chapterTitle: resolvedChapterTitle,
                            revisionNumber,
                            reviewerComments,
                        }).catch(console.error);
                    }

                    // 2. Notify Corresponding Author (if different from submitter and email exists)
                    const correspondingAuthor = submission.getCorrespondingAuthor();
                    if (correspondingAuthor && correspondingAuthor.email && correspondingAuthor.email !== submitter?.email) {
                        // Email
                        sendBookChapterRevisionRequestedEmail(correspondingAuthor.email, `${correspondingAuthor.firstName} ${correspondingAuthor.lastName}`, {
                            bookTitle: resolvedBookTitle,
                            chapterTitle: resolvedChapterTitle,
                            revisionNumber,
                            reviewerComments,
                        }).catch(console.error);

                        // Try to find if corresponding author is a registered user for App Notification
                        const correspondingUser = await User.findOne({ where: { email: correspondingAuthor.email, isActive: true } });
                        if (correspondingUser) {
                            notificationService.createNotification({
                                recipientId: correspondingUser.id,
                                senderId: requestedBy,
                                type: NotificationType.WARNING,
                                category: NotificationCategory.REVIEW,
                                title: 'Revision Requested',
                                message: `Revision requested for chapter "${resolvedChapterTitle}" (Revision ${revisionNumber}/3)`,
                                relatedEntityId: chapterId,
                                relatedEntityType: 'IndividualChapter',
                            }).catch(err => console.error('Error sending corresponding author app notification:', err));
                        }
                    }
                }
            } catch (notifyError) {
                console.error('Non-critical error sending revision notifications:', notifyError);
            }

            return revision;
        } catch (error) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                // Silently ignore or log if rollback fails (e.g. already finished)
            }
            throw error;
        }
    }

    /**
     * Check if all chapters in a submission are approved
     */
    async checkPublishingEligibility(submissionId: number) {
        const chapters = await IndividualChapter.findAll({
            where: { submissionId },
        });

        if (chapters.length === 0) {
            return {
                eligible: false,
                total: 0,
                approved: 0,
                rejected: 0,
                inProgress: 0,
            };
        }

        const total = chapters.length;
        const approved = chapters.filter(c => c.status === ChapterStatus.CHAPTER_APPROVED).length;
        const rejected = chapters.filter(c => c.status === ChapterStatus.CHAPTER_REJECTED).length;
        const inProgress = total - approved - rejected;

        const allApproved = chapters.every(c => c.status === ChapterStatus.CHAPTER_APPROVED);

        return {
            eligible: allApproved,
            total,
            approved,
            rejected,
            inProgress,
        };
    }

    /**
     * Get chapter progress summary
     */
    async getChapterProgress(submissionId: number) {
        const chapters = await IndividualChapter.findAll({
            where: { submissionId },
            attributes: ['id', 'chapterNumber', 'chapterTitle', 'status'],
            order: [['chapterNumber', 'ASC']],
        });

        const statusCounts: { [key: string]: number } = {};
        chapters.forEach(chapter => {
            statusCounts[chapter.status] = (statusCounts[chapter.status] || 0) + 1;
        });

        return {
            total: chapters.length,
            chapters: chapters.map(c => ({
                id: c.id,
                number: c.chapterNumber,
                title: c.chapterTitle,
                status: c.status,
            })),
            statusCounts,
        };
    }

    /**
     * Get chapters by status
     */
    async getChaptersByStatus(submissionId: number, status: ChapterStatus) {
        return await IndividualChapter.findAll({
            where: {
                submissionId,
                status,
            },
            order: [['chapterNumber', 'ASC']],
        });
    }

    /**
     * Upload manuscript for a chapter
     */
    async uploadManuscript(chapterId: number, fileId: number, userId: number) {
        const chapter = await IndividualChapter.findByPk(chapterId);
        if (!chapter) {
            throw new Error('Chapter not found');
        }

        if (!chapter.canUploadManuscript()) {
            throw new Error(`Cannot upload manuscript for chapter in status: ${chapter.status}`);
        }

        const previousStatus = chapter.status;
        let newStatus = ChapterStatus.REVIEWER_ASSIGNMENT;
        let actionDescription = 'Received Manuscript';

        const { bookTitle: resolvedBookTitle, chapterTitle: resolvedChapterTitle } = await this.resolveTitles(chapter);
        const file = await BookChapterFile.findByPk(fileId);
        if (file) {
            const originalFileName = file.fileName;
            const lastDotIndex = originalFileName.lastIndexOf('.');
            const extension = lastDotIndex !== -1 ? originalFileName.substring(lastDotIndex) : '';
            const nameWithoutExtension = lastDotIndex !== -1 ? originalFileName.substring(0, lastDotIndex) : originalFileName;
            const cleanChapterTitle = resolvedChapterTitle.replace(/[<>:"/\\|?*]/g, '').trim();
            file.fileName = `${nameWithoutExtension}(${cleanChapterTitle})${extension}`;
            await file.save();
        }

        if (chapter.status === ChapterStatus.REVISION_REQUESTED || chapter.status === ChapterStatus.ADDITIONAL_REVISION_REQUESTED) {
            newStatus = ChapterStatus.REVISION_SUBMITTED;
            actionDescription = 'Revision uploaded';

            const pendingRevisions = await ChapterRevision.findAll({
                where: { chapterId: chapter.id, status: 'PENDING' }
            });

            for (const rev of pendingRevisions) {
                rev.fileId = fileId;
                rev.submittedDate = new Date();
                rev.status = 'SUBMITTED';
                await rev.save();
            }

            const assignments = await ChapterReviewerAssignment.findAll({
                where: { chapterId: chapter.id }
            });

            for (const assignment of assignments) {
                if (assignment.status !== ChapterReviewerStatus.REJECTED) {
                    assignment.status = ChapterReviewerStatus.IN_PROGRESS;
                    assignment.recommendation = null;
                    await assignment.save();
                }
            }
        }

        chapter.manuscriptFileId = fileId;
        await chapter.save();

        await this.updateChapterStatus(
            chapter.id,
            newStatus,
            userId,
            actionDescription
        );

        const submission = await BookChapterSubmission.findByPk(chapter.submissionId);
        if (submission) {
            // For revisions, all notifications are handled ONLY in updateChapterStatus (reviewer notifications)
            // For initial uploads, notify editors and admins
            if (newStatus !== ChapterStatus.REVISION_SUBMITTED) {
                const admins = await User.findAll({ where: { role: UserRole.ADMIN, isActive: true } });
                const recipients = [...admins];
                const editor = submission.assignedEditorId ? await User.findByPk(submission.assignedEditorId) : null;
                if (editor && editor.isActive) {
                    const alreadyIncluded = recipients.some(r => r.id === editor.id);
                    if (!alreadyIncluded) recipients.push(editor);
                }

                for (const recipient of recipients) {
                    notificationService.createNotification({
                        recipientId: recipient.id,
                        senderId: userId,
                        type: NotificationType.INFO,
                        category: NotificationCategory.SUBMISSION,
                        title: 'Manuscript Uploaded',
                        message: `A manuscript has been uploaded for chapter "${resolvedChapterTitle}" in "${resolvedBookTitle}".`,
                        relatedEntityId: submission.id,
                        relatedEntityType: 'BookChapterSubmission',
                    }).catch(console.error);
                }
            }

            // Check if all chapters have manuscripts uploaded (only for initial uploads, not revisions)
            if (newStatus !== ChapterStatus.REVISION_SUBMITTED) {
                const allChapters = await IndividualChapter.findAll({ where: { submissionId: submission.id } });
                const receivedStatuses = [
                    ChapterStatus.REVIEWER_ASSIGNMENT, ChapterStatus.UNDER_REVIEW,
                    ChapterStatus.REVISION_REQUESTED, ChapterStatus.ADDITIONAL_REVISION_REQUESTED,
                    ChapterStatus.REVISION_SUBMITTED, ChapterStatus.EDITORIAL_REVIEW,
                    ChapterStatus.CHAPTER_APPROVED, ChapterStatus.CHAPTER_REJECTED
                ];

                const allUploaded = allChapters.every(c => receivedStatuses.includes(c.status) || c.id === chapterId);

                if (allUploaded) {
                    const editorsAndAdmins = await User.findAll({
                        where: {
                            [Op.or]: [{ role: UserRole.ADMIN }, { id: submission.assignedEditorId || 0 }],
                            isActive: true
                        }
                    });

                    const { sendDummyEmail } = await import('../utils/emailService');
                    for (const u of editorsAndAdmins) {
                        notificationService.createNotification({
                            recipientId: u.id,
                            senderId: userId,
                            type: NotificationType.SUCCESS,
                            category: NotificationCategory.SUBMISSION,
                            title: 'All Manuscripts Received',
                            message: `All chapter manuscripts for "${resolvedBookTitle}" have been uploaded.`,
                            relatedEntityId: submission.id,
                            relatedEntityType: 'BookChapterSubmission',
                        }).catch(console.error);

                        sendDummyEmail({
                            to: u.email,
                            subject: 'All Manuscripts Received: Action Required',
                            template: 'all-manuscripts-uploaded',
                            data: {
                                userName: u.fullName,
                                bookTitle: resolvedBookTitle,
                                chapters: await submission.getResolvedChapterTitlesString(),
                                submissionId: submission.id
                            }
                        }).catch(console.error);
                    }

                    if (submission.status === BookChapterStatus.MANUSCRIPTS_PENDING) {
                        submission.status = BookChapterStatus.REVIEWER_ASSIGNMENT;
                        await submission.save();

                        const { default: BookChapterStatusHistory } = await import('../models/bookChapterStatusHistory');
                        await BookChapterStatusHistory.create({
                            submissionId: submission.id,
                            previousStatus: BookChapterStatus.MANUSCRIPTS_PENDING,
                            newStatus: BookChapterStatus.REVIEWER_ASSIGNMENT,
                            changedBy: userId,
                            action: 'Received all Manuscripts'
                        }).catch(console.error);
                    }
                }
            }
        }

        return chapter;
    }

    /**
     * Make editor decision on a chapter
     */
    async makeEditorDecision(chapterId: number, decision: 'APPROVED' | 'REJECTED', editorId: number, notes?: string) {
        const chapter = await IndividualChapter.findByPk(chapterId);
        if (!chapter) throw new Error('Chapter not found');

        const previousStatus = chapter.status;
        chapter.editorDecision = decision;
        chapter.editorDecisionDate = new Date();
        chapter.editorDecisionNotes = notes || null;
        chapter.status = decision === 'APPROVED' ? ChapterStatus.CHAPTER_APPROVED : ChapterStatus.CHAPTER_REJECTED;
        await chapter.save();

        await ChapterStatusHistory.create({
            chapterId,
            previousStatus,
            newStatus: chapter.status,
            changedBy: editorId,
            action: `Chapter ${decision.toLowerCase()}`,
            notes,
        });

        const submission = await BookChapterSubmission.findByPk(chapter.submissionId);
        if (submission) {
            const { bookTitle: resolvedBookTitle, chapterTitle: resolvedChapterTitle } = await this.resolveTitles(chapter);

            const editor = await User.findByPk(editorId);
            const editorName = editor?.fullName || 'Editor';

            notificationService.createNotification({
                recipientId: submission.submittedBy,
                senderId: editorId,
                type: decision === 'APPROVED' ? NotificationType.SUCCESS : NotificationType.ERROR,
                category: NotificationCategory.SUBMISSION,
                title: `Chapter ${decision === 'APPROVED' ? 'Approved' : 'Rejected'}`,
                message: `Your chapter "${resolvedChapterTitle}" in "${resolvedBookTitle}" has been ${decision.toLowerCase()}. Notes: ${notes}`,
                relatedEntityId: chapterId,
                relatedEntityType: 'IndividualChapter',
            }).catch(console.error);

            // Send Email Notification to both authors (Scenario 2: Chapter Decision)
            const { sendDecisionEmailToAuthors } = await import('../utils/emails/bookChapterEmails');
            const submitter = await User.findByPk(submission.submittedBy);
            await sendDecisionEmailToAuthors(submission, submitter, {
                bookTitle: resolvedBookTitle,
                chapterTitle: resolvedChapterTitle,
                decision: decision,
                editorName: editorName,
                editorNotes: notes || '',
                stage: 'Chapter Decision',
            });

            const admins = await User.findAll({ where: { role: UserRole.ADMIN, isActive: true } });
            for (const admin of admins) {
                notificationService.createNotification({
                    recipientId: admin.id,
                    senderId: editorId,
                    type: NotificationType.INFO,
                    category: NotificationCategory.SUBMISSION,
                    title: `Chapter Decision: ${decision === 'APPROVED' ? 'Approved' : 'Rejected'}`,
                    message: `Editor has ${decision.toLowerCase()} chapter "${resolvedChapterTitle}" in "${resolvedBookTitle}".`,
                    relatedEntityId: chapterId,
                    relatedEntityType: 'IndividualChapter',
                }).catch(console.error);
            }

            const allChapters = await IndividualChapter.findAll({ where: { submissionId: submission.id } });
            const allDecided = allChapters.every(ch => ch.status === ChapterStatus.CHAPTER_APPROVED || ch.status === ChapterStatus.CHAPTER_REJECTED);

            if (allDecided && submission.status !== BookChapterStatus.EDITORIAL_REVIEW && submission.status !== BookChapterStatus.APPROVED) {
                const oldSubStatus = submission.status;
                submission.status = BookChapterStatus.EDITORIAL_REVIEW;
                await submission.save();

                const { default: BookChapterStatusHistory } = await import('../models/bookChapterStatusHistory');
                await BookChapterStatusHistory.create({
                    submissionId: submission.id,
                    previousStatus: oldSubStatus,
                    newStatus: BookChapterStatus.EDITORIAL_REVIEW,
                    changedBy: editorId,
                    action: 'All chapters decided',
                });
            }
        }
        return chapter;
    }
}

export default new ChapterService();
