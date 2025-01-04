const { PrismaClient } = require('@prisma/client');
const { logger } = require('../services/logger.service');

const prisma = new PrismaClient();

/**
 * Calculate and distribute commissions for a package purchase
 * @param {Object} user - The user who purchased the package
 * @param {Object} pkg - The package that was purchased
 * @param {Object} tx - Prisma transaction
 */


async function calculateCommissions(nodeId, amount, tx = prisma) {
    try {
        // Get node details first without transaction
        const node = await prisma.node.findUnique({
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

        if (!node?.id || !amount) {
            throw new Error('Invalid input parameters for commission calculation');
        }

        logger.info('Starting commission calculation', {
            username: node.user.username,
            // packageName: node.package.package.name
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
        const commissions = [];

        // Prepare commission data without creating records
        for (let i = 0; i < sponsorChain.length; i++) {
            const level = i + 1;
            const sponsor = sponsorChain[i];
            
            if (!commissionRates[level]) continue;

            const commissionRate = commissionRates[level];
            const commissionAmount = Number(((amount * commissionRate) / 100).toFixed(2));

            if (commissionAmount <= 0) continue;
            if (totalCommissionsDistributed + commissionAmount > amount) break;

            commissions.push({
                sponsorId: sponsor.id,
                amount: commissionAmount,
                level,
                type: level === 1 ? "DIRECT" : "LEVEL",
                description: `Level ${level} commission from ${node.user.username}'s package purchase`
            });

            totalCommissionsDistributed += commissionAmount;
        }

        // Return commission data for creation in the transaction
        return commissions;

    } catch (error) {
        logger.error('Commission calculation error', {
            nodeId,
            amount,
            error: error.message
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
