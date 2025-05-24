const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const notificationService = require('./notification.service');

class PackageRewardService {
    async calculateDailyReward(nodePackage) {
      const { package: pkg, node } = nodePackage;
      // Calculate base reward from package price and multiplier
      const baseReward = Number(pkg.price) * (Number(pkg.dailyMultiplier || 0) / 100);
      // Add a small random bonus (0 - 0.5% of package price)
      const minBonus = 0;
      const maxBonus = Number(pkg.price) * 0.005;
      const randomBonus = Math.random() * (maxBonus - minBonus) + minBonus;
      // Final daily reward (rounded to 2 decimals)
      const dailyReward = Math.floor((baseReward + randomBonus) * 100) / 100;

      // Create node statement for daily reward (fix: do not include 'node' property)
      await prisma.nodeStatement.create({
        data: {
          nodeId: node.id,
          amount: dailyReward,
          type: 'DAILY_HARVEST',
          description: `Daily harvest for ${pkg.name}`,
          status:"PROCESSED",
          referenceType: 'DAILY_HARVEST',
          referenceId: 0 // required Int, not null

        }
      });

      // Update node balance
      await prisma.node.update({
        where: { id: node.id },
        data: {
          availableBalance: {
            increment: dailyReward
          }
        }
      });

      // Send notification to user
      await notificationService.create({
        userId: node.userId,
        title: 'Daily harvest Credited',
        message: `You have received UGX ${dailyReward.toLocaleString()} as your daily harvest for the ${pkg.name} package.`,
        type: 'PACKAGE'
      });

      return dailyReward;
    }
}

module.exports = new PackageRewardService();