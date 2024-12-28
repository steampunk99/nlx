// backend/src/services/packageReward.service.js
class PackageRewardService {
    async calculateDailyReward(nodePackage) {
      const { package: pkg, node } = nodePackage;
      
      // Base network volume (could be total network transactions, node earnings, etc.)
      const baseNetworkVolume = await this.calculateNetworkVolume(node);
      
      // Daily reward calculation
      const dailyReward = baseNetworkVolume * (pkg.dailyMultiplier || 0);
      
      // Create node statement
      await prisma.nodeStatement.create({
        data: {
          nodeId: node.id,
          amount: dailyReward,
          type: 'DAILY_PACKAGE_REWARD',
          description: `Daily reward for ${pkg.name} package`
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
  
      return dailyReward;
    }
  
    async calculateNetworkVolume(node) {
      // Placeholder for network volume calculation
      // Could be based on:
      // - Total network transactions
      // - Node's referral earnings
      // - Previous day's network activity
      const statements = await prisma.nodeStatement.findMany({
        where: {
          nodeId: node.id,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });
  
      // Simple sum of statement amounts as a basic network volume
      return statements.reduce((sum, statement) => sum + parseFloat(statement.amount), 0);
    }
  }
  
  module.exports = new PackageRewardService();