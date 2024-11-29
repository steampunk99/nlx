const { prisma } = require('../../config/prisma');

// Define deletion order to handle foreign key constraints
const deletionOrder = [
  'Commission',
  'Withdrawal',
  'UserPackage',
  'Package',
  'Node',
  'Notification',
  'Announcement',
  'User'
];

// Clear all data from the test database
async function clearDatabase() {
  try {
    // Delete tables in order
    for (const table of deletionOrder) {
      await prisma[table.toLowerCase()].deleteMany();
    }
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

module.exports = {
  prisma,
  clearDatabase
};
