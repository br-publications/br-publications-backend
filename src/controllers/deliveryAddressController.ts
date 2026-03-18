import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import DeliveryAddress from '../models/deliveryAddress';
import TextBookSubmission, { TextBookStatus } from '../models/textBookSubmission';
import BookChapterSubmission from '../models/bookChapterSubmission';
import { sendSuccess, sendError } from '../utils/responseHandler';
import TextBookStatusHistory from '../models/textBookStatusHistory';
import BookChapterStatusHistory from '../models/bookChapterStatusHistory';
import User, { UserRole } from '../models/user';
import notificationService from '../services/notificationService';
import { NotificationType, NotificationCategory } from '../models/notification';
import { sendBookChapterDeliveryDetailsSubmittedEmail } from '../utils/emails/bookChapterEmails';

/**
 * @route POST /api/delivery-address
 * @desc Save delivery address for a textbook or book chapter submission
 * @access Private (Author)
 */
export const saveDeliveryAddress = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;
        if (!user) {
            return sendError(res, 'User not authenticated', 401);
        }

        const {
            submissionId,
            submissionType, // 'textbook' or 'chapter'
            fullName,
            companyName,
            contactPersonName,
            countryCode,
            mobileNumber,
            altCountryCode,
            altMobileNumber,
            email,
            addressLine1,
            buildingName,
            streetName,
            area,
            landmark,
            city,
            state,
            postalCode,
            country,
            isResidential, // string from frontend: 'residential' | 'commercial'
            deliveryInstructions
        } = req.body;

        if (!submissionId || !submissionType || !fullName || !countryCode || !mobileNumber || !email || !addressLine1 || !city || !state || !postalCode || !country) {
            return sendError(res, 'Required fields are missing', 400);
        }

        if (submissionType !== 'textbook' && submissionType !== 'chapter') {
            return sendError(res, 'Invalid submission type. Must be textbook or chapter', 400);
        }

        // Map isResidential string to boolean
        const isResidentialBool = isResidential === 'residential';

        // Check if address already exists and handle update if needed
        let deliveryAddress;
        if (submissionType === 'textbook') {
            const submission = await TextBookSubmission.findByPk(submissionId);
            if (!submission) return sendError(res, 'Textbook submission not found', 404);
            
            // Allow submitter or corresponding author
            const correspondingAuthor = submission.getCorrespondingAuthor();
            const isCorresponding = correspondingAuthor && correspondingAuthor.email === user.email;
            if (submission.submittedBy !== user.id && !isCorresponding) {
                return sendError(res, 'Unauthorized', 403);
            }

            deliveryAddress = await DeliveryAddress.findOne({ where: { textBookSubmissionId: submissionId } });
        } else if (submissionType === 'chapter') {
            const submission = await BookChapterSubmission.findByPk(submissionId);
            if (!submission) return sendError(res, 'Book chapter submission not found', 404);
            
            // Allow submitter or corresponding author
            const correspondingAuthor = submission.getCorrespondingAuthor();
            const isCorresponding = correspondingAuthor && correspondingAuthor.email === user.email;
            if (submission.submittedBy !== user.id && !isCorresponding) {
                return sendError(res, 'Unauthorized', 403);
            }

            deliveryAddress = await DeliveryAddress.findOne({ where: { bookChapterSubmissionId: submissionId } });
        }

        const addressData = {
            fullName,
            companyName,
            contactPersonName,
            countryCode,
            mobileNumber,
            altCountryCode: altCountryCode || null,
            altMobileNumber: altMobileNumber || null,
            email,
            addressLine1,
            buildingName,
            streetName,
            area,
            landmark,
            city,
            state,
            postalCode,
            country,
            isResidential: isResidentialBool,
            deliveryInstructions
        };

        if (deliveryAddress) {
            // Update existing address
            await deliveryAddress.update(addressData);

            // Still send notifications for update (fire-and-forget, outside transaction)
            if (submissionType === 'chapter') {
                setImmediate(() => {
                    sendDeliveryNotificationsForChapter(user, Number(submissionId)).catch(err => {
                        console.error('❌ Error sending delivery update notifications:', err);
                    });
                });
            }

            return sendSuccess(res, deliveryAddress, 'Delivery address updated successfully');
        }

        const sequelize = TextBookSubmission.sequelize;
        const transaction = sequelize ? await sequelize.transaction() : null;

        try {
            // Create the delivery address if it doesn't exist
            deliveryAddress = await DeliveryAddress.create({
                ...addressData,
                textBookSubmissionId: submissionType === 'textbook' ? submissionId : null,
                bookChapterSubmissionId: submissionType === 'chapter' ? submissionId : null,
            }, { transaction });

            // If it's a textbook and status is AWAITING_DELIVERY_DETAILS, transition to DELIVERY_ADDRESS_RECEIVED
            if (submissionType === 'textbook') {
                const submission = await TextBookSubmission.findByPk(submissionId, { transaction });
                if (submission && submission.status === TextBookStatus.AWAITING_DELIVERY_DETAILS) {
                    const oldStatus = submission.status;
                    submission.status = TextBookStatus.DELIVERY_ADDRESS_RECEIVED;
                    await submission.save({ transaction });

                    // Create status history
                    await TextBookStatusHistory.create({
                        submissionId: submission.id,
                        previousStatus: oldStatus,
                        newStatus: TextBookStatus.DELIVERY_ADDRESS_RECEIVED,
                        changedBy: user.id,
                        notes: 'Delivery address submitted by author. Status automatically updated.',
                        changedAt: new Date()
                    }, { transaction });

                    // Notify admins (in-app only, email is fire-and-forget after commit)
                    const admins = await User.findAll({
                        where: { role: UserRole.ADMIN, isActive: true },
                        transaction
                    });

                    for (const admin of admins) {
                        await notificationService.createNotification({
                            recipientId: admin.id,
                            senderId: user.id,
                            type: NotificationType.INFO,
                            category: NotificationCategory.TEXTBOOK_SUBMISSION,
                            title: 'Delivery Address Submitted',
                            message: `Author ${user.fullName} has submitted delivery details for "${submission.bookTitle}".`,
                            relatedEntityId: submission.id,
                            relatedEntityType: 'TextBookSubmission'
                        });
                    }
                }
            } else if (submissionType === 'chapter') {
                const submission = await BookChapterSubmission.findByPk(submissionId, { transaction });

                if (submission) {
                    // Create status history entry
                    await BookChapterStatusHistory.create({
                        submissionId: submission.id,
                        previousStatus: submission.status,
                        newStatus: submission.status, // Keep current status but log action
                        changedBy: user.id,
                        action: 'DELIVERY_ADDRESS_SUBMITTED',
                        notes: 'Delivery address submitted by author.',
                    }, { transaction });

                    // In-app notifications inside transaction (these are fast DB operations)
                    const admins = await User.findAll({
                        where: { role: UserRole.ADMIN, isActive: true },
                        transaction
                    });

                    const assignedEditor = submission.assignedEditorId
                        ? await User.findByPk(submission.assignedEditorId, { transaction })
                        : null;

                    const recipients = [...admins];
                    if (assignedEditor) {
                        recipients.push(assignedEditor);
                    }

                    // Remove duplicates
                    const uniqueRecipients = Array.from(new Map(recipients.map(u => [u.id, u])).values());

                    for (const recipient of uniqueRecipients) {
                        // In-app notification only (inside transaction)
                        try {
                            await notificationService.createNotification({
                                recipientId: recipient.id,
                                senderId: user.id,
                                type: NotificationType.INFO,
                                category: NotificationCategory.SUBMISSION_UPDATE,
                                title: 'Delivery Address Submitted',
                                message: `Author ${user.fullName} has submitted delivery details for "${submission.bookTitle}".`,
                                relatedEntityId: submission.id,
                                relatedEntityType: 'BookChapterSubmission',
                            }, { transaction });
                        } catch (notifErr) {
                            console.error(`❌ Error creating notification for recipient ${recipient.id}:`, notifErr);
                            // Don't let a notification failure block the transaction
                        }
                    }
                }
            }

            if (transaction) await transaction.commit();

            // ─── AFTER COMMIT: Send emails fire-and-forget ───────────────
            // This ensures the DB is saved even if email fails
            if (submissionType === 'chapter') {
                setImmediate(() => {
                    sendDeliveryEmailsForChapter(user, Number(submissionId)).catch(err => {
                        console.error('❌ Error sending delivery emails:', err);
                    });
                });
            }

            return sendSuccess(res, deliveryAddress, 'Delivery address saved successfully', 201);
        } catch (innerError) {
            if (transaction) await transaction.rollback();
            throw innerError;
        }
    } catch (error: any) {
        console.error('❌ Save delivery address error:', error);
        return sendError(res, 'Failed to save delivery address: ' + (error.message || 'Unknown error'), 500);
    }
};

/**
 * Fire-and-forget helper: sends email notifications to admins & assigned editor
 * for book chapter delivery address submissions.
 */
async function sendDeliveryEmailsForChapter(user: any, submissionId: number) {
    try {
        const submission = await BookChapterSubmission.findByPk(submissionId, {
            include: [{ model: User, as: 'assignedEditor', attributes: ['id', 'fullName', 'email'] }]
        });
        if (!submission) return;

        const admins = await User.findAll({ where: { role: UserRole.ADMIN, isActive: true } });
        const assignedEditor = (submission as any).assignedEditor;

        const recipients: { email: string; fullName: string }[] = [...admins];
        if (assignedEditor) {
            const alreadyIncluded = recipients.some(r => r.email === assignedEditor.email);
            if (!alreadyIncluded) recipients.push(assignedEditor);
        }

        for (const recipient of recipients) {
            try {
                await sendBookChapterDeliveryDetailsSubmittedEmail(recipient.email, recipient.fullName, {
                    authorName: user.fullName,
                    bookTitle: submission.bookTitle,
                    submissionId: submission.id
                });
            } catch (emailErr) {
                console.error(`❌ Failed to send delivery email to ${recipient.email}:`, emailErr);
            }
        }
    } catch (err) {
        console.error('❌ sendDeliveryEmailsForChapter failed:', err);
    }
}

/**
 * Fire-and-forget helper: sends notifications for chapter delivery address updates.
 */
async function sendDeliveryNotificationsForChapter(user: any, submissionId: number) {
    await sendDeliveryEmailsForChapter(user, submissionId);
}
