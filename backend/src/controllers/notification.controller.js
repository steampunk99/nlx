const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const notificationService = require('../services/notification.service');
const { logger } = require('../services/logger.service');

class NotificationController {
    async getNotifications(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 10, type, startDate, endDate } = req.query;

            const notifications = await notificationService.findAll(
                userId,
                parseInt(page),
                parseInt(limit),
                {
                    type,
                    startDate: startDate ? new Date(startDate) : null,
                    endDate: endDate ? new Date(endDate) : null
                }
            );

            res.json({
                success: true,
                data: notifications
            });
        } catch (error) {
            logger.error('Get notifications error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch notifications'
            });
        }
    }

    async markAsRead(req, res) {
        try {
            const { notificationId } = req.params;

            await notificationService.markAsRead(parseInt(notificationId));

            res.json({
                success: true,
                message: 'Notification marked as read'
            });
        } catch (error) {
            logger.error('Mark notification as read error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to mark notification as read'
            });
        }
    }

    async markAllAsRead(req, res) {
        try {
            const userId = req.user.id;

            await notificationService.markAllAsRead(userId);

            res.json({
                success: true,
                message: 'All notifications marked as read'
            });
        } catch (error) {
            logger.error('Mark all notifications as read error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to mark all notifications as read'
            });
        }
    }

    async deleteNotification(req, res) {
        try {
            const { notificationId } = req.params;

            await notificationService.delete(parseInt(notificationId));

            res.json({
                success: true,
                message: 'Notification deleted successfully'
            });
        } catch (error) {
            logger.error('Delete notification error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete notification'
            });
        }
    }

    async getUnreadCount(req, res) {
        try {
            const userId = req.user.id;
            const { type } = req.query;

            const count = await notificationService.getUnreadCount({
                userId,
                type
            });

            res.json({
                success: true,
                data: { count }
            });
        } catch (error) {
            logger.error('Get unread count error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get unread count'
            });
        }
    }

    async getNotificationPreferences(req, res) {
        try {
            const userId = req.user.id;

            const preferences = await notificationService.getNotificationPreferences(userId);

            res.json({
                success: true,
                data: preferences
            });
        } catch (error) {
            logger.error('Get notification preferences error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get notification preferences'
            });
        }
    }

    async updateNotificationPreferences(req, res) {
        try {
            const userId = req.user.id;
            const preferences = req.body;

            await notificationService.updateNotificationPreferences({
                userId,
                preferences
            });

            res.json({
                success: true,
                message: 'Notification preferences updated successfully'
            });
        } catch (error) {
            logger.error('Update notification preferences error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update notification preferences'
            });
        }
    }
}

module.exports = new NotificationController();
