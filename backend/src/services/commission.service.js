const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CommissionService {
    async findAll({ page = 1, limit = 10, userId, type, status, startDate, endDate }) {
        const skip = (page - 1) * limit;
        // indexes to improve query performance
        const where = {
            AND: [
                userId && { userId },
                type && { type },
                status && { status },
                (startDate || endDate) && {
                    createdAt: {
                        ...(startDate && { gte: new Date(startDate) }),
                        ...(endDate && { lte: new Date(endDate) })
                    }
                }
            ].filter(Boolean)
        };

        if (userId) where.userId = userId;
        if (type) where.type = type;
        if (status) where.status = status;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        const [commissions, total] = await Promise.all([
            prisma.commission.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            firstName: true,
                            lastName: true
                        }
                    },
                    sourceUser: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            firstName: true,
                            lastName: true
                        }
                    },
                    package: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            level: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.commission.count({ where })
        ]);

        return {
            commissions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async findById(id) {
        const commission = await prisma.commission.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                },
                sourceUser: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                },
                package: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        level: true
                    }
                }
            }
        });

        if (!commission) {
            throw new Error('Commission not found');
        }

        return commission;
    }

    //find pending commissions
    async findPendingByPayment(paymentId) {
        return prisma.commission.findMany({
            where: {
                paymentId,
                status: 'PENDING'
            },
            include: {
                user: true,
                sourceUser: true
            }
        });
    }

    async create(commissionData) {
        return await prisma.$transaction(async (tx) => {
            // Create commission
            const commission = await tx.commission.create({
                data: {
                    userId: commissionData.userId,
                    amount: commissionData.amount,
                    type: commissionData.type,
                    description: commissionData.description,
                    status: commissionData.status || 'PENDING',
                    sourceUserId: commissionData.sourceUserId,
                    packageId: commissionData.packageId
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true
                        }
                    },
                    sourceUser: {
                        select: {
                            id: true,
                            username: true,
                            email: true
                        }
                    },
                    package: {
                        select: {
                            id: true,
                            name: true,
                            price: true
                        }
                    }
                }
            });

            // Create notification for user
            await tx.notification.create({
                data: {
                    userId: commissionData.userId,
                    title: 'New Commission',
                    message: `You have received a new ${commissionData.type} commission of ${commissionData.amount}`,
                    type: 'COMMISSION'
                }
            });

            // Update user's total earnings if commission is approved
            if (commission.status === 'PROCESSED') {
                await tx.user.update({
                    where: { id: commissionData.userId },
                    data: {
                        totalEarnings: {
                            increment: parseFloat(commissionData.amount)
                        }
                    }
                });
            }

            return commission;
        });
    }

    async update(id, commissionData) {
        const commission = await this.findById(id);
        
        return await prisma.$transaction(async (tx) => {
            const updated = await tx.commission.update({
                where: { id },
                data: {
                    amount: commissionData.amount || commission.amount,
                    type: commissionData.type || commission.type,
                    description: commissionData.description || commission.description,
                    status: commissionData.status || commission.status,
                    processedAt: commissionData.status === 'PROCESSED' ? new Date() : commission.processedAt
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true
                        }
                    },
                    sourceUser: {
                        select: {
                            id: true,
                            username: true,
                            email: true
                        }
                    },
                    package: {
                        select: {
                            id: true,
                            name: true,
                            price: true
                        }
                    }
                }
            });

            // If status changed to PROCESSED, update user's total earnings
            if (commissionData.status === 'PROCESSED' && commission.status !== 'PROCESSED') {
                await tx.user.update({
                    where: { id: commission.userId },
                    data: {
                        totalEarnings: {
                            increment: parseFloat(commission.amount)
                        }
                    }
                });

                // Create notification
                await tx.notification.create({
                    data: {
                        userId: commission.userId,
                        title: 'Commission Processed',
                        message: `Your ${commission.type} commission of ${commission.amount} has been processed`,
                        type: 'COMMISSION_PROCESSED'
                    }
                });
            }

            return updated;
        });
    }

    async delete(id) {
        await this.findById(id); // Verify existence
        return prisma.commission.delete({ where: { id } });
    }

    async getUserCommissionStats(userId) {
        // Validate user
        const user = await prisma.user.findUnique({ 
            where: { id: userId },
            include: { node: true }
        });
        if (!user) throw new Error('User not found');

        // Aggregate commission statistics
        const [
            totalCommissions,
            directCommissions,
            matchingCommissions,
            levelCommissions,
            pendingCommissions,
            processedCommissions
        ] = await Promise.all([
            prisma.commission.aggregate({
                where: { userId },
                _sum: { amount: true }
            }),
            prisma.commission.aggregate({
                where: { 
                    userId, 
                    type: 'DIRECT' 
                },
                _sum: { amount: true }
            }),
            prisma.commission.aggregate({
                where: { 
                    userId, 
                    type: 'MATCHING' 
                },
                _sum: { amount: true }
            }),
            prisma.commission.aggregate({
                where: { 
                    userId, 
                    type: 'LEVEL' 
                },
                _sum: { amount: true }
            }),
            prisma.commission.aggregate({
                where: { 
                    userId, 
                    status: 'PENDING' 
                },
                _sum: { amount: true }
            }),
            prisma.commission.aggregate({
                where: { 
                    userId, 
                    status: 'PROCESSED' 
                },
                _sum: { amount: true }
            })
        ]);

        return {
            totalCommissions: totalCommissions._sum.amount || 0,
            directCommissions: directCommissions._sum.amount || 0,
            matchingCommissions: matchingCommissions._sum.amount || 0,
            levelCommissions: levelCommissions._sum.amount || 0,
            pendingCommissions: pendingCommissions._sum.amount || 0,
            processedCommissions: processedCommissions._sum.amount || 0,
            availableBalance: pendingCommissions._sum.amount || 0
        };
    }

    async getUserCommissions({ 
        userId, 
        page = 1, 
        limit = 10, 
        type = null, 
        status = null 
    }) {
        const where = { userId };
        
        // Add type filter if not 'All'
        if (type && type !== 'All') {
            where.type = type;
        }
        
        // Add status filter if not 'All'
        if (status && status !== 'All') {
            where.status = status;
        }

        const [commissions, total] = await Promise.all([
            prisma.commission.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true
                        }
                    },
                    sourceUser: {
                        select: {
                            id: true,
                            username: true
                        }
                    },
                    package: {
                        select: {
                            id: true,
                            name: true,
                            price: true
                        }
                    }
                }
            }),
            prisma.commission.count({ where })
        ]);

        return {
            commissions,
            total,
            pages: Math.ceil(total / limit)
        };
    }

    async withdrawCommissions(userId, amount) {
        return await prisma.$transaction(async (tx) => {
            // Get user's processed commissions
            const userStats = await this.getUserCommissionStats(userId);
            
            if (amount > userStats.availableBalance) {
                throw new Error('Insufficient commission balance');
            }

            // Create withdrawal record
            const withdrawal = await tx.withdrawal.create({
                data: {
                    userId,
                    amount,
                    status: 'PENDING',
                    type: 'COMMISSION'
                }
            });

            // Update commission status to WITHDRAWN
            await tx.commission.updateMany({
                where: { 
                    userId, 
                    status: 'PROCESSED' 
                },
                data: { 
                    status: 'WITHDRAWN' 
                }
            });

            // Create notification
            await tx.notification.create({
                data: {
                    userId,
                    title: 'Commission Withdrawal',
                    message: `Withdrawal of $${amount} initiated`,
                    type: 'WITHDRAWAL'
                }
            });

            return withdrawal;
        });
    }

    async calculateDirectCommission(packagePrice, level) {
        // Example commission calculation logic
        const commissionRates = {
            1: 0.10, // 10% for level 1
            2: 0.05, // 5% for level 2
            3: 0.03  // 3% for level 3
        };

        const rate = commissionRates[level] || 0;
        return packagePrice * rate;
    }

    async calculateMatchingBonus(teamVolume, userLevel) {
        // Example matching bonus calculation
        const bonusRates = {
            1: 0.05, // 5% for level 1
            2: 0.07, // 7% for level 2
            3: 0.10  // 10% for level 3
        };

        const rate = bonusRates[userLevel] || 0;
        return teamVolume * rate;
    }

    async processCommissionQueue() {
        const pendingCommissions = await prisma.commission.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'asc' },
            take: 100 // Process in batches
        });

        for (const commission of pendingCommissions) {
            try {
                await this.update(commission.id, { status: 'PROCESSED' });
            } catch (error) {
                console.error(`Failed to process commission ${commission.id}:`, error);
                // Could implement retry logic here
            }
        }

        return pendingCommissions.length;
    }
}

module.exports = new CommissionService();
