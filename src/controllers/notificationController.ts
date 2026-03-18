import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import notificationService from '../services/notificationService';

class NotificationController {
    async getNotifications(req: AuthRequest, res: Response) {
        try {
            const user = req.authenticatedUser;

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
            }

            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

            const result = await notificationService.getUserNotifications(user.id, page, limit);

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch notifications',
            });
        }
    }

    async markAsRead(req: AuthRequest, res: Response) {
        try {
            const user = req.authenticatedUser;

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
            }

            const notificationId = parseInt(req.params.id);

            await notificationService.markAsRead(notificationId, user.id);

            res.status(200).json({
                success: true,
                message: 'Notification marked as read',
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to mark notification as read',
            });
        }
    }

    async markAllAsRead(req: AuthRequest, res: Response) {
        try {
            const user = req.authenticatedUser;

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
            }

            await notificationService.markAllAsRead(user.id);

            res.status(200).json({
                success: true,
                message: 'All notifications marked as read',
            });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to mark notifications as read',
            });
        }
    }

    async deleteNotification(req: AuthRequest, res: Response) {
        try {
            const user = req.authenticatedUser;

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
            }

            const notificationId = parseInt(req.params.id);

            await notificationService.deleteNotification(notificationId, user.id);

            res.status(200).json({
                success: true,
                message: 'Notification deleted',
            });
        } catch (error) {
            console.error('Error deleting notification:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete notification',
            });
        }
    }
}

export default new NotificationController();
