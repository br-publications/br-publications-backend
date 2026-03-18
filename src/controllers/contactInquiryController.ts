import { Request, Response } from 'express';
import { Op } from 'sequelize';
import ContactInquiry, { InquiryStatus } from '../models/contactInquiry';
import User, { UserRole } from '../models/user';
import { sendSuccess, sendError } from '../utils/responseHandler';
import { AuthRequest } from '../middleware/auth';
import notificationService from '../services/notificationService';
import { NotificationType, NotificationCategory } from '../models/notification';
import { sendContactInquiryAdminEmail, sendContactInquiryAcknowledgedEmail } from '../utils/emails/contactEmails';

/**
 * Submit a contact inquiry (Public — no auth required)
 */
export const submitContactInquiry = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, message } = req.body;

        // Basic validation
        if (!name || !email || !message) {
            return sendError(res, 'Name, email, and message are required.', 400);
        }

        const inquiry = await ContactInquiry.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone?.trim() || null,
            message: message.trim(),
            status: InquiryStatus.PENDING,
        });

        // Notify admins
        try {
            const admins = await User.findAll({
                where: {
                    role: { [Op.in]: [UserRole.ADMIN, UserRole.DEVELOPER] }
                }
            });

            const notifTitle = `New Contact Inquiry from ${name}`;
            const notifMessage = `${name} (${email}) submitted a contact inquiry.`;

            for (const admin of admins) {
                await notificationService.createNotification({
                    recipientId: admin.id,
                    type: NotificationType.INFO,
                    category: NotificationCategory.SYSTEM,
                    title: notifTitle,
                    message: notifMessage,
                    relatedEntityId: inquiry.id,
                    relatedEntityType: 'ContactInquiry',
                });
            }

            // Email to primary admin
            const primaryAdmin = admins.find(a => a.role === UserRole.ADMIN) || admins[0];
            if (primaryAdmin) {
                await sendContactInquiryAdminEmail(
                    primaryAdmin.email,
                    primaryAdmin.fullName,
                    { name, email, phone, message, receivedDate: inquiry.createdAt, inquiryId: inquiry.id }
                );
            }
        } catch (notifErr) {
            console.error('Failed to send contact inquiry notifications:', notifErr);
        }

        return sendSuccess(res, { id: inquiry.id }, 'Your message has been sent. We will get back to you shortly.', 201);
    } catch (error) {
        console.error('Submit contact inquiry error:', error);
        return sendError(res, 'Failed to submit your inquiry. Please try again.', 500);
    }
};

/**
 * Get all inquiries (Admin only)
 */
export const getAllInquiries = async (req: AuthRequest, res: Response) => {
    try {
        const { status, search } = req.query;
        const where: any = {};

        if (status && status !== 'ALL') {
            where.status = status;
        }

        if (search) {
            const q = `%${search}%`;
            where[Op.or] = [
                { name: { [Op.like]: q } },
                { email: { [Op.like]: q } },
                { phone: { [Op.like]: q } },
            ];
        }

        const inquiries = await ContactInquiry.findAll({
            where,
            include: [
                { model: User, as: 'reviewer', attributes: ['fullName', 'email'] }
            ],
            order: [['createdAt', 'DESC']],
        });

        return sendSuccess(res, inquiries, 'Inquiries retrieved successfully');
    } catch (error) {
        console.error('Get all inquiries error:', error);
        return sendError(res, 'Failed to retrieve inquiries', 500);
    }
};

/**
 * Get single inquiry by ID (Admin only)
 */
export const getInquiryById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const inquiry = await ContactInquiry.findByPk(id, {
            include: [
                { model: User, as: 'reviewer', attributes: ['fullName', 'email'] }
            ],
        });

        if (!inquiry) {
            return sendError(res, 'Inquiry not found', 404);
        }

        return sendSuccess(res, inquiry, 'Inquiry retrieved successfully');
    } catch (error) {
        console.error('Get inquiry error:', error);
        return sendError(res, 'Failed to retrieve inquiry', 500);
    }
};

/**
 * Acknowledge an inquiry and send email to submitter (Admin only)
 */
export const acknowledgeInquiry = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { adminNotes } = req.body;
        const reviewerId = req.authenticatedUser?.id;

        if (!adminNotes || !adminNotes.trim()) {
            return sendError(res, 'Acknowledgment message is required.', 400);
        }

        const inquiry = await ContactInquiry.findByPk(id);
        if (!inquiry) {
            return sendError(res, 'Inquiry not found', 404);
        }

        inquiry.status = InquiryStatus.ACKNOWLEDGED;
        inquiry.adminNotes = adminNotes.trim();
        inquiry.reviewedBy = reviewerId || null;
        await inquiry.save();

        // Send acknowledgment email to submitter
        try {
            await sendContactInquiryAcknowledgedEmail(
                inquiry.email,
                inquiry.name,
                {
                    adminMessage: adminNotes.trim(),
                    originalMessage: inquiry.message,
                }
            );
        } catch (emailErr) {
            console.error('Failed to send acknowledgment email:', emailErr);
            // Don't fail the request; the status was saved.
        }

        return sendSuccess(res, inquiry, 'Inquiry acknowledged and email sent to submitter.');
    } catch (error) {
        console.error('Acknowledge inquiry error:', error);
        return sendError(res, 'Failed to acknowledge inquiry', 500);
    }
};
