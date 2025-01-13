const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearData() {
  try {
    // Clear withdrawals
    await prisma.withdrawal.deleteMany();
    console.log('✅ Successfully cleared withdrawals');
  } catch (error) {
    console.error('Error clearing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = clearData;
