const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class NodeStatementService {
    async create(statementData, tx = prisma) {
        return tx.nodeStatement.create({
            data: {
                ...statementData,
                createdAt: new Date(),
                balanceAfter: await this.calculateBalanceAfter(statementData.nodeId, statementData.amount, statementData.type)
            },
            include: {
                node: {
                    include: {
                        user: true
                    }
                }
            }
        });
    }

    async findAll(nodeId, { startDate, endDate, type, page = 1, limit = 10, status } = {}) {
        const where = { nodeId };
        const skip = (page - 1) * limit;

        if (startDate && endDate) {
            where.createdAt = {
                gte: startDate,
                lte: endDate
            };
        }

        if (type) {
            where.type = type.toUpperCase();
        }

        if (status) {
            where.status = status.toUpperCase();
        }

        const [total, statements] = await Promise.all([
            prisma.nodeStatement.count({ where }),
            prisma.nodeStatement.findMany({
                where,
                include: {
                    node: {
                        include: {
                            user: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            })
        ]);

        return {
            statements,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getBalance(nodeId) {
        const credits = await prisma.nodeStatement.aggregate({
            where: {
                nodeId,
                type: 'CREDIT',
                status: 'COMPLETED'
            },
            _sum: {
                amount: true
            }
        });

        const debits = await prisma.nodeStatement.aggregate({
            where: {
                nodeId,
                type: 'DEBIT',
                status: 'COMPLETED'
            },
            _sum: {
                amount: true
            }
        });

        const totalCredits = credits._sum.amount || 0;
        const totalDebits = debits._sum.amount || 0;
        const currentBalance = totalCredits - totalDebits;

        // Get daily balance history for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const balanceHistory = await prisma.nodeStatement.findMany({
            where: {
                nodeId,
                createdAt: {
                    gte: thirtyDaysAgo
                }
            },
            select: {
                createdAt: true,
                balanceAfter: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        // Get withdrawal limits
        const withdrawalLimits = await this.getWithdrawalLimits(nodeId);

        return {
            currentBalance,
            totalCredits,
            totalDebits,
            balanceHistory,
            withdrawalLimits
        };
    }

    async calculateBalanceAfter(nodeId, amount, type) {
        const currentBalance = await this.getBalance(nodeId);
        return type === 'CREDIT' 
            ? currentBalance.currentBalance + amount
            : currentBalance.currentBalance - amount;
    }

    async getWithdrawalLimits(nodeId) {
        const node = await prisma.node.findUnique({
            where: { id: nodeId },
            include: {
                package: {
                    include: {
                        package: true
                    }
                }
            }
        });

        // Get user's package withdrawal limits
        const packageLimits = node?.package?.package?.withdrawalLimits || {
            daily: 1000,
            weekly: 5000,
            monthly: 20000,
            minimum: 50
        };

        // Calculate remaining limits based on recent withdrawals
        const [dailyTotal, weeklyTotal, monthlyTotal] = await Promise.all([
            this.getWithdrawalTotal(nodeId, 1),
            this.getWithdrawalTotal(nodeId, 7),
            this.getWithdrawalTotal(nodeId, 30)
        ]);

        return {
            daily: {
                limit: packageLimits.daily,
                used: dailyTotal,
                remaining: Math.max(0, packageLimits.daily - dailyTotal)
            },
            weekly: {
                limit: packageLimits.weekly,
                used: weeklyTotal,
                remaining: Math.max(0, packageLimits.weekly - weeklyTotal)
            },
            monthly: {
                limit: packageLimits.monthly,
                used: monthlyTotal,
                remaining: Math.max(0, packageLimits.monthly - monthlyTotal)
            },
            minimum: packageLimits.minimum
        };
    }

    async getWithdrawalTotal(nodeId, days) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const result = await prisma.nodeStatement.aggregate({
            where: {
                nodeId,
                type: 'DEBIT',
                status: 'COMPLETED',
                referenceType: 'WITHDRAWAL',
                createdAt: {
                    gte: startDate
                }
            },
            _sum: {
                amount: true
            }
        });

        return result._sum.amount || 0;
    }

    async createBulk(statements, tx = prisma) {
        const createdStatements = [];
        for (const statement of statements) {
            const balanceAfter = await this.calculateBalanceAfter(
                statement.nodeId, 
                statement.amount, 
                statement.type
            );
            
            const createdStatement = await tx.nodeStatement.create({
                data: {
                    ...statement,
                    createdAt: new Date(),
                    balanceAfter
                },
                include: {
                    node: {
                        include: {
                            user: true
                        }
                    }
                }
            });
            
            createdStatements.push(createdStatement);
        }
        return createdStatements;
    }

    async processScheduledPayouts(tx = prisma) {
        const now = new Date();
        const scheduledStatements = await tx.nodeStatement.findMany({
            where: {
                scheduledFor: {
                    lte: now
                },
                status: 'SCHEDULED'
            },
            orderBy: {
                scheduledFor: 'asc'
            }
        });

        const processedStatements = [];
        for (const statement of scheduledStatements) {
            try {
                const processed = await tx.nodeStatement.update({
                    where: { id: statement.id },
                    data: {
                        status: 'COMPLETED',
                        processedAt: now,
                        balanceAfter: await this.calculateBalanceAfter(
                            statement.nodeId,
                            statement.amount,
                            statement.type
                        )
                    }
                });
                processedStatements.push(processed);
            } catch (error) {
                console.error(`Failed to process scheduled statement ${statement.id}:`, error);
                await tx.nodeStatement.update({
                    where: { id: statement.id },
                    data: {
                        status: 'FAILED',
                        processedAt: now,
                        failureReason: error.message
                    }
                });
            }
        }

        return processedStatements;
    }

    async schedulePayouts(payouts, tx = prisma) {
        const scheduledPayouts = [];
        for (const payout of payouts) {
            const scheduled = await tx.nodeStatement.create({
                data: {
                    ...payout,
                    status: 'SCHEDULED',
                    createdAt: new Date()
                }
            });
            scheduledPayouts.push(scheduled);
        }
        return scheduledPayouts;
    }

    async updateStatus(id, status, tx = prisma) {
        return tx.nodeStatement.update({
            where: { id },
            data: { 
                status,
                processedAt: status === 'COMPLETED' ? new Date() : undefined
            },
            include: {
                node: {
                    include: {
                        user: true
                    }
                }
            }
        });
    }

    async delete(id, tx = prisma) {
        return tx.nodeStatement.delete({
            where: { id }
        });
    }

    async findById(id) {
        return prisma.nodeStatement.findUnique({
            where: { id },
            include: {
                node: {
                    include: {
                        user: true
                    }
                }
            }
        });
    }

    async update(id, statementData) {
        return prisma.nodeStatement.update({
            where: { id },
            data: statementData,
            include: {
                node: {
                    include: {
                        user: true
                    }
                }
            }
        });
    }

    async findPendingByNodeId(nodeId) {
        return prisma.nodeStatement.findMany({
            where: {
                nodeId,
                status: 'PENDING'
            },
            include: {
                node: {
                    include: {
                        user: true
                    }
                }
            }
        });
    }

    async findByReferenceId(referenceType, referenceId) {
        return prisma.nodeStatement.findMany({
            where: {
                referenceType,
                referenceId
            },
            include: {
                node: {
                    include: {
                        user: true
                    }
                }
            }
        });
    }
}

module.exports = new NodeStatementService();
