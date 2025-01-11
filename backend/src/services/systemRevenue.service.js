const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('./logger.service');

const REVENUE_TYPES = {
    PACKAGE_PURCHASE: 'PACKAGE_PURCHASE',
    WITHDRAWAL_FEE: 'WITHDRAWAL_FEE',
    UPGRADE_FEE: 'UPGRADE_FEE',
    COMMISSION_REMAINDER: 'COMMISSION_REMAINDER'
};

const REVENUE_STATUS = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
};

class SystemRevenueService {
    // Create system revenue entry
    async create(data, tx = prisma) {
        try {
            const revenue = await tx.systemRevenue.create({
                data: {
                    amount: data.amount,
                    type: data.type,
                    description: data.description,
                    packageId: data.packageId,
                    paymentId: data.paymentId,
                    status: data.status || REVENUE_STATUS.COMPLETED
                }
            });

            logger.info('System revenue created:', {
                revenue_id: revenue.id,
                amount: data.amount,
                type: data.type,
                status: revenue.status
            });

            return revenue;
        } catch (error) {
            logger.error('Error creating system revenue:', {
                error: error.message,
                data
            });
            throw error;
        }
    }

    // Calculate package purchase revenue
    async calculatePackageRevenue(payment, pkg, tx) {
        const COMMISSION_RATES = {
            1: 0.40, // 40% for level 1
            2: 0.10, // 10% for level 2
            3: 0.05, // 5% for level 3
            4: 0.02, // 2% for level 4
            5: 0.02, // 2% for level 5
            6: 0.02, // 2% for level 6
            7: 0.01  // 1% for level 7
        };

        // Calculate total commission rate
        const totalCommissionRate = Object.values(COMMISSION_RATES).reduce((a, b) => a + b, 0);
        const systemRevenue = payment.amount * (1 - totalCommissionRate);

        await this.create({
            amount: systemRevenue,
            type: REVENUE_TYPES.PACKAGE_PURCHASE,
            description: `System revenue from ${pkg.name} package purchase`,
            packageId: pkg.id,
            paymentId: payment.id,
            status: REVENUE_STATUS.COMPLETED
        }, tx);

        logger.info('Package purchase revenue calculated:', {
            payment_id: payment.id,
            package_id: pkg.id,
            total_amount: payment.amount,
            commission_rate: totalCommissionRate,
            system_revenue: systemRevenue
        });

        return systemRevenue;
    }

    // Calculate withdrawal fee
    async calculateWithdrawalFee(amount) {
        const FEE_RATE = 0.02; // 2% withdrawal fee
        const feeAmount = amount * FEE_RATE;
        
        logger.info('Withdrawal fee calculated:', {
            withdrawal_amount: amount,
            fee_rate: FEE_RATE,
            fee_amount: feeAmount
        });

        return feeAmount;
    }

    // Calculate withdrawal fee revenue
    async calculateWithdrawalRevenue(withdrawal, tx) {
        const feeAmount = await this.calculateWithdrawalFee(withdrawal.amount);

        await this.create({
            amount: feeAmount,
            type: REVENUE_TYPES.WITHDRAWAL_FEE,
            description: `System revenue from withdrawal fee`,
            paymentId: withdrawal.id,
            status: REVENUE_STATUS.COMPLETED
        }, tx);

        logger.info('Withdrawal fee revenue calculated:', {
            withdrawal_id: withdrawal.id,
            withdrawal_amount: withdrawal.amount,
            fee_amount: feeAmount
        });

        return feeAmount;
    }

    // Get system revenue stats
    async getStats(startDate, endDate) {
        const where = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        const [stats, totalRevenue] = await Promise.all([
            prisma.systemRevenue.groupBy({
                by: ['type'],
                where,
                _sum: {
                    amount: true
                }
            }),
            prisma.systemRevenue.aggregate({
                where,
                _sum: {
                    amount: true
                }
            })
        ]);

        const revenueByType = {};
        Object.values(REVENUE_TYPES).forEach(type => {
            const typeStats = stats.find(s => s.type === type);
            revenueByType[type] = typeStats?._sum.amount || 0;
        });

        return {
            byType: revenueByType,
            total: totalRevenue._sum.amount || 0
        };
    }

    // List all revenues with pagination
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
            throw new Error('Revenue record not found');
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