import { Response } from 'express';
import { Op } from 'sequelize';
import ProjectInternshipSubmission, { SubmissionStatus, SubmissionType } from '../models/projectInternshipSubmission';
import User, { UserRole } from '../models/user';
import { sendSuccess, sendError } from '../utils/responseHandler';
import { AuthRequest } from '../middleware/auth';
import emailService from '../utils/emailService';
import notificationService from '../services/notificationService';
import { NotificationType, NotificationCategory } from '../models/notification';

/**
 * Submit a project or internship application
 */
export const submitApplication = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.authenticatedUser?.id;
        if (!userId) {
            return sendError(res, 'User not authenticated', 401);
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return sendError(res, 'User not found', 404);
        }

        const { submissionType, data } = req.body;

        if (!Object.values(SubmissionType).includes(submissionType)) {
            return sendError(res, 'Invalid submission type', 400);
        }

        // Internship specific role check: Only Students (USER or STUDENT role) allowed
        const allowedInternshipRoles = [UserRole.USER, UserRole.STUDENT];
        if (submissionType === SubmissionType.INTERNSHIP && !allowedInternshipRoles.includes(user.role)) {
            return sendError(res, 'Only students are allowed to fill the form', 403);
        }

        // Generate Custom Application ID
        const typePrefix = submissionType === SubmissionType.WEB ? 'WEB' :
            submissionType === SubmissionType.MOBILE ? 'MOB' : 'INT';

        const count = await ProjectInternshipSubmission.count() + 1;
        const countPart = count.toString(36).toUpperCase().padStart(2, '0');
        const timePart = Date.now().toString(36).toUpperCase().slice(-5);
        const applicationId = `${typePrefix}${countPart}${timePart}`;

        // Create Submission
        const submission = await ProjectInternshipSubmission.create({
            submittedBy: userId,
            submissionType,
            status: SubmissionStatus.PENDING,
            data,
            applicationId
        });

        // Upgrade user role from 'user' to 'student' on internship submission
        if (submissionType === SubmissionType.INTERNSHIP && user.role === UserRole.USER) {
            user.role = UserRole.STUDENT;
            await user.save();
        }

        // Notifications & Emails (Backgrounded & Robust)
        (async () => {
            try {
                const admins = await User.findAll({
                    where: { role: { [Op.in]: [UserRole.ADMIN, UserRole.DEVELOPER] } }
                });

                const notificationTitle = `New ${submissionType} Application`;
                const notificationMessage = `${user.fullName} has submitted a new ${submissionType.toLowerCase()} application.`;
                const userNotificationTitle = `${submissionType} Application Received`;
                const userNotificationMessage = `Thank you! Your ${submissionType.toLowerCase()} application (#${applicationId}) has been received successfully.`;

                // We use Promise.allSettled to ensure that one failure (e.g. a bad admin email) 
                // does not block the applicant's notification or confirmation email.
                await Promise.allSettled([
                    // 1. In-app notifications for admins
                    ...admins.map(admin => notificationService.createNotification({
                        recipientId: admin.id,
                        senderId: userId,
                        type: NotificationType.INFO,
                        category: NotificationCategory.SYSTEM,
                        title: notificationTitle,
                        message: notificationMessage,
                        relatedEntityId: submission.id,
                        relatedEntityType: 'ProjectInternshipSubmission'
                    })),

                    // 2. In-app notification for the applicant (This was likely "missing")
                    notificationService.createNotification({
                        recipientId: userId,
                        senderId: userId,
                        type: NotificationType.SUCCESS,
                        category: NotificationCategory.SYSTEM,
                        title: userNotificationTitle,
                        message: userNotificationMessage,
                        relatedEntityId: submission.id,
                        relatedEntityType: 'ProjectInternshipSubmission'
                    }),

                    // 3. Email to Primary Admin
                    (async () => {
                        const primaryAdmin = admins.find(a => a.role === UserRole.ADMIN) || admins[0];
                        if (primaryAdmin) {
                            await emailService.sendProjectApplicationEmail(
                                primaryAdmin.email,
                                primaryAdmin.fullName,
                                {
                                    applicantName: user.fullName,
                                    submissionType,
                                    applicationId,
                                    submissionDate: submission.createdAt
                                }
                            );
                        }
                    })(),

                    // 4. Email to User (Confirmation)
                    (async () => {
                        const confirmationEmail = data?.email || user.email;
                        const confirmationName = data?.name || user.fullName;
                        await emailService.sendProjectSubmissionConfirmationEmail(
                            confirmationEmail,
                            confirmationName,
                            {
                                submissionType,
                                applicationId,
                                submissionDate: submission.createdAt
                            }
                        );
                    })()
                ]);
            } catch (notifErr) {
                console.error(`❌ Project submission background tasks failed for ${applicationId}:`, notifErr);
            }
        })();

        return sendSuccess(res, submission, 'Application submitted successfully', 201);
    } catch (error) {
        console.error('Submit application error:', error);
        return sendError(res, 'Failed to submit application', 500);
    }
};

/**
 * Get current user's submissions
 */
export const getMySubmissions = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.authenticatedUser?.id;
        const submissions = await ProjectInternshipSubmission.findAll({
            where: { submittedBy: userId },
            order: [['createdAt', 'DESC']]
        });
        return sendSuccess(res, submissions, 'Submissions retrieved successfully');
    } catch (error) {
        console.error('Get my submissions error:', error);
        return sendError(res, 'Failed to retrieve submissions', 500);
    }
};

/**
 * Get all submissions (Admin)
 */
export const getAllSubmissions = async (req: AuthRequest, res: Response) => {
    try {
        const { status, type } = req.query;
        const whereConditions: any = {};

        if (status) whereConditions.status = status;
        if (type) whereConditions.submissionType = type;

        const submissions = await ProjectInternshipSubmission.findAll({
            where: whereConditions,
            include: [
                {
                    model: User,
                    as: 'applicant',
                    attributes: ['fullName', 'email']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        return sendSuccess(res, submissions, 'All submissions retrieved successfully');
    } catch (error) {
        console.error('Get all submissions error:', error);
        return sendError(res, 'Failed to retrieve submissions', 500);
    }
};

/**
 * Get submission by ID
 */
export const getSubmissionById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const submission = await ProjectInternshipSubmission.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'applicant',
                    attributes: ['fullName', 'email', 'id']
                },
                {
                    model: User,
                    as: 'reviewer',
                    attributes: ['fullName']
                }
            ]
        });

        if (!submission) {
            return sendError(res, 'Submission not found', 404);
        }

        const user = req.authenticatedUser!;
        const isAdmin = [UserRole.ADMIN, UserRole.DEVELOPER, UserRole.EDITOR].includes(user.role as UserRole);

        if (!isAdmin && submission.submittedBy !== user.id) {
            return sendError(res, 'You do not have permission to view this application', 403);
        }

        return sendSuccess(res, submission, 'Submission retrieved successfully');
    } catch (error) {
        console.error('Get submission error:', error);
        return sendError(res, 'Failed to retrieve submission', 500);
    }
};

/**
 * Update submission status
 */
export const updateSubmissionStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;
        const reviewerId = req.authenticatedUser?.id;

        if (!Object.values(SubmissionStatus).includes(status)) {
            return sendError(res, 'Invalid status', 400);
        }

        if (!adminNotes || adminNotes.trim() === '') {
            return sendError(res, 'Reviewer notes / feedback is mandatory', 400);
        }

        const submission = await ProjectInternshipSubmission.findByPk(id, {
            include: [{ model: User, as: 'applicant' }]
        });

        if (!submission) {
            return sendError(res, 'Submission not found', 404);
        }

        submission.status = status;
        submission.adminNotes = adminNotes;
        submission.reviewedBy = reviewerId || null;
        await submission.save();

        const applicant = (submission as any).applicant;

        // Notifications & Email (Backgrounded for performance)
        if (applicant) {
            (async () => {
                try {
                    const notifType = status === SubmissionStatus.ACCEPTED ? NotificationType.SUCCESS : NotificationType.ERROR;
                    const title = status === SubmissionStatus.ACCEPTED ? 'Application Accepted' : 'Application Update';
                    let message = status === SubmissionStatus.ACCEPTED
                        ? `Congratulations! Your ${submission.submissionType.toLowerCase()} application has been accepted.`
                        : `Your ${submission.submissionType.toLowerCase()} application has been reviewed and updated to ${status}.`;

                    if (adminNotes) {
                        message += `\n\nFeedback: ${adminNotes}`;
                    }

                    await notificationService.createNotification({
                        recipientId: applicant.id,
                        senderId: reviewerId,
                        type: notifType,
                        category: NotificationCategory.SYSTEM,
                        title: title,
                        message: message,
                        relatedEntityId: submission.id,
                        relatedEntityType: 'ProjectInternshipSubmission'
                    });

                    // Email triggering
                    await emailService.sendProjectDecisionEmail(
                        applicant.email,
                        applicant.fullName,
                        {
                            decision: status as 'ACCEPTED' | 'REJECTED',
                            submissionType: submission.submissionType,
                            adminNotes: adminNotes,
                            applicationId: submission.applicationId || 'N/A'
                        }
                    );
                } catch (notifErr) {
                    console.error('Failed to send background status update notifications:', notifErr);
                }
            })();
        }

        return sendSuccess(res, submission, `Submission ${status.toLowerCase()} successfully`);
    } catch (error) {
        console.error('Update submission status error:', error);
        return sendError(res, 'Failed to update submission status', 500);
    }
};
