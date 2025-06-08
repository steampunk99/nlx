const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const notificationService = require('./notification.service');
const { addHours, parse, addMinutes, isAfter, isBefore, format } = require('date-fns');
// East Africa Time (UTC+3): just add 3 hours to UTC


class PrizeService {
  // Get all prize configs
  async getAllPrizeConfigs() {
    return prisma.prizeConfig.findMany({ orderBy: { createdAt: 'desc' } });
  }
  // CRUD for PrizeConfig
  async createPrizeConfig(data) {
    return prisma.prizeConfig.create({ data });
  }
  async updatePrizeConfig(id, data) {
    return prisma.prizeConfig.update({ where: { id }, data });
  }
  async getPrizeConfig() {
    return prisma.prizeConfig.findFirst({ where: { isActive: true } });
  }
  async deletePrizeConfig(id) {
    return prisma.prizeConfig.delete({ where: { id } });
  }

  // Prize claim logic (simple version)
  async claimPrize({ userId }) {
    // 1. Find the user's node/account
    const node = await prisma.node.findFirst({ where: { userId } });
    if (!node) throw new Error('User node not found');

    // 2. Find the active prize
    const prize = await this.getPrizeConfig();
    if (!prize) throw new Error('No active prize available');

    // 3. Use a unique window id (prize id, or prize id + date if you want daily prizes)
    const referenceId = prize.id;

    // 4. Check if user already claimed this prize
    const alreadyClaimed = await prisma.nodeStatement.findFirst({
      where: {
        nodeId: node.id,
        type: 'PRIZE_AWARD',
        referenceType: 'PRIZE',
        referenceId:referenceId
      },
    });
    if (alreadyClaimed) throw new Error('You have already claimed this prize');

    // 5. Check if max winners reached
    const claimsCount = await prisma.nodeStatement.count({
      where: {
        type: 'PRIZE_AWARD',
        referenceType: 'PRIZE',
        referenceId: referenceId,
      },
    });
    if (claimsCount >= prize.maxWinners) throw new Error('Prize has already been fully claimed');

    // 6. Calculate prize share
    const amountPerUser = Math.floor(Number(prize.amount) / prize.maxWinners);

    // 7. Award prize: increment balance and log claim
    await prisma.$transaction([
      prisma.node.update({
        where: { id: node.id },
        data: { availableBalance: { increment: amountPerUser } },
      }),
      prisma.nodeStatement.create({
        data: {
          nodeId: node.id,
          amount: amountPerUser,
          type: 'PRIZE_AWARD',
          description: prize.title,
          referenceType: 'PRIZE',
          referenceId: referenceId,
          status: 'SUCCESSFUL',
        },
      }),
    ]);

    // Send notification to user about prize claim
    await notificationService.create({
      userId: node.userId,
      title: 'Prize Claimed',
      message: `You have received UGX ${amountPerUser.toLocaleString()} from the prize: ${prize.title}`,
      type: 'PRIZE'
    });

    // Auto-close prize window if max winners reached
    const totalClaims = await prisma.nodeStatement.count({
      where: {
        type: 'PRIZE_AWARD',
        referenceType: 'PRIZE',
        referenceId: referenceId,
      },
    });
    if (totalClaims >= prize.maxWinners) {
      await prisma.prizeConfig.update({
        where: { id: prize.id },
        data: { isActive: false },
      });
    }

    return { amount: amountPerUser, referenceId };
  }

  // Admin: get all claim logs for a prize window
  async getPrizeClaims(prizeWindowId) {
    return prisma.nodeStatement.findMany({
      where: {
        type: 'PRIZE_AWARD',
        referenceType: 'PRIZE',
        referenceId: Number(prizeWindowId), // Ensure this is an integer
      },
      include: {
        node: { include: { user: true } },
      },
    });
  }
}

module.exports = new PrizeService();
