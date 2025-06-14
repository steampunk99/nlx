const { PrismaClient } = require('@prisma/client');
const logger = require('../services/logger.service');
const notificationService = require('../services/notification.service');

const prisma = new PrismaClient();

/**
 * Handles giving activation bonus to users
 */
class BonusUtils {
    /**
     * Give activation bonus to a user after their first successful package payment
     * @param {string} nodeId - The ID of the node receiving the bonus
     * @param {string} paymentId - The ID of the successful payment
     * @param {PrismaClient.TransactionClient} tx - The transaction client
     */
    async giveActivationBonus(nodeId, paymentId, tx) {
        try {
            const node = await tx.node.findUnique({
                where: { id: nodeId },
                include: { user: true }
            });

            if (!node) {
                logger.error('Failed to give activation bonus: Node not found', { nodeId });
                return;
            }

            // Check if this is their first successful package payment
            const previousPayments = await tx.nodePayment.count({
                where: {
                    nodeId: nodeId,
                    status: 'SUCCESSFUL',
                    id: { not: paymentId }
                }
            });

            if (previousPayments > 0) {
                logger.info('Activation bonus not given: Not first payment', { nodeId });
                return;
            }

            // Create bonus statement
            await tx.nodeStatement.create({
                data: {
                    nodeId: nodeId,
                    amount: 1000,
                    type: 'CREDIT',
                    status: 'COMPLETED',
                    description: 'Welcome bonus for activating your account',
                    referenceType: 'BONUS',
                    referenceId: paymentId,
                    completedAt: new Date()
                }
            });

            // Update node's available balance
            await tx.node.update({
                where: { id: nodeId },
                data: {
                    availableBalance: { increment: 1000 }
                }
            });

            // Send notification to user
            await notificationService.create({
                userId: node.userId,
                title: 'Welcome Bonus',
                message: 'Congratulations! You have received a 1,000 UGX welcome bonus for activating your account.',
                type: 'BONUS'
            }, tx);

            logger.info('Activation bonus given successfully', {
                nodeId,
                paymentId,
                amount: 1000
            });
        } catch (error) {
            logger.error('Failed to give activation bonus', {
                error: error.message,
                nodeId,
                paymentId
            });
        }
    }
}

module.exports = new BonusUtils();
