const { PrismaClient } = require('@prisma/client');
const { logger } = require('../services/logger.service');

const prisma = new PrismaClient();

/**
 * Calculate and distribute commissions for a package purchase
 * @param {Object} user - The user who purchased the package
 * @param {Object} pkg - The package that was purchased
 * @param {Object} tx - Prisma transaction
 */

async function calculateCommissions(nodeId, amount, tx) {
    try {
        const node = await tx.node.findUnique({
            where: { id: nodeId },
            include: {
                user: true,
                package: {
                    include: {
                        package: true
                    }
                }
            }
        });

        // Validate input parameters
        if (!node?.id || !amount || !tx) {
            throw new Error('Invalid input parameters for commission calculation');
        }

        // Log commission calculation start
        logger.info(`Starting commission calculation for user ${node.user.username}, package ${node.package.package.name}`, {
            userId: node.user.id,
            packageId: node.package.package.id,
            packagePrice: node.package.package.price
        });

        // Get sponsor chain (up to 10 levels)
        const sponsorChain = await getSponsorChain(node.id, 10);

        // Commission rates for each level (in percentage)
        const commissionRates = {
            1: 40, // Direct sponsor gets 40%
            2: 10,  // Level 2 sponsor gets 10%
            3: 5,  // Level 3 sponsor gets 5%
            4: 2,  // Level 4 sponsor gets 2%
            5: 2,   // Level 5 sponsor gets 2%
            6: 2,   // Level 6 sponsor gets 2%
            7: 1   // Level 7 sponsor gets 1%
        };

        // Track total commissions distributed
        let totalCommissionsDistributed = 0;

        // Create package purchase statement for the buyer
        await tx.nodeStatement.create({
            data: {
                nodeId: node.id,
                amount: -amount, // Negative amount for purchase
                type: 'PACKAGE_PURCHASE',
                status: 'COMPLETED',
                description: `Package purchase: ${node.package.package.name}`,
                referenceType: 'PACKAGE',
                referenceId: node.package.package.id,
                balanceAfter: 0 // Package purchase doesn't affect available balance
            }
        });

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
                        tx.commission.createMany({
                            data: {
                                userId: sponsor.id,
                                amount: commissionAmount,
                                type: level === 1 ? "DIRECT" : "LEVEL",
                                level: `Level ${level}`,
                                description: `Level ${level} commission from ${node.user.username}'s package purchase`,
                                status: 'PROCESSED',
                                sourceUserId: node.user.id,
                                packageId: node.package.package.id
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
                                referenceId: node.package.package.id,
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
                        sponsorUsername: sponsor.username,
                        commissionAmount,
                        nodeStatementId: nodeStatement.id,
                        commissionStatementId: commissionStatement.id
                    });

                } catch (error) {
                    logger.error(`Failed to create commission statement for sponsor`, {
                        error: error.message
                    });
                    throw error;
                }
            }
        }

        // Calculate remaining revenue for admin tracking
        const remainingRevenue = amount - totalCommissionsDistributed;
        logger.info(`Remaining revenue after commissions: ${remainingRevenue}`, {
            packagePrice: amount,
            totalCommissionsDistributed
        });

        // Create system revenue record for the remaining amount
        await tx.systemRevenue.create({
            data: {
                amount: remainingRevenue,
                type: 'COMMISSION_REMAINDER',
                description: `Remaining revenue from ${node.user.username}'s package purchase after commission distribution`,
                status: 'PROCESSED',
                packageId: node.package.package.id,
                paymentId: node.package.id
            }
        });

        logger.info(`Commission calculation completed`, {
            nodeId,
            amount,
            totalCommissionsDistributed,
            remainingRevenue
        });

        return totalCommissionsDistributed;

    } catch (error) {
        logger.error('Commission calculation error', {
            nodeId,
            amount,
            errorMessage: error.message
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
