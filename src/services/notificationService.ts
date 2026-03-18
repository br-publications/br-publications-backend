import Notification, { NotificationType, NotificationCategory } from '../models/notification';
import User from '../models/user';
import templateService from './templateService';
import { CommunicationType } from '../models/communicationTemplate';


interface CreateNotificationDTO {
    recipientId: number;
    senderId?: number;
    type: NotificationType;
    category: NotificationCategory;
    title: string;
    message: string;
    relatedEntityId?: number;
    relatedEntityType?: string;
}

class NotificationService {
    async createNotification(data: CreateNotificationDTO, options?: any) {
        try {
            const notification = await Notification.create(data, options);
            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    /**
     * Create notification using dynamic template
     */
    async createDynamicNotification(
        recipientId: number,
        templateCode: string,
        templateData: any,
        baseData: {
            senderId?: number,
            type: NotificationType,
            category: NotificationCategory,
            relatedEntityId?: number,
            relatedEntityType?: string,
            defaultTitle: string,
            defaultMessage: string
        },
        options?: any
    ) {
        try {
            let title = baseData.defaultTitle;
            let message = baseData.defaultMessage;

            const template = await templateService.getTemplate(templateCode, CommunicationType.NOTIFICATION, templateData);
            if (template) {
                title = template.subject; // Notification title is mapped to subject
                message = template.content;
            }

            return this.createNotification({
                recipientId,
                senderId: baseData.senderId,
                type: baseData.type,
                category: baseData.category,
                title,
                message,
                relatedEntityId: baseData.relatedEntityId,
                relatedEntityType: baseData.relatedEntityType
            }, options);
        } catch (error) {
            console.error(`Error creating dynamic notification ${templateCode}:`, error);
            // Fallback to default if everything fails (fetched above)
            return this.createNotification({
                recipientId,
                senderId: baseData.senderId,
                type: baseData.type,
                category: baseData.category,
                title: baseData.defaultTitle,
                message: baseData.defaultMessage, // Use passed defaults
                relatedEntityId: baseData.relatedEntityId,
                relatedEntityType: baseData.relatedEntityType
            }, options);
        }
    }


    async getUserNotifications(userId: number, page: number = 1, limit: number = 20) {
        try {


            const offset = (page - 1) * limit;
            const { count, rows } = await Notification.findAndCountAll({
                where: { recipientId: userId },
                order: [['createdAt', 'DESC']],
                limit,
                offset,
                include: [
                    {
                        model: User,
                        as: 'sender',
                        attributes: ['id', 'fullName', 'email'],
                    },
                ],
            });



            const unreadCount = await Notification.count({
                where: { recipientId: userId, isRead: false },
            });

            return {
                notifications: rows,
                totalNotifications: count,
                unreadCount,
                currentPage: page,
                totalPages: Math.ceil(count / limit),
            };
        } catch (error: any) {
            console.error('❌ Error fetching user notifications:', error);
            console.error('❌ Error details:', {
                name: error.name,
                message: error.message,
                sql: error.sql,
                stack: error.stack
            });
            throw error;
        }
    }

    async markAsRead(notificationId: number, userId: number) {
        try {
            const notification = await Notification.findOne({
                where: { id: notificationId, recipientId: userId },
            });

            if (!notification) {
                throw new Error('Notification not found');
            }

            notification.isRead = true;
            await notification.save();
            return notification;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    async markAllAsRead(userId: number) {
        try {
            await Notification.update(
                { isRead: true },
                { where: { recipientId: userId, isRead: false } }
            );
            return { success: true };
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    async deleteNotification(notificationId: number, userId: number) {
        try {
            const result = await Notification.destroy({
                where: { id: notificationId, recipientId: userId },
            });

            if (result === 0) {
                throw new Error('Notification not found');
            }

            return { success: true };
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }
}

export default new NotificationService();
