const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SystemRevenueService {
    async findAll({ page = 1, limit = 10, type, status, startDate, endDate }) {
        const skip = (page - 1) * limit;
        const where = {};

        if (type) where.type = type;
        if (status) where.status = status;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        const [revenues, total] = await Promise.all([
            prisma.systemRevenue.findMany({
                where,
                include: {
                    package: {
                        select: {
                            id: true,
                            name: true,
                            price: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.systemRevenue.count({ where })
        ]);

        return {
            revenues,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async getStats(startDate, endDate) {
        const where = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        const stats = await prisma.systemRevenue.aggregate({
            where,
            _sum: { amount: true },
            _count: true,
            _avg: { amount: true }
        });

        const byType = await prisma.systemRevenue.groupBy({
            by: ['type'],
            where,
            _sum: { amount: true },
            _count: true
        });

        return {
            totalAmount: stats._sum.amount || 0,
            totalCount: stats._count || 0,
            averageAmount: stats._avg.amount || 0,
            byType: byType.map(type => ({
                type: type.type,
                amount: type._sum.amount || 0,
                count: type._count || 0
            }))
        };
    }

    async create(revenueData, tx = prisma) {
        return tx.systemRevenue.create({
            data: revenueData,
            include: {
                package: {
                    select: {
                        id: true,
                        name: true,
                        price: true
                    }
                }
            }
        });
    }

    async findById(id) {
        const revenue = await prisma.systemRevenue.findUnique({
            where: { id },
            include: {
                package: {
                    select: {
                        id: true,
                        name: true,
                        price: true
                    }
                }
            }
        });

        if (!revenue) {
            throw new Error('System revenue record not found');
        }

        return revenue;
    }

    async update(id, revenueData) {
        return prisma.systemRevenue.update({
            where: { id },
            data: revenueData,
            include: {
                package: {
                    select: {
                        id: true,
                        name: true,
                        price: true
                    }
                }
            }
        });
    }

    async delete(id) {
        return prisma.systemRevenue.delete({
            where: { id }
        });
    }
}

module.exports = new SystemRevenueService(); 