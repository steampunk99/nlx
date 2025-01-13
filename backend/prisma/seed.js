const { PrismaClient } = require('@prisma/client');
const clearData = require('./seeds/clear');
const seedWithdrawals = require('./seeds/withdrawals');

async function main() {
  try {
    // Clear existing data
    await clearData();
    
    // Seed withdrawals
    await seedWithdrawals();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main();
