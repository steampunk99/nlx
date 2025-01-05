const { PrismaClient } = require('@prisma/client');
const { calculateCommissions } = require('../src/utils/commission.utils');

const prisma = new PrismaClient();

async function seedPackagePurchase() {
  try {
    const referredUserId = 2;
  
    const packageId =3;
    const nodeId = 2;

    // Start a transaction
    await prisma.$transaction(async (tx) => {
      // Create a NodePayment record
      //get package price
      const packagePrice = await tx.package.findUnique({
        where: { id: packageId }
      });

      const payment = await tx.nodePayment.create({
        data: {
          nodeId,
          packageId,
          amount: "250000",
          transactionId:"TRX6434U9843U8FCN3",
          transactionDetails:"TRX6434U9843U8FCN3",
          status: 'SUCCESSFUL',
          paymentMethod: 'mobile-money',
          type: 'SUBSCRIPTION',
          phoneNumber: '0700000000',
          createdAt: new Date(),
          updatedAt: new Date()
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
      await calculateCommissions(nodeId, packagePrice.price, tx);
    });

    console.log('Package purchase seeded and commissions distributed successfully');
  } catch (error) {
    console.error('Error seeding package purchase and distributing commissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPackagePurchase();