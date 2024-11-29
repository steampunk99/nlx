const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/zilla_test'
        }
    },
    log: ['error']
});

async function connectDatabase() {
    try {
        await prisma.$connect();
        // Test the connection
        await prisma.$queryRaw`SELECT 1`;
        return prisma;
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        throw error;
    }
}

async function disconnectDatabase() {
    await prisma.$disconnect();
}

async function clearDatabase() {
    try {
        // Disable foreign key checks
        await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;
        
        // Get all table names
        const tables = await prisma.$queryRaw`SHOW TABLES`;
        
        // Clear each table
        for (const table of tables) {
            const tableName = Object.values(table)[0];
            await prisma.$executeRaw`TRUNCATE TABLE ${tableName}`;
        }
        
        // Re-enable foreign key checks
        await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;
    } catch (error) {
        console.error('Error clearing database:', error);
        throw error;
    }
}

module.exports = {
    prisma,
    connectDatabase,
    disconnectDatabase,
    clearDatabase
};
