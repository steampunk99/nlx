const { prisma, clearDatabase, disconnectDatabase } = require('../config/database.test');
const jwt = require('jsonwebtoken');
const { generateUser, generateNode, generateCommission, generateWithdrawal } = require('./helpers/generators');

beforeAll(async () => {
    try {
        await prisma.$connect();
    } catch (error) {
        console.error('Failed to connect to test database:', error);
        throw error;
    }
});

beforeEach(async () => {
    try {
        // Disable foreign key checks
        await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;
        
        // Clear all tables
        const tables = await prisma.$queryRaw`SHOW TABLES`;
        for (const table of tables) {
            const tableName = Object.values(table)[0];
            await prisma.$executeRaw`TRUNCATE TABLE \`${tableName}\``;
        }
        
        // Re-enable foreign key checks
        await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;
    } catch (error) {
        console.error('Failed to clear test database:', error);
        throw error;
    }
});

afterAll(async () => {
 
    console.log('Cleaned up test database and disconnected');
});

function generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

global.prisma = prisma;
global.generateToken = generateToken;
global.generateUser = generateUser;
global.generateNode = generateNode;
global.generateCommission = generateCommission;
global.generateWithdrawal = generateWithdrawal;
