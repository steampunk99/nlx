const { PrismaClient } = require('@prisma/client');
const { calculateCommissions } = require('./src/utils/commission.utils');

const prisma = new PrismaClient();

async function seedPackagePurchase() {
  try {
    const referredUserId = 5;
  
    const packageId = 4;
    const nodeId = 5;

    // Start a transaction
    await prisma.$transaction(async (tx) => {
      // Create a NodePayment record
      const payment = await tx.nodePayment.create({
        data: {
          nodeId,
          packageId,
          amount: 500000,
          status: 'COMPLETED',
          paymentMethod: 'TEST',
          type: 'SUBSCRIPTION',
        },
      });

      // Create a NodePackage record
      const nodePackage = await tx.nodePackage.create({
        data: {
          nodeId,
          packageId,
          status: 'ACTIVE',
        },
      });

      // Update User A's status to 'ACTIVE'
      await tx.user.update({
        where: { id: referredUserId },
        data: { status: 'ACTIVE' },
      });

      // Update User A's node status to 'ACTIVE'
      await tx.node.update({
        where: { id: nodeId },
        data: { status: 'ACTIVE' },
      });

    

      // Calculate and distribute commissions
      await calculateCommissions(nodeId, 500000, tx);
    });

    console.log('Package purchase seeded and commissions distributed successfully');
  } catch (error) {
    console.error('Error seeding package purchase and distributing commissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPackagePurchase();