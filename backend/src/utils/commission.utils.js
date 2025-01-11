const { PrismaClient } = require('@prisma/client');
const { logger } = require('../services/logger.service');

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
        const node = await prisma.node.findUnique({
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

        // Get sponsor chain without transaction
        const sponsorChain = await getSponsorChain(node.id, 10);

        const commissionRates = {
            1: 40,
            2: 10,
            3: 5,
            4: 2,
            5: 2,
            6: 2,
            7: 1
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
            nodeId,
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
