const { PrismaClient } = require('@prisma/client');
const { logger } = require('../services/logger.service');

const prisma = new PrismaClient();

/**
 * Calculate and distribute commissions for a package purchase
 * @param {Object} user - The user who purchased the package
 * @param {Object} pkg - The package that was purchased
 * @param {Object} tx - Prisma transaction
 */
async function calculateCommissions(user, pkg, tx) {
    try {
        // Validate input parameters
        if (!user || !pkg || !tx) {
            throw new Error('Invalid input parameters for commission calculation');
        }

        // Log commission calculation start
        logger.info(`Starting commission calculation for user ${user.username}, package ${pkg.name}`, {
            userId: user.id,
            packageId: pkg.id,
            packagePrice: pkg.price
        });

        // Get sponsor chain (up to 10 levels)
        const sponsorChain = await getSponsorChain(user.node.id, 10);
        
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
                    level 
                });
                continue;
            }

            // Calculate commission amount
            const commissionRate = commissionRates[level];
            const commissionAmount = Number(((pkg.price * commissionRate) / 100).toFixed(2));

            // Validate commission amount
            if (commissionAmount <= 0) {
                logger.warn(`Invalid commission amount calculated`, { 
                    commissionAmount, 
                    packagePrice: pkg.price, 
                    commissionRate 
                });
                continue;
            }

            try {
                // Create commission statement
                const commissionStatement = await tx.nodeStatement.create({
                    data: {
                        nodeId: sponsor.id,
                        nodeUsername: sponsor.username,
                        nodePosition: sponsor.position,
                        amount: commissionAmount,
                        description: `Level ${level} commission from ${user.username}'s package purchase`,
                        type: 'COMMISSION',
                        status: 'PENDING',
                        isDebit: false,
                        isCredit: true,
                        isEffective: true,
                        eventDate: new Date(),
                        eventTimestamp: new Date(),
                        referenceId: pkg.id
                    }
                });

                // Update sponsor's balance
                await tx.node.update({
                    where: { id: sponsor.id },
                    data: {
                        pendingBalance: {
                            increment: commissionAmount
                        }
                    }
                });

                // Track total commissions
                totalCommissionsDistributed += commissionAmount;

                logger.info(`Commission distributed`, {
                    level,
                    sponsorId: sponsor.id,
                    commissionAmount,
                    statementId: commissionStatement.id
                });

            } catch (statementError) {
                logger.error(`Failed to create commission statement for sponsor`, {
                    sponsorId: sponsor.id,
                    level,
                    error: statementError.message
                });
                // Continue processing other sponsors even if one fails
            }
        }

        logger.info(`Commission calculation completed`, {
            userId: user.id,
            packageId: pkg.id,
            totalCommissionsDistributed
        });

        return totalCommissionsDistributed;

    } catch (error) {
        logger.error('Commission calculation error', {
            userId: user.id,
            packageId: pkg.id,
            errorMessage: error.message,
            errorStack: error.stack
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
