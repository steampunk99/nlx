const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/zilla_test'
        }
    },
    log: ['error']
});

module.exports = { prisma };
