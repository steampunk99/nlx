const packageRewardService = require('../services/packageReward.service');
const { PrismaClient } = require('@prisma/client');


const prisma = new PrismaClient();

async function processDailyPackageRewards() {
  // Find all active packages
  const activeNodePackages = await prisma.nodePackage.findMany({
    where: {
      status: 'ACTIVE',
      expiresAt: { gt: new Date() }
    },
    include: {
      package: true,
      node: true
    }
  });

  for (const nodePackage of activeNodePackages) {
    try {
      await packageRewardService.calculateDailyReward(nodePackage);
    } catch (error) {
      console.error(`Failed to process daily reward for node ${nodePackage.nodeId}:`, error);
    }
  }
}

module.exports = { processDailyPackageRewards };

if (require.main === module) {
  processDailyPackageRewards()
    .then(() => {
      console.log('Daily package rewards processed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error processing daily package rewards:', err);
      process.exit(1);
    });
}