const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ReportService {
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

        const [reports, total] = await Promise.all([
            prisma.report.findMany({
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
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.report.count({ where })
        ]);

        return {
            reports,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async findById(id) {
        const report = await prisma.report.findUnique({
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
                }
            }
        });

        if (!report) {
            throw new Error('Report not found');
        }

        return report;
    }

    async create(reportData) {
        return await prisma.$transaction(async (tx) => {
            // Create the report
            const report = await tx.report.create({
                data: {
                    userId: reportData.userId,
                    type: reportData.type,
                    data: reportData.data,
                    status: reportData.status || 'PENDING'
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true
                        }
                    }
                }
            });

            // Create notification for admin
            await tx.notification.create({
                data: {
                    userId: reportData.userId,
                    title: 'New Report Generated',
                    message: `A new ${reportData.type} report has been generated`,
                    type: 'REPORT'
                }
            });

            return report;
        });
    }

    async update(id, reportData) {
        const report = await this.findById(id);
        
        return await prisma.$transaction(async (tx) => {
            const updated = await tx.report.update({
                where: { id },
                data: {
                    type: reportData.type || report.type,
                    data: reportData.data || report.data,
                    status: reportData.status || report.status
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true
                        }
                    }
                }
            });

            // If status changed, create notification
            if (reportData.status && reportData.status !== report.status) {
                await tx.notification.create({
                    data: {
                        userId: report.userId,
                        title: 'Report Status Updated',
                        message: `Your report status has been updated to ${reportData.status}`,
                        type: 'REPORT_UPDATE'
                    }
                });
            }

            return updated;
        });
    }

    async delete(id) {
        await this.findById(id); // Verify existence
        return prisma.report.delete({ where: { id } });
    }

    async getUserReports(userId, { page = 1, limit = 10, type, status, startDate, endDate }) {
        const skip = (page - 1) * limit;
        const where = { userId };

        if (type) where.type = type;
        if (status) where.status = status;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        const [reports, total] = await Promise.all([
            prisma.report.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.report.count({ where })
        ]);

        return {
            reports,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async getReportStats() {
        const [total, pending, completed] = await Promise.all([
            prisma.report.count(),
            prisma.report.count({ where: { status: 'PENDING' } }),
            prisma.report.count({ where: { status: 'COMPLETED' } })
        ]);

        return {
            total,
            pending,
            completed,
            completion_rate: total > 0 ? (completed / total) * 100 : 0
        };
    }

    async generateCommissionReport(userId, startDate, endDate) {
        const commissions = await prisma.commission.findMany({
            where: {
                userId,
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                package: true,
                sourceUser: true
            }
        });

        const totalAmount = commissions.reduce((sum, commission) => sum + commission.amount, 0);
        const byType = commissions.reduce((acc, commission) => {
            acc[commission.type] = (acc[commission.type] || 0) + commission.amount;
            return acc;
        }, {});

        return this.create({
            userId,
            type: 'COMMISSION',
            data: {
                totalAmount,
                byType,
                startDate,
                endDate,
                commissionCount: commissions.length
            }
        });
    }

    async generateWithdrawalReport(userId, startDate, endDate) {
        const withdrawals = await prisma.withdrawal.findMany({
            where: {
                userId,
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        const totalAmount = withdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
        const byStatus = withdrawals.reduce((acc, withdrawal) => {
            acc[withdrawal.status] = (acc[withdrawal.status] || 0) + withdrawal.amount;
            return acc;
        }, {});

        return this.create({
            userId,
            type: 'WITHDRAWAL',
            data: {
                totalAmount,
                byStatus,
                startDate,
                endDate,
                withdrawalCount: withdrawals.length
            }
        });
    }

    async generateNetworkReport(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                node: {
                    include: {
                        sponsored: {
                            include: {
                                user: true,
                                package: {
                                    include: {
                                        package: true
                                    }
                                }
                            }
                        },
                        children: {
                            include: {
                                user: true,
                                package: {
                                    include: {
                                        package: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!user || !user.node) {
            throw new Error('User or node not found');
        }

        const networkData = {
            sponsoredCount: user.node.sponsored.length,
            leftCount: user.node.children.filter(child => child.position === 'LEFT').length,
            rightCount: user.node.children.filter(child => child.position === 'RIGHT').length,
            totalPackageValue: user.node.sponsored.reduce((sum, node) => {
                return sum + (node.package?.package?.price || 0);
            }, 0)
        };

        return this.create({
            userId,
            type: 'NETWORK',
            data: networkData
        });
    }

    async generateRankProgressionReport(userId, startDate, endDate) {
        const rankHistory = await prisma.rankHistory.findMany({
            where: {
                userId,
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: {
                createdAt: 'asc'
            },
            include: {
                rank: true
            }
        });

        // Calculate time spent at each rank
        const rankDurations = {};
        let previousRank = null;
        let previousDate = null;

        rankHistory.forEach((history) => {
            if (previousRank && previousDate) {
                const duration = history.createdAt.getTime() - previousDate.getTime();
                rankDurations[previousRank] = (rankDurations[previousRank] || 0) + duration;
            }
            previousRank = history.rank.name;
            previousDate = history.createdAt;
        });

        // Calculate requirements for next rank
        const currentRank = rankHistory[rankHistory.length - 1]?.rank;
        const nextRank = currentRank ? await prisma.rank.findFirst({
            where: {
                level: {
                    gt: currentRank.level
                }
            },
            orderBy: {
                level: 'asc'
            }
        }) : null;

        return this.create({
            userId,
            type: 'RANK_PROGRESSION',
            data: {
                rankHistory: rankHistory.map(h => ({
                    rank: h.rank.name,
                    achievedAt: h.createdAt,
                    requirements: h.requirements
                })),
                rankDurations,
                currentRank: currentRank?.name,
                nextRank: nextRank ? {
                    name: nextRank.name,
                    requirements: nextRank.requirements
                } : null,
                progressMetrics: {
                    totalRanksAchieved: rankHistory.length,
                    averageTimeToRankUp: rankHistory.length > 1 ? 
                        (rankHistory[rankHistory.length - 1].createdAt - rankHistory[0].createdAt) / (rankHistory.length - 1) : 0
                }
            }
        });
    }

    async generateTeamPerformanceReport(userId, startDate, endDate) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                node: {
                    include: {
                        sponsored: {
                            include: {
                                user: true,
                                package: true,
                                commissions: {
                                    where: {
                                        createdAt: {
                                            gte: startDate,
                                            lte: endDate
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!user?.node) throw new Error('User node not found');

        // Calculate team metrics
        const teamMembers = user.node.sponsored;
        const activeMembers = teamMembers.filter(member => 
            member.commissions.some(c => c.createdAt >= startDate && c.createdAt <= endDate)
        );

        const teamMetrics = {
            totalMembers: teamMembers.length,
            activeMembers: activeMembers.length,
            activityRate: teamMembers.length > 0 ? 
                (activeMembers.length / teamMembers.length) * 100 : 0,
            totalCommissions: activeMembers.reduce((sum, member) => 
                sum + member.commissions.reduce((s, c) => s + c.amount, 0), 0),
            memberPerformance: teamMembers.map(member => ({
                userId: member.user.id,
                username: member.user.username,
                package: member.package?.name,
                commissions: member.commissions.reduce((sum, c) => sum + c.amount, 0),
                lastActive: member.commissions.length > 0 ? 
                    Math.max(...member.commissions.map(c => c.createdAt.getTime())) : null
            }))
        };

        return this.create({
            userId,
            type: 'TEAM_PERFORMANCE',
            data: teamMetrics
        });
    }

    async generateGenealogyReport(userId, maxDepth = 3) {
        const buildNetworkTree = async (nodeId, currentDepth = 0) => {
            if (currentDepth >= maxDepth) return null;

            const node = await prisma.node.findUnique({
                where: { id: nodeId },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            createdAt: true
                        }
                    },
                    package: {
                        include: {
                            package: true
                        }
                    },
                    children: {
                        include: {
                            user: true
                        }
                    },
                    sponsored: {
                        include: {
                            user: true
                        }
                    }
                }
            });

            if (!node) return null;

            const children = await Promise.all(
                node.children.map(child => buildNetworkTree(child.id, currentDepth + 1))
            );

            return {
                nodeId: node.id,
                user: node.user,
                package: node.package?.package?.name,
                packageValue: node.package?.package?.price || 0,
                sponsoredCount: node.sponsored.length,
                sponsored: node.sponsored.map(s => ({
                    userId: s.user.id,
                    username: s.user.username,
                    joinedAt: s.user.createdAt
                })),
                children: children.filter(Boolean)
            };
        };

        const rootNode = await prisma.node.findFirst({
            where: { userId }
        });

        if (!rootNode) throw new Error('User node not found');

        const genealogyTree = await buildNetworkTree(rootNode.id);

        return this.create({
            userId,
            type: 'GENEALOGY',
            data: {
                tree: genealogyTree,
                metadata: {
                    maxDepth,
                    totalNodes: JSON.stringify(genealogyTree).match(/"nodeId":/g)?.length || 1,
                    generatedAt: new Date()
                }
            }
        });
    }
}

module.exports = new ReportService();
