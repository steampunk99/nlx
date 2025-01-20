const { PrismaClient } = require('@prisma/client');
const notificationService = require('../services/notification.service');

const prisma = new PrismaClient();

class AdminNotificationUtils {
    async getAdminUsers() {
        return prisma.user.findMany({
            where: {
                role: 'ADMIN'
            }
        });
    }

    async notifyAdmins({ title, message, type }) {
        const admins = await this.getAdminUsers();
        
        for (const admin of admins) {
            await notificationService.create({
                userId: admin.id,
                title,
                message,
                type
            });
        }
    }

    // Predefined notification types
    async newUserRegistered(user) {
        await this.notifyAdmins({
            title: 'New User Registration',
            message: `${user.firstName} ${user.lastName} (${user.email}) has joined the platform.`,
            type: 'NEW_USER'
        });
    }

    async newReferralJoined(referrer, referee) {
        await this.notifyAdmins({
            title: 'New Referral Joined',
            message: `${referrer.firstName} ${referrer.lastName} has referred ${referee.firstName} ${referee.lastName}.`,
            type: 'NEW_REFERRAL'
        });
    }

    async commissionEarned(user, amount, packageName) {
        await this.notifyAdmins({
            title: 'Commission Earned',
            message: `${user.firstName} ${user.lastName} has earned a commission of ${amount} from ${packageName} package.`,
            type: 'COMMISSION_EARNED'
        });
    }

    async systemAlert(title, message) {
        await this.notifyAdmins({
            title: `System Alert: ${title}`,
            message,
            type: 'SYSTEM_ALERT'
        });
    }
}

module.exports = new AdminNotificationUtils();
