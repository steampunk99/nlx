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

        // Check if user has already received commissions for this package
        const existingCommission = await tx.commission.findFirst({
            where: {
                userId: node.user.id,
                packageId: node.package.package.id
            }
        });

        if (existingCommission) {
            logger.warn(`User has already received commissions for this package`, {
                userId: node.user.id,
                packageId: node.package.package.id
            });
            return 0;
        }

        // Get sponsor chain (up to 10 levels)
        const sponsorChain = await getSponsorChain(node.id, 10);

        if (sponsorChain.length === 0) {
            logger.warn(`User does not have any eligible sponsors`, {
                userId: node.user.id,
                packageId: node.package.package.id
            });
            return 0;
        }

        // Commission rates for each level (in percentage)
        const commissionRates = {
            1: 10, // Direct sponsor gets 10%
            2: 5,  // Level 2 sponsor gets 5%
            3: 3,  // Level 3 sponsor gets 3%
            4: 2,  // Level 4 sponsor gets 2%
            5: 1   // Level 5 sponsor gets 1%
        };

        // Track total commissions distributed
        let totalCommissionsDistributed = 0;

        // Distribute commissions to sponsors
        for (let i = 0; i < sponsorChain.length; i++) {
            const level = i + 1;
            const sponsor = sponsorChain[i];
            
            // Skip if no commission rate for this level
            if (!commissionRates[level]) {
                logger.warn(`No commission rate for level ${level}`, { 
                    sponsorId: sponsor.id,
                    sponsorUsername: sponsor.username,
                    sponsorPosition: sponsor.position,
                    level 
                });
                continue;
            }

            // Calculate commission amount
            const commissionRate = commissionRates[level];
            const commissionAmount = Number(((amount * commissionRate) / 100).toFixed(2));

            // Validate commission amount
            if (commissionAmount <= 0) {
                logger.warn(`Invalid commission amount calculated`, { 
                    commissionAmount,
                    packagePrice: amount,
                    commissionRate,
                    sponsorId: sponsor.id,
                    sponsorUsername: sponsor.username,
                    sponsorPosition: sponsor.position,
                    level
                });
                continue;
            }

            // Check if total commissions exceed package price
            if (totalCommissionsDistributed + commissionAmount > amount) {
                logger.warn(`Total commissions exceed package price`, {
                    totalCommissionsDistributed,
                    commissionAmount,
                    packagePrice: amount,
                    sponsorId: sponsor.id,
                    sponsorUsername: sponsor.username,
                    sponsorPosition: sponsor.position,
                    level
                });
                break;
            }

            try {
                // Create node statement
                const nodeStatement = await tx.nodeStatement.create({
                    data: {
                        nodeId: sponsor.id,
                        amount: commissionAmount,
                        type: 'COMMISSION',
                        description: `Level ${level} commission from ${node.user.username}'s package purchase`,
                        status: 'PENDING',
                        referenceType: 'PACKAGE',
                        referenceId: node.package.package.id
                    }
                });

                // Create commission statement
                const commissionStatement = await tx.commission.create({
                    data: {
                        userId: sponsor.id,
                        amount: commissionAmount,
                        type: 'LEVEL',
                        description: `Level ${level} commission from ${node.user.username}'s package purchase`,
                        status: 'PENDING',
                        sourceUserId: node.user.id,
                        packageId: node.package.package.id
                    }
                });
                

                // Update sponsor's pending balance
                await tx.node.update({
                    where: { id: sponsor.id },
                    data: {
                        pendingBalance: {
                            increment: commissionAmount
                        },
                        availableBalance: {
                            increment: commissionAmount
                        }
                    }
                });

                // Track total commissions
                totalCommissionsDistributed += commissionAmount;

                // Update referred 's available balance
                let balance = amount - totalCommissionsDistributed;
                await tx.node.update({
                   
                    where: { id: node.id },
                    data: {
                        availableBalance: {
                            increment: balance
                        }
                    }
                });

                

                logger.info(`Commission distributed`, {
                    level,
                    sponsorId: sponsor.id,
                    sponsorUsername: sponsor.username,
                    sponsorPosition: sponsor.position,
                    commissionAmount,
                    nodeStatementId: nodeStatement.id,
                    commissionStatementId: commissionStatement.id
                });

            } catch (error) {
                logger.error(`Failed to create commission statement for sponsor`, {
                    sponsorId: sponsor.id,
                    sponsorUsername: sponsor.username,
                    sponsorPosition: sponsor.position,
                    level,
                    error: error.message
                });
                throw error; // Rethrow the error to trigger transaction rollback
            }
        }

        logger.info(`Commission calculation completed`, {
            nodeId,
            amount,
            totalCommissionsDistributed
        });

        return totalCommissionsDistributed;

    } catch (error) {
        logger.error('Commission calculation error', {
            nodeId,
            amount,
            errorMessage: error.message,
            errorStack: error.stack
        });
        throw error; // Rethrow the error to trigger transaction rollback
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
