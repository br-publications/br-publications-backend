import { Response } from 'express';
import { Op } from 'sequelize';
import RecruitmentSubmission, { RecruitmentStatus, AppliedRole } from '../models/recruitmentSubmission';
import User, { UserRole } from '../models/user';
import { sendSuccess, sendError } from '../utils/responseHandler';
import { AuthRequest } from '../middleware/auth';
import emailService from '../utils/emailService';
import notificationService from '../services/notificationService';
import { NotificationType, NotificationCategory } from '../models/notification';

/**
 * Submit a recruitment form
 */
export const submitRecruitment = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.authenticatedUser?.id;
        if (!userId) {
            return sendError(res, 'User not authenticated', 401);
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return sendError(res, 'User not found', 404);
        }

        // 1. Eligibility Check
        const ineligibleRoles = [UserRole.AUTHOR, UserRole.REVIEWER, UserRole.EDITOR, UserRole.ADMIN, UserRole.DEVELOPER];
        if (ineligibleRoles.includes(user.role)) {
            return sendError(res, 'You are not eligible to apply as you already have a higher role.', 403);
        }

        // 2. Duplicate Check (Active PENDING application)
        const existingSubmission = await RecruitmentSubmission.findOne({
            where: {
                submittedBy: userId,
                status: RecruitmentStatus.PENDING
            }
        });

        if (existingSubmission) {
            return sendError(res, 'You already have a pending application.', 400);
        }

        // 3. Generate Custom Application ID
        const { appliedRole } = req.body;
        const rolePrefix = appliedRole === AppliedRole.EDITOR ? 'ED' : 'RE';
        const count = await RecruitmentSubmission.count() + 1;
        const countPart = count.toString(36).toUpperCase().padStart(2, '0');
        const timePart = Date.now().toString(36).toUpperCase().slice(-5);
        const applicationId = `${rolePrefix}${countPart}${timePart}`;

        // 4. Create Submission
        const submissionData = {
            ...req.body,
            submittedBy: userId,
            status: RecruitmentStatus.PENDING,
            applicationId: applicationId
        };

        // If an image was uploaded, store its relative URL
        if (req.file) {
            submissionData.personalImage = `/uploads/recruitment/${req.file.filename}`;
        }

        const submission = await RecruitmentSubmission.create(submissionData);

        // 5. Notifications (Non-blocking)
        (async () => {
            try {
                // Find all admins and developers to notify (Editors excluded per request)
                const admins = await User.findAll({
                    where: {
                        role: {
                            [Op.in]: [UserRole.ADMIN, UserRole.DEVELOPER]
                        }
                    }
                });

                // In-app notifications in parallel
                const notifPromises = admins.map(admin => notificationService.createNotification({
                    recipientId: admin.id,
                    senderId: userId,
                    type: NotificationType.INFO,
                    category: NotificationCategory.SYSTEM,
                    title: 'New Recruitment Application',
                    message: `${user.fullName} has applied for the ${appliedRole.toUpperCase()} role.`,
                    relatedEntityId: submission.id,
                    relatedEntityType: 'RecruitmentSubmission'
                }));

                // Email to Admin (picking the first admin as primary contact, or use a system env)
                const primaryAdmin = admins.find(a => a.role === UserRole.ADMIN) || admins[0];
                if (primaryAdmin) {
                    notifPromises.push(emailService.sendRecruitmentApplicationEmail(
                        primaryAdmin.email,
                        primaryAdmin.fullName,
                        {
                            applicantName: user.fullName,
                            appliedRole: appliedRole,
                            applicationId: applicationId,
                            submissionDate: submission.createdAt || new Date()
                        }
                    ));
                }

                // Email to User (Confirmation)
                notifPromises.push(emailService.sendRecruitmentSubmissionConfirmationEmail(
                    user.email,
                    user.fullName,
                    {
                        appliedRole: appliedRole,
                        applicationId: applicationId,
                        submissionDate: submission.createdAt || new Date()
                    }
                ));

                await Promise.allSettled(notifPromises);
            } catch (notifErr) {
                console.error('Failed to send application notifications in background:', notifErr);
            }
        })();

        return sendSuccess(res, submission, 'Application submitted successfully', 201);
    } catch (error) {
        console.error('Submit recruitment error:', error);
        return sendError(res, 'Failed to submit application', 500);
    }
};

/**
 * Get current user's submissions
 */
export const getMySubmissions = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.authenticatedUser?.id;
        const submissions = await RecruitmentSubmission.findAll({
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
 * Get all submissions for Admin/Review
 */
export const getAllSubmissions = async (req: AuthRequest, res: Response) => {
    try {
        const { status, role } = req.query;
        const whereConditions: any = {};

        if (status) whereConditions.status = status;
        if (role) whereConditions.appliedRole = role;

        const submissions = await RecruitmentSubmission.findAll({
            where: whereConditions,
            include: [
                {
                    model: User,
                    as: 'applicant',
                    attributes: ['fullName', 'email', 'role']
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
        const submission = await RecruitmentSubmission.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'applicant',
                    attributes: ['fullName', 'email', 'username', 'role']
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

        // Check permissions: Admin/Editor can see all, regular user only their own
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
 * Update submission status (Accept/Reject)
 */
export const updateSubmissionStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status, adminNotes, assignedRole } = req.body;
        const reviewerId = req.authenticatedUser?.id;

        if (!Object.values(RecruitmentStatus).includes(status)) {
            return sendError(res, 'Invalid status', 400);
        }

        const submission = await RecruitmentSubmission.findByPk(id, {
            include: [{ model: User, as: 'applicant' }]
        });
        if (!submission) {
            return sendError(res, 'Submission not found', 404);
        }

        // Permission check: Editors can only decide for Reviewers
        if (req.authenticatedUser?.role === UserRole.EDITOR && submission.appliedRole !== AppliedRole.REVIEWER) {
            return sendError(res, 'Editors can only review Reviewer applications.', 403);
        }

        const applicant = (submission as any).applicant;
        if (!applicant) {
            return sendError(res, 'Applicant not found', 404);
        }

        submission.status = status;
        submission.adminNotes = adminNotes;
        submission.reviewedBy = reviewerId || null;
        await submission.save();

        // If ACCEPTED, update user role and profile data
        if (status === RecruitmentStatus.ACCEPTED) {
            const finalRole = assignedRole || submission.appliedRole;
            applicant.role = finalRole as unknown as UserRole;
            
            // Sync Profile Data from Submission
            applicant.fullName = `${submission.firstName} ${submission.lastName}`;
            applicant.phoneNumber = submission.phoneNumber || applicant.phoneNumber;
            applicant.designation = submission.designation || applicant.designation;
            applicant.department = submission.department || applicant.department;
            applicant.organization = submission.instituteName || applicant.organization;
            applicant.city = submission.city || applicant.city;
            applicant.state = submission.state || applicant.state;
            applicant.country = submission.country || applicant.country;
            applicant.qualification = submission.highestQualification || applicant.qualification;
            applicant.bio = submission.biography || applicant.bio;
            
            if (submission.personalImage) {
                applicant.profilePicture = submission.personalImage;
            }

            await applicant.save();

            // Send acceptance notifications (Non-blocking)
            (async () => {
                try {
                    // In-app notification
                    const notifPromise = notificationService.createNotification({
                        recipientId: applicant.id,
                        senderId: reviewerId,
                        type: NotificationType.SUCCESS,
                        category: NotificationCategory.SYSTEM,
                        title: 'Application Accepted',
                        message: `Congratulations! Your application for ${finalRole.toUpperCase()} has been accepted.`,
                        relatedEntityId: submission.id,
                        relatedEntityType: 'RecruitmentSubmission'
                    });

                    // Email
                    const emailPromise = emailService.sendRecruitmentDecisionEmail(
                        applicant.email || '',
                        applicant.fullName || 'Applicant',
                        {
                            decision: 'ACCEPTED',
                            assignedRole: finalRole,
                            adminNotes: adminNotes,
                            applicationId: submission.applicationId || ''
                        }
                    );

                    await Promise.allSettled([notifPromise, emailPromise]);
                } catch (notifErr) {
                    console.error('Failed to send acceptance notifications in background:', notifErr);
                }
            })();
        } else if (status === RecruitmentStatus.REJECTED) {
            // Send rejection notifications (Non-blocking)
            (async () => {
                try {
                    // In-app notification
                    const notifPromise = notificationService.createNotification({
                        recipientId: applicant.id,
                        senderId: reviewerId,
                        type: NotificationType.ERROR,
                        category: NotificationCategory.SYSTEM,
                        title: 'Application Update',
                        message: `Your application for ${submission.appliedRole.toUpperCase()} has been reviewed.`,
                        relatedEntityId: submission.id,
                        relatedEntityType: 'RecruitmentSubmission'
                    });

                    // Email
                    const emailPromise = emailService.sendRecruitmentDecisionEmail(
                        applicant.email || '',
                        applicant.fullName || 'Applicant',
                        {
                            decision: 'REJECTED',
                            adminNotes: adminNotes,
                            applicationId: submission.applicationId || ''
                        }
                    );

                    await Promise.allSettled([notifPromise, emailPromise]);
                } catch (notifErr) {
                    console.error('Failed to send rejection notifications in background:', notifErr);
                }
            })();
        }

        return sendSuccess(res, submission, `Submission ${status.toLowerCase()} successfully`);
    } catch (error) {
        console.error('Update submission status error:', error);
        return sendError(res, 'Failed to update submission status', 500);
    }
};
