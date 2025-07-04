const { PrismaClient } = require('@prisma/client');
const { logger } = require('../services/logger.service');
const notificationService = require('../services/notification.service');
const adminNotificationUtils = require('./admin-notification.utils');

const prisma = new PrismaClient();

/**
 * Calculate and distribute commissions for a package purchase
 * @param {Object} user - The user who purchased the package
 * @param {Object} pkg - The package that was purchased
 * @param {Object} tx - Prisma transaction
 */


async function calculateCommissions(nodeId, amount, packageId, tx = prisma) {
    try {
        // Get node details first without transaction
        const node = await tx.node.findUnique({
            where: { id: nodeId },
            include: {
                user: true
            }
        });

        if (!node?.id || !amount) {
            throw new Error('Invalid input parameters for commission calculation');
        }

        logger.info('Starting commission calculation', {
            username: node.user.username,
            amount,
            packageId
        });

        // Get the package details
        const pkg = await tx.package.findUnique({
            where: { id: packageId }
        });

        if (!pkg) {
            throw new Error('Package not found');
        }

        // Get sponsor chain without transaction
        const sponsorChain = await getSponsorChain(node.id, 3);

        const commissionRates = {
            1: 35,
            2: 2,
            3: 2,
            // 4: 2,
            // 5: 2,
            // 6: 2,
            // 7: 1
        };

        let totalCommissionsDistributed = 0;

        // Distribute commissions to sponsors if they exist
        if (sponsorChain.length > 0) {
            for (let i = 0; i < sponsorChain.length; i++) {
                const level = i + 1;
                const sponsor = sponsorChain[i];
                
                if (!commissionRates[level]) continue;

                // Calculate commission amount
                const commissionRate = commissionRates[level];
                const commissionAmount = Number(((amount * commissionRate) / 100).toFixed(2));

                if (commissionAmount <= 0) continue;

                // Check if total commissions exceed package price
                if (totalCommissionsDistributed + commissionAmount > amount) break;

                try {
                    // Create both commission and node statement in parallel
                    const [commissionStatement, nodeStatement] = await Promise.all([
                        tx.commission.create({
                            data: {
                                userId: sponsor.user.id,
                                amount: commissionAmount,
                                type: 'LEVEL',
                                description: `Level ${level} commission from ${node.user.username}'s package purchase`,
                                status: 'PROCESSED',
                                sourceUserId: node.user.id,
                                packageId: packageId
                            }
                        }),
                        tx.nodeStatement.create({
                            data: {
                                nodeId: sponsor.id,
                                amount: commissionAmount,
                                type: 'COMMISSION',
                                description: `Level ${level} commission from ${node.user.username}'s package purchase`,
                                status: 'PROCESSED',
                                referenceType: 'COMMISSION',
                                referenceId: packageId,
                            }
                        })
                    ]);

                    // Create notification for commission earned
                    await notificationService.create({
                        userId: sponsor.user.id,
                        title: 'Commission Earned',
                        message: `You have earned a commission of ${commissionAmount} from your network.`,
                        type: 'COMMISSION_EARNED'
                    }, tx);

                    // Notify admins of commission earned
                    await adminNotificationUtils.commissionEarned(
                        sponsor.user,
                        commissionAmount,
                        pkg.name
                    );

                    // Update sponsor's balance
                    await tx.node.update({
                        where: { id: sponsor.id },
                        data: {
                            availableBalance: {
                                increment: commissionAmount
                            }
                        }
                    });

                    totalCommissionsDistributed += commissionAmount;

                    logger.info(`Commission and NodeStatement created`, {
                        level,
                        sponsorId: sponsor.id,
                        sponsorUsername: sponsor.user.username,
                        commissionAmount,
                        nodeStatementId: nodeStatement.id,
                        commissionStatementId: commissionStatement.id
                    });

                } catch (error) {
                    logger.error(`Failed to create commission statement for sponsor`, {
                        error: error.message,
                        sponsorId: sponsor.id,
                        level
                    });
                    throw error;
                }
            }
        }

        return totalCommissionsDistributed;
    } catch (error) {
        logger.error('Error calculating commissions', {
            error: error.message,
            nodeId: nodeId,
            amount
        });
        throw error;
    }
}

/**
 * Get the sponsor chain for a user up to specified levels
 * @param {number} nodeId - The node's ID
 * @param {number} levels - Number of levels to retrieve
 * @returns {Promise<Array>} Array of sponsors
 */
async function getSponsorChain(nodeId, levels) {
    try {
        const sponsors = [];
        let currentNode = await prisma.node.findUnique({
            where: { id: nodeId },
            include: { user: true }
        });

        while (currentNode && sponsors.length < levels) {
            if (!currentNode.sponsorId) break;

            const sponsor = await prisma.node.findFirst({
                where: {
                    id: currentNode.sponsorId,
                    status: 'ACTIVE'
                },
                include: { user: true }
            });

            if (!sponsor) break;

            sponsors.push({
                ...sponsor,
                username: sponsor.user.username
            });

            currentNode = sponsor;
        }

        return sponsors;
    } catch (error) {
        logger.error('Error retrieving sponsor chain', {
            nodeId,
            levels,
            errorMessage: error.message
        });
        return [];
    }
}

module.exports = {
    calculateCommissions,
    getSponsorChain
};
