const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedWithdrawals() {
  try {
    // Get some users to assign withdrawals to
    const users = await prisma.user.findMany({
      take: 5,
      where: {
        role: 'USER'
      }
    });

    if (users.length === 0) {
      console.log('No users found to seed withdrawals');
      return;
    }

    const withdrawals = [
      // Pending withdrawals
      {
        userId: users[0].id,
        amount: 250000,
        method: 'MOBILE_MONEY',
        details: { phone: '+256700000001' },
        transactionId: 'W1001',
        status: 'PENDING',
        createdAt: new Date('2025-01-12T10:00:00Z')
      },
      {
        userId: users[1].id,
        amount: 500000,
        method: 'MOBILE_MONEY',
        details: { phone: '+256700000002' },
        transactionId: 'W1002',
        status: 'PENDING',
        createdAt: new Date('2025-01-12T11:30:00Z')
      },
      {
        userId: users[2].id,
        amount: 750000,
        method: 'MOBILE_MONEY',
        details: { phone: '+256700000003' },
        transactionId: 'W1003',
        status: 'PENDING',
        createdAt: new Date('2025-01-13T09:15:00Z')
      },

      // Successful withdrawals
      {
        userId: users[0].id,
        amount: 300000,
        method: 'MOBILE_MONEY',
        details: { phone: '+256700000001' },
        transactionId: 'W1004',
        status: 'SUCCESSFUL',
        processedAt: new Date('2025-01-10T14:00:00Z'),
        completedAt: new Date('2025-01-10T14:30:00Z'),
        createdAt: new Date('2025-01-10T13:00:00Z')
      },
      {
        userId: users[1].id,
        amount: 450000,
        method: 'MOBILE_MONEY',
        details: { phone: '+256700000002' },
        transactionId: 'W1005',
        status: 'SUCCESSFUL',
        processedAt: new Date('2025-01-11T16:30:00Z'),
        completedAt: new Date('2025-01-11T17:00:00Z'),
        createdAt: new Date('2025-01-11T15:00:00Z')
      },
      {
        userId: users[3].id,
        amount: 600000,
        method: 'MOBILE_MONEY',
        details: { phone: '+256700000004' },
        transactionId: 'W1006',
        status: 'SUCCESSFUL',
        processedAt: new Date('2025-01-12T12:45:00Z'),
        completedAt: new Date('2025-01-12T13:15:00Z'),
        createdAt: new Date('2025-01-12T11:30:00Z')
      },

      // Failed withdrawals
      {
        userId: users[2].id,
        amount: 1000000,
        method: 'MOBILE_MONEY',
        details: { 
          phone: '+256700000003',
          error: 'Insufficient balance'
        },
        transactionId: 'W1007',
        status: 'FAILED',
        processedAt: new Date('2025-01-11T10:15:00Z'),
        createdAt: new Date('2025-01-11T10:00:00Z')
      },
      {
        userId: users[4].id,
        amount: 800000,
        method: 'MOBILE_MONEY',
        details: { 
          phone: '+256700000005',
          error: 'Invalid phone number'
        },
        transactionId: 'W1008',
        status: 'FAILED',
        processedAt: new Date('2025-01-12T09:30:00Z'),
        createdAt: new Date('2025-01-12T09:00:00Z')
      },

      // Processing withdrawals
      {
        userId: users[3].id,
        amount: 350000,
        method: 'MOBILE_MONEY',
        details: { phone: '+256700000004' },
        transactionId: 'W1009',
        status: 'PROCESSING',
        processedAt: new Date('2025-01-13T08:00:00Z'),
        createdAt: new Date('2025-01-13T08:00:00Z')
      },
      {
        userId: users[4].id,
        amount: 420000,
        method: 'MOBILE_MONEY',
        details: { phone: '+256700000005' },
        transactionId: 'W1010',
        status: 'PROCESSING',
        processedAt: new Date('2025-01-13T08:30:00Z'),
        createdAt: new Date('2025-01-13T08:30:00Z')
      }
    ];

    // Create withdrawals
    for (const withdrawal of withdrawals) {
      await prisma.withdrawal.create({
        data: withdrawal
      });
    }

    console.log(`✅ Successfully seeded ${withdrawals.length} withdrawals`);
  } catch (error) {
    console.error('Error seeding withdrawals:', error);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = seedWithdrawals;
