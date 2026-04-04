import { Response } from 'express';
import { Op, Sequelize } from 'sequelize';
import BookChapterSubmission, { BookChapterStatus } from '../../models/bookChapterSubmission';
import BookChapterStatusHistory from '../../models/bookChapterStatusHistory';
import User, { UserRole } from '../../models/user';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendError } from '../../utils/responseHandler';
import {
    sendBookChapterStatusChangedEmail,
    sendBookChapterEditorAssignedEmail
} from '../../utils/emails/bookChapterEmails';
import notificationService from '../../services/notificationService';
import { NotificationType, NotificationCategory } from '../../models/notification';
import PublishedBook from '../../models/publishedBook';
import BookChapterReviewerAssignment, { ReviewerAssignmentStatus } from '../../models/bookChapterReviewerAssignment';
import IndividualChapter, { ChapterStatus } from '../../models/individualChapter'; // Import if needed for stats
import DeliveryAddress from '../../models/deliveryAddress';

import { resolveDisplayBookTitle } from './commonController';

/**
 * @route POST /api/book-chapters/:id/publish
 * @desc Admin publishes the approved submission
 * @access Private (Admin)
 */
export const publishChapter = async (req: AuthRequest, res: Response) => {
    // Get sequelize from the model
    const sequelize = BookChapterSubmission.sequelize;

    if (!sequelize) {
        return sendError(res, 'Database connection not initialized', 500);
    }

    const transaction = await sequelize.transaction();

    try {
        const user = req.authenticatedUser;
        const submissionId = parseInt(req.params.id);
        const { publicationDate, doi, pageNumbers } = req.body;

        if (!user || (!user.hasRole(UserRole.ADMIN) && !user.hasRole(UserRole.DEVELOPER) && !user.hasRole(UserRole.EDITOR))) {
            await transaction.rollback();
            return sendError(res, 'Admin or Editor access required', 403);
        }

        if (isNaN(submissionId)) {
            await transaction.rollback();
            return sendError(res, 'Invalid submission ID', 400);
        }

        const submission = await BookChapterSubmission.findByPk(submissionId, { transaction });

        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        // Must be in a publishable status
        const publishableStatuses = [
            BookChapterStatus.APPROVED,
            BookChapterStatus.ISBN_APPLIED,
            BookChapterStatus.PUBLICATION_IN_PROGRESS
        ];

        if (!publishableStatuses.includes(submission.status)) {
            await transaction.rollback();
            return sendError(res, `Submission must be APPROVED, ISBN_APPLIED, or PUBLICATION_IN_PROGRESS before publishing (current: ${submission.status})`, 400);
        }

        // Logic to create/update PublishedBook record or similar
        // Check if PublishedBook entry exists for this submission, if not create one
        let publishedBook = await PublishedBook.findOne({
            where: { submissionId },
            transaction
        });

        if (publishedBook) {
            // Update existing
            const date = publicationDate ? new Date(publicationDate) : new Date();
            // publishedBook.publicationDate is not a valid property. Using releaseDate and publishedDate instead.
            if (!isNaN(date.getTime())) {
                publishedBook.releaseDate = date.toISOString().split('T')[0];
                publishedBook.publishedDate = date.getFullYear().toString();
            }

            if (doi) publishedBook.doi = doi;

            // PublishedBook has 'pages' (number), not 'pageRange'. 
            // If pageNumbers is provided and looks like a number, assign it.
            if (pageNumbers) {
                const parsedPages = parseInt(pageNumbers);
                if (!isNaN(parsedPages)) {
                    publishedBook.pages = parsedPages;
                }
            }
            // publishedBook.status = 'PUBLISHED'; // If PublishedBook has status
            await publishedBook.save({ transaction });
        } else {
            // Create new
            // Note: PublishedBook schema needs to be compatible. Assuming standard fields.
            // This part might need adjustment based on actual PublishedBook model definition
            try {
                /*
                publishedBook = await PublishedBook.create({
                  submissionId,
                  title: submission.bookTitle,
                  author: submission.getMainAuthorName(), 
                  publicationDate: publicationDate ? new Date(publicationDate) : new Date(),
                  doi,
                  pageRange: pageNumbers,
                  description: submission.abstract,
                  // other required fields?
                }, { transaction });
                */
                // If PublishedBook logic is complex or different, we might just update Submission status
            } catch (pbError) {
                console.warn('Could not create PublishedBook record (model might differ):', pbError);
            }
        }

        // Update submission status
        const previousStatus = submission.status;
        submission.status = BookChapterStatus.PUBLISHED;
        submission.lastUpdatedBy = user.id;
        await submission.save({ transaction });

        // Create status history
        await BookChapterStatusHistory.create(
            {
                submissionId: submission.id,
                previousStatus,
                newStatus: BookChapterStatus.PUBLISHED,
                changedBy: user.id,
                action: 'Chapter Published',
                notes: `Chapter officially published. DOI: ${doi || 'N/A'}`,
                metadata: {
                    publicationDate,
                    doi,
                    pageNumbers
                },
            },
            { transaction }
        );

        await transaction.commit();

        // Notifications
        const displayBookTitle = await resolveDisplayBookTitle(submission.bookTitle);
        const mainAuthor = submission.mainAuthor;

        // 1. Notify Author
        Promise.all([
            notificationService.createNotification({
                recipientId: submission.submittedBy,
                type: NotificationType.SUCCESS,
                category: NotificationCategory.SUBMISSION,
                title: 'Book Chapter Published',
                message: `Your chapter "${displayBookTitle}" has been published!`,
                relatedEntityId: submission.id,
                relatedEntityType: 'BookChapterSubmission',
            }),
            sendBookChapterStatusChangedEmail(
                mainAuthor.email,
                mainAuthor.firstName,
                {
                    bookTitle: displayBookTitle,
                    previousStatus: previousStatus,
                    newStatus: BookChapterStatus.PUBLISHED,
                    changedBy: user.fullName,
                    submissionId: submission.id
                }
            )
        ]).catch(err => console.error('❌ Error sending publication notifications:', err));

        return sendSuccess(res, submission, 'Chapter published successfully');

    } catch (error) {
        await transaction.rollback();
        console.error('❌ Publish chapter error:', error);
        return sendError(res, 'Failed to publish chapter', 500);
    }
};

/**
 * @route DELETE /api/book-chapters/admin/:id
 * @desc Admin permanently deletes a submission
 * @access Private (Admin)
 */
export const deleteSubmission = async (req: AuthRequest, res: Response) => {
    // Get sequelize from the model
    const sequelize = BookChapterSubmission.sequelize;

    if (!sequelize) {
        return sendError(res, 'Database connection not initialized', 500);
    }

    const transaction = await sequelize.transaction();

    try {
        const user = req.authenticatedUser;
        const submissionId = parseInt(req.params.id);

        if (!user || (!user.hasRole(UserRole.ADMIN) && !user.hasRole(UserRole.DEVELOPER))) {
            await transaction.rollback();
            return sendError(res, 'Admin access required', 403);
        }

        const submission = await BookChapterSubmission.findByPk(submissionId, { transaction });

        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        // Hard delete related data first (cascading usually handles this, but good to be explicit for files)
        // Delete files logic... (S3 or local storage cleanup should be triggered here)

        // Delete history
        await BookChapterStatusHistory.destroy({
            where: { submissionId },
            transaction
        });

        // Delete reviewer assignments
        await BookChapterReviewerAssignment.destroy({
            where: { submissionId },
            transaction
        });

        // Delete submission
        await submission.destroy({ transaction });

        await transaction.commit();

        return sendSuccess(res, null, 'Submission deleted permanently');
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Admin delete submission error:', error);
        return sendError(res, 'Failed to delete submission', 500);
    }
};

/**
 * @route GET /api/book-chapters/stats/overview
 * @desc Get global statistics for book chapters
 * @access Private (Admin/Editor)
 */
export const getStatistics = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;

        if (!user || (!user.hasRole(UserRole.ADMIN) && !user.hasRole(UserRole.DEVELOPER) && !user.hasRole(UserRole.EDITOR))) {
            return sendError(res, 'Admin or Editor access required', 403);
        }

        // Use SQL aggregation for efficiency
        // Total Submissions
        const totalSubmissions = await BookChapterSubmission.count();

        // Count by Status
        const statusCounts = await BookChapterSubmission.findAll({
            attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('status')), 'count']],
            group: ['status'],
            raw: true
        }) as unknown as { status: string, count: string }[];

        // Count by Month (Last 12 months)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const submissionsByMonth = await BookChapterSubmission.findAll({
            attributes: [
                [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('submissionDate')), 'month'],
                [Sequelize.fn('COUNT', '*'), 'count']
            ],
            where: {
                submissionDate: {
                    [Op.gte]: oneYearAgo
                }
            },
            group: [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('submissionDate'))],
            order: [[Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('submissionDate')), 'ASC']],
            raw: true
        });

        // Pending Reviews Count
        const pendingReviews = await BookChapterSubmission.count({
            where: {
                status: {
                    [Op.in]: [
                        BookChapterStatus.ABSTRACT_SUBMITTED,
                        BookChapterStatus.REVIEWER_ASSIGNMENT,
                        BookChapterStatus.UNDER_REVIEW
                    ]
                }
            }
        });

        return sendSuccess(res, {
            totalSubmissions,
            statusCounts: statusCounts.reduce((acc: any, curr) => {
                acc[curr.status] = parseInt(curr.count);
                return acc;
            }, {}),
            monthlyTrends: submissionsByMonth.map((item: any) => ({
                month: item.month,
                count: parseInt(item.count)
            })),
            pendingActions: pendingReviews
        }, 'Statistics retrieved successfully');

    } catch (error) {
        console.error('❌ Get statistics error:', error);
        return sendError(res, 'Failed to get statistics', 500);
    }
};

/**
 * @route GET /api/book-chapters/admin/submissions
 * @desc Get all submissions for admin dashboard
 * @access Private (Admin)
 */
export const getAdminSubmissions = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;

        if (!user || (!user.hasRole(UserRole.ADMIN) && !user.hasRole(UserRole.DEVELOPER))) {
            return sendError(res, 'Admin access required', 403);
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = (page - 1) * limit;
        const tab = (req.query.tab as string) || 'new'; // default to 'new'

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Define conditions for each tab
        const newCondition = {
            status: BookChapterStatus.ABSTRACT_SUBMITTED,
            submissionDate: { [Op.gte]: thirtyDaysAgo }
        };

        const unassignedCondition = {
            status: BookChapterStatus.ABSTRACT_SUBMITTED,
            submissionDate: { [Op.lt]: thirtyDaysAgo }
        };

        const activeCondition = {
            status: {
                [Op.in]: [
                    BookChapterStatus.MANUSCRIPTS_PENDING,
                    BookChapterStatus.REVIEWER_ASSIGNMENT,
                    BookChapterStatus.UNDER_REVIEW,
                    BookChapterStatus.EDITORIAL_REVIEW,
                    BookChapterStatus.APPROVED,
                    BookChapterStatus.ISBN_APPLIED,
                    BookChapterStatus.PUBLICATION_IN_PROGRESS
                ]
            }
        };

        const completedCondition = {
            status: {
                [Op.in]: [
                    BookChapterStatus.PUBLISHED,
                    BookChapterStatus.REJECTED
                ]
            }
        };

        // 1. Calculate Tab Counts with a single SQL query (much faster than 4 sequential COUNTs)
        const tabCountResult = await BookChapterSubmission.findOne({
            attributes: [
                [
                    Sequelize.fn('SUM', Sequelize.literal(
                        `CASE WHEN status = '${BookChapterStatus.ABSTRACT_SUBMITTED}' AND "submissionDate" >= '${thirtyDaysAgo.toISOString()}' THEN 1 ELSE 0 END`
                    )),
                    'new'
                ],
                [
                    Sequelize.fn('SUM', Sequelize.literal(
                        `CASE WHEN status = '${BookChapterStatus.ABSTRACT_SUBMITTED}' AND "submissionDate" < '${thirtyDaysAgo.toISOString()}' THEN 1 ELSE 0 END`
                    )),
                    'unassigned'
                ],
                [
                    Sequelize.fn('SUM', Sequelize.literal(
                        `CASE WHEN status IN ('${BookChapterStatus.MANUSCRIPTS_PENDING}','${BookChapterStatus.REVIEWER_ASSIGNMENT}','${BookChapterStatus.UNDER_REVIEW}','${BookChapterStatus.EDITORIAL_REVIEW}','${BookChapterStatus.APPROVED}','${BookChapterStatus.ISBN_APPLIED}','${BookChapterStatus.PUBLICATION_IN_PROGRESS}') THEN 1 ELSE 0 END`
                    )),
                    'active'
                ],
                [
                    Sequelize.fn('SUM', Sequelize.literal(
                        `CASE WHEN status IN ('${BookChapterStatus.PUBLISHED}','${BookChapterStatus.REJECTED}') THEN 1 ELSE 0 END`
                    )),
                    'completed'
                ],
            ],
            raw: true,
        }) as any;

        const newCount = parseInt(tabCountResult?.new || '0');
        const unassignedCount = parseInt(tabCountResult?.unassigned || '0');
        const activeCount = parseInt(tabCountResult?.active || '0');
        const completedCount = parseInt(tabCountResult?.completed || '0');

        // 2. Filter Submissions based on the requested Tab
        let whereClause = {};
        switch (tab) {
            case 'new':
                whereClause = newCondition;
                break;
            case 'unassigned':
                whereClause = unassignedCondition;
                break;
            case 'active':
                whereClause = activeCondition;
                break;
            case 'completed':
            case 'archived': // frontend might send archived
                whereClause = completedCondition;
                break;
            default:
                whereClause = newCondition;
        }

        const { count, rows: submissions } = await BookChapterSubmission.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            include: [
                {
                    model: User,
                    as: 'submitter',
                    attributes: ['id', 'fullName', 'email'],
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
                tabCounts: {
                    new: newCount,
                    unassigned: unassignedCount,
                    active: activeCount,
                    completed: completedCount,
                }
            },
            'Admin submissions retrieved successfully'
        );
    } catch (error) {
        console.error('❌ Get admin submissions error:', error);
        return sendError(res, 'Failed to retrieve submissions', 500);
    }
};

/**
 * @route POST /api/book-chapters/:id/assign-editor
 * @desc Admin assigns editor to submission
 * @access Private (Admin)
 */
export const assignEditor = async (req: AuthRequest, res: Response) => {
    // Get sequelize from the model
    const sequelize = BookChapterSubmission.sequelize;

    if (!sequelize) {
        return sendError(res, 'Database connection not initialized', 500);
    }

    const transaction = await sequelize.transaction();

    try {
        const user = req.authenticatedUser;
        const submissionId = parseInt(req.params.id);
        const { editorId, notes } = req.body;

        if (!user || (!user.hasRole(UserRole.ADMIN) && !user.hasRole(UserRole.DEVELOPER))) {
            await transaction.rollback();
            return sendError(res, 'Admin access required', 403);
        }

        if (isNaN(submissionId) || !editorId) {
            await transaction.rollback();
            return sendError(res, 'Editor ID is required', 400);
        }

        const submission = await BookChapterSubmission.findByPk(submissionId, { transaction });

        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        const editor = await User.findByPk(editorId);
        if (!editor || !editor.hasRole(UserRole.EDITOR)) {
            await transaction.rollback();
            return sendError(res, 'Invalid editor ID or user is not an editor', 400);
        }

        // Assign editor
        submission.assignedEditorId = editorId;

        // Status stays as ABSTRACT_SUBMITTED — editor assignment doesn't change the status
        // The editor will review and accept/reject the abstract, which changes the status

        submission.lastUpdatedBy = user.id;
        await submission.save({ transaction });

        // Create status history
        await BookChapterStatusHistory.create(
            {
                submissionId: submission.id,
                previousStatus: submission.status, // might have changed above
                newStatus: submission.status,
                changedBy: user.id,
                action: 'Editor Assigned',
                notes: notes || `Admin assigned editor: ${editor.fullName}`,
                metadata: {
                    editorId: editor.id,
                    editorName: editor.fullName,
                    assignedBy: user.fullName,
                },
            },
            { transaction }
        );

        await transaction.commit();

        // Notify Editor
        const displayBookTitle = await resolveDisplayBookTitle(submission.bookTitle);
        const resolvedChapterTitles = await submission.getResolvedChapterTitlesString();

        Promise.all([
            notificationService.createNotification({
                recipientId: editor.id,
                senderId: user.id,
                type: NotificationType.INFO,
                category: NotificationCategory.SUBMISSION,
                title: 'New Submission Assigned',
                message: `You have been assigned to manage submission: "${displayBookTitle}"`,
                relatedEntityId: submission.id,
                relatedEntityType: 'BookChapterSubmission'
            }),
            sendBookChapterEditorAssignedEmail(
                editor.email,
                editor.fullName,
                {
                    authorName: submission.getMainAuthorName(),
                    bookTitle: displayBookTitle,
                    chapters: resolvedChapterTitles,
                    assignedBy: user.fullName,
                    submissionId: submission.id
                }
            )
        ]).catch(err => console.error('❌ Error sending editor assignment notifications:', err));

        return sendSuccess(res, submission, 'Editor assigned successfully');
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Assign editor error:', error);
        return sendError(res, 'Failed to assign editor', 500);
    }
};
