const { PrismaClient } = require('@prisma/client');
const { logger } = require('../services/logger.service');
const prisma = new PrismaClient();

class NotificationService {
    async findAll(userId, page = 1, limit = 10, filters = {}) {
        const { startDate, endDate, type, isRead } = filters;
        const where = { userId };

        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        if (type) {
            where.type = type;
        }

        if (isRead !== undefined) {
            where.isRead = isRead;
        }

        const skip = (page - 1) * limit;

        try {
            const [notifications, total] = await Promise.all([
                prisma.notification.findMany({
                    where,
                    include: {
                        user: true
                    },
                    orderBy: [
                        { createdAt: 'desc' }
                    ],
                    skip,
                    take: limit
                }),
                prisma.notification.count({ where })
            ]);

            return {
                data: notifications,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            logger.error('Error fetching notifications:', {
                error: error.message,
                userId,
                filters
            });
            throw error;
        }
    }

    async findById(id) {
        return prisma.notification.findUnique({
            where: { id },
            include: {
                user: true
            }
        });
    }

    async create(data, tx = prisma) {
        try {
            return tx.notification.create({
                data: {
                    userId: data.userId,
                    title: data.title,
                    message: data.message,
                    type: data.type,
                    isRead: false
                }
            });
        } catch (error) {
            logger.error('Error creating notification:', {
                error: error.message,
                data
            });
            throw error;
        }
    }

    async markAsRead(id) {
        return prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
    }

    async markAllAsRead(userId) {
        return prisma.notification.updateMany({
            where: { userId },
            data: { isRead: true }
        });
    }

    async delete(id) {
        return prisma.notification.delete({
            where: { id }
        });
    }

    async deleteAll(userId) {
        return prisma.notification.deleteMany({
            where: { userId }
        });
    }

    // System Notifications
    async createSystemNotification(userId, title, message, tx = prisma) {
        return this.create({
            userId,
            title,
            message,
            type: 'SYSTEM'
        }, tx);
    }

    // Payment Notifications
    async createPaymentNotification(userId, amount, status, tx = prisma) {
        const title = status === 'SUCCESSFUL' ? 'Payment Successful' : 'Payment Failed';
        const message = status === 'SUCCESSFUL' 
            ? `Your payment of ${amount} has been processed successfully.`
            : `Your payment of ${amount} has failed. Please try again.`;

        return this.create({
            userId,
            title,
            message,
            type: 'PAYMENT'
        }, tx);
    }

    // Withdrawal Notifications
    async createWithdrawalNotification(userId, amount, status, tx = prisma) {
        const title = `Withdrawal ${status.toLowerCase()}`;
        const message = this.getWithdrawalMessage(status, amount);

        return this.create({
            userId,
            title,
            message,
            type: 'WITHDRAWAL'
        }, tx);
    }

    getWithdrawalMessage(status, amount) {
        switch (status) {
            case 'SUCCESSFUL':
                return `Your withdrawal of ${amount} has been processed successfully.`;
            case 'FAILED':
                return `Your withdrawal of ${amount} has failed. Please contact support.`;
            case 'PENDING':
                return `Your withdrawal request of ${amount} is being processed.`;
            case 'CANCELLED':
                return `Your withdrawal request of ${amount} has been cancelled.`;
            default:
                return `Your withdrawal request of ${amount} status has been updated to ${status}.`;
        }
    }

    // Commission Notifications
    async createCommissionNotification(userId, amount, level, tx = prisma) {
        return this.create({
            userId,
            title: 'Commission Earned',
            message: `You have earned a Level ${level} commission of ${amount}.`,
            type: 'COMMISSION'
        }, tx);
    }

    // Package Notifications
    async createPackageNotification(userId, packageName, event, tx = prisma) {
        let title, message;

        switch (event) {
            case 'PURCHASE':
                title = 'Package Purchased';
                message = `You have successfully purchased the ${packageName} package.`;
                break;
            case 'UPGRADE':
                title = 'Package Upgraded';
                message = `Your package has been upgraded to ${packageName}.`;
                break;
            case 'EXPIRING':
                title = 'Package Expiring Soon';
                message = `Your ${packageName} package will expire soon.`;
                break;
            default:
                title = 'Package Update';
                message = `Your ${packageName} package has been updated.`;
        }

        return this.create({
            userId,
            title,
            message,
            type: 'PACKAGE'
        }, tx);
    }

    async getNotificationStats(userId) {
        const [unread, total] = await Promise.all([
            prisma.notification.count({
                where: {
                    userId,
                    isRead: false
                }
            }),
            prisma.notification.count({
                where: {
                    userId
                }
            })
        ]);

        return {
            unread,
            total,
            readPercentage: total > 0 ? ((total - unread) / total) * 100 : 0
        };
    }
}

module.exports = new NotificationService();
