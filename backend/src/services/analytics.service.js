const prisma = require('../config/prisma');
const { calculateDateRange } = require('../utils/date');
const { AppError } = require('../utils/appError');
const nodeService = require('./node.service');
const financeService = require('./finance.service');

class AnalyticsService {
    /**
     * Get network metrics for a node
     */
    async getNetworkMetrics(nodeId, period, depth) {
        const { startDate, endDate } = calculateDateRange(period);
        
        const metrics = await prisma.$transaction(async (tx) => {
            // Get network size and growth
            const networkSize = await tx.node.count({
                where: {
                    ancestorId: nodeId,
                    depth: { lte: depth },
                    createdAt: { gte: startDate }
                }
            });

            const activeNodes = await tx.node.count({
                where: {
                    ancestorId: nodeId,
                    depth: { lte: depth },
                    status: 'ACTIVE'
                }
            });

            // Get sales metrics
            const sales = await tx.transaction.aggregate({
                where: {
                    node: {
                        ancestorId: nodeId,
                        depth: { lte: depth }
                    },
                    type: 'SALE',
                    createdAt: { gte: startDate, lte: endDate }
                },
                _sum: { amount: true },
                _count: true
            });

            // Get recruitment metrics
            const recruits = await tx.node.count({
                where: {
                    ancestorId: nodeId,
                    depth: { lte: depth },
                    createdAt: { gte: startDate, lte: endDate }
                }
            });

            return {
                networkSize,
                activeNodes,
                inactiveNodes: networkSize - activeNodes,
                periodMetrics: {
                    sales: {
                        count: sales._count || 0,
                        volume: sales._sum?.amount || 0
                    },
                    recruits,
                    startDate,
                    endDate
                }
            };
        });

        return metrics;
    }

    /**
     * Get commission analytics
     */
    async getCommissionAnalytics(nodeId, startDate, endDate, groupBy = 'day') {
        const dateRange = startDate && endDate 
            ? { startDate: new Date(startDate), endDate: new Date(endDate) }
            : calculateDateRange('30d');

        const commissions = await prisma.commission.groupBy({
            by: [groupBy === 'day' ? 'createdAt' : groupBy],
            where: {
                nodeId,
                createdAt: {
                    gte: dateRange.startDate,
                    lte: dateRange.endDate
                }
            },
            _sum: {
                amount: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        const total = await prisma.commission.aggregate({
            where: {
                nodeId,
                createdAt: {
                    gte: dateRange.startDate,
                    lte: dateRange.endDate
                }
            },
            _sum: {
                amount: true
            },
            _avg: {
                amount: true
            },
            _count: true
        });

        return {
            analytics: commissions,
            summary: {
                total: total._sum?.amount || 0,
                average: total._avg?.amount || 0,
                count: total._count || 0
            },
            period: {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                groupBy
            }
        };
    }

    /**
     * Get team performance metrics
     */
    async getTeamPerformance(nodeId, period, metrics) {
        const { startDate, endDate } = calculateDateRange(period);
        
        const team = await nodeService.getDownline(nodeId, { maxDepth: 10 });
        const teamIds = team.map(member => member.id);

        const performance = await prisma.$transaction(async (tx) => {
            const data = {};

            if (metrics.includes('sales')) {
                const sales = await tx.transaction.groupBy({
                    by: ['nodeId'],
                    where: {
                        nodeId: { in: teamIds },
                        type: 'SALE',
                        createdAt: { gte: startDate, lte: endDate }
                    },
                    _sum: { amount: true },
                    _count: true
                });
                data.sales = sales;
            }

            if (metrics.includes('recruits')) {
                const recruits = await tx.node.groupBy({
                    by: ['sponsorId'],
                    where: {
                        sponsorId: { in: teamIds },
                        createdAt: { gte: startDate, lte: endDate }
                    },
                    _count: true
                });
                data.recruits = recruits;
            }

            if (metrics.includes('commissions')) {
                const commissions = await tx.commission.groupBy({
                    by: ['nodeId'],
                    where: {
                        nodeId: { in: teamIds },
                        createdAt: { gte: startDate, lte: endDate }
                    },
                    _sum: { amount: true }
                });
                data.commissions = commissions;
            }

            return data;
        });

        return {
            performance,
            period: { startDate, endDate },
            teamSize: team.length
        };
    }

    /**
     * Get rank progression analytics
     */
    async getRankProgressionAnalytics(nodeId, period) {
        const { startDate, endDate } = calculateDateRange(period);

        const rankHistory = await prisma.rankHistory.findMany({
            where: {
                nodeId,
                createdAt: { gte: startDate, lte: endDate }
            },
            orderBy: { createdAt: 'asc' },
            include: {
                rank: true
            }
        });

        const currentRank = await prisma.node.findUnique({
            where: { id: nodeId },
            include: {
                rank: true,
                nextRank: {
                    include: {
                        requirements: true
                    }
                }
            }
        });

        return {
            history: rankHistory,
            current: {
                rank: currentRank.rank,
                nextRank: currentRank.nextRank,
                requirements: currentRank.nextRank?.requirements
            },
            period: { startDate, endDate }
        };
    }

    /**
     * Generate exportable report
     */
    async generateExportableReport(nodeId, type, format, filters) {
        let data;

        switch (type) {
            case 'network':
                data = await this.getNetworkMetrics(nodeId, filters.period || '30d', filters.depth || 3);
                break;
            case 'commission':
                data = await this.getCommissionAnalytics(
                    nodeId,
                    filters.startDate,
                    filters.endDate,
                    filters.groupBy
                );
                break;
            case 'team':
                data = await this.getTeamPerformance(
                    nodeId,
                    filters.period || '30d',
                    filters.metrics || ['sales', 'recruits', 'commissions']
                );
                break;
            case 'financial':
                data = await financeService.getFinancialReport(
                    nodeId,
                    filters.startDate,
                    filters.endDate,
                    filters.metrics
                );
                break;
            default:
                throw new AppError('Invalid report type', 400);
        }

        // Format data based on requested format
        // Implementation for CSV, PDF, Excel formatting would go here
        return data;
    }

    /**
     * Get admin dashboard metrics
     */
    async getAdminDashboardMetrics(period) {
        const { startDate, endDate } = calculateDateRange(period);

        const metrics = await prisma.$transaction(async (tx) => {
            // Network metrics
            const totalNodes = await tx.node.count();
            const activeNodes = await tx.node.count({ where: { status: 'ACTIVE' } });
            const newNodes = await tx.node.count({
                where: { createdAt: { gte: startDate, lte: endDate } }
            });

            // Financial metrics
            const sales = await tx.transaction.aggregate({
                where: {
                    type: 'SALE',
                    createdAt: { gte: startDate, lte: endDate }
                },
                _sum: { amount: true },
                _count: true
            });

            const commissions = await tx.commission.aggregate({
                where: { createdAt: { gte: startDate, lte: endDate } },
                _sum: { amount: true },
                _count: true
            });

            // Package distribution
            const packages = await tx.package.findMany({
                include: {
                    _count: {
                        select: { nodes: true }
                    }
                }
            });

            // Rank distribution
            const ranks = await tx.rank.findMany({
                include: {
                    _count: {
                        select: { nodes: true }
                    }
                }
            });

            return {
                network: {
                    totalNodes,
                    activeNodes,
                    inactiveNodes: totalNodes - activeNodes,
                    newNodes,
                    packages: packages.map(pkg => ({
                        name: pkg.name,
                        count: pkg._count.nodes
                    })),
                    ranks: ranks.map(rank => ({
                        name: rank.name,
                        count: rank._count.nodes
                    }))
                },
                financial: {
                    sales: {
                        count: sales._count || 0,
                        volume: sales._sum?.amount || 0
                    },
                    commissions: {
                        count: commissions._count || 0,
                        volume: commissions._sum?.amount || 0
                    }
                },
                period: { startDate, endDate }
            };
        });

        return metrics;
    }

    /**
     * Predict network growth and commissions
     */
    async getPredictiveAnalytics(nodeId, forecastPeriod = '3m') {
        const historicalPeriod = '6m';
        const { startDate, endDate } = calculateDateRange(historicalPeriod);
        
        // Get historical data
        const [networkGrowth, commissions, retention] = await Promise.all([
            prisma.node.groupBy({
                by: ['createdAt'],
                where: {
                    ancestorId: nodeId,
                    createdAt: { gte: startDate, lte: endDate }
                },
                _count: true,
                orderBy: { createdAt: 'asc' }
            }),
            prisma.commission.groupBy({
                by: ['createdAt'],
                where: {
                    nodeId,
                    createdAt: { gte: startDate, lte: endDate }
                },
                _sum: { amount: true },
                orderBy: { createdAt: 'asc' }
            }),
            this.getRetentionAnalytics(nodeId, historicalPeriod)
        ]);

        // Calculate growth rates and trends
        const growthRate = this._calculateGrowthRate(networkGrowth.map(g => g._count));
        const commissionTrend = this._calculateTrend(commissions.map(c => c._sum.amount));
        const retentionRate = retention.overallRetention;

        // Project future metrics
        const forecastMonths = parseInt(forecastPeriod);
        const projectedGrowth = this._projectGrowth(networkGrowth[networkGrowth.length - 1]._count, growthRate, forecastMonths);
        const projectedCommissions = this._projectGrowth(commissions[commissions.length - 1]._sum.amount, commissionTrend, forecastMonths);

        return {
            predictions: {
                networkGrowth: projectedGrowth,
                commissions: projectedCommissions,
                retentionRate
            },
            confidence: {
                growthConfidence: this._calculateConfidenceScore(growthRate, networkGrowth.length),
                commissionConfidence: this._calculateConfidenceScore(commissionTrend, commissions.length)
            },
            historicalMetrics: {
                growthRate,
                commissionTrend,
                retentionRate
            }
        };
    }

    /**
     * Calculate performance score for a node
     */
    async getPerformanceScore(nodeId, period = '30d') {
        const { startDate, endDate } = calculateDateRange(period);
        
        const metrics = await prisma.$transaction(async (tx) => {
            // Activity metrics
            const activity = await tx.node.findUnique({
                where: { id: nodeId },
                include: {
                    _count: {
                        select: {
                            sponsored: {
                                where: {
                                    createdAt: { gte: startDate, lte: endDate }
                                }
                            },
                            commissions: {
                                where: {
                                    createdAt: { gte: startDate, lte: endDate }
                                }
                            }
                        }
                    },
                    package: true,
                    rank: true
                }
            });

            // Team performance
            const teamPerformance = await this.getTeamPerformance(nodeId, period, ['sales', 'recruits', 'commissions']);
            
            // Calculate scores
            const recruitmentScore = this._calculateMetricScore(activity._count.sponsored, 'recruitment');
            const commissionScore = this._calculateMetricScore(activity._count.commissions, 'commission');
            const teamScore = this._calculateTeamScore(teamPerformance);
            const rankScore = this._calculateRankScore(activity.rank);

            const totalScore = (recruitmentScore + commissionScore + teamScore + rankScore) / 4;

            return {
                totalScore,
                breakdown: {
                    recruitment: recruitmentScore,
                    commission: commissionScore,
                    team: teamScore,
                    rank: rankScore
                },
                percentile: await this._calculatePercentile(totalScore, nodeId)
            };
        });

        return metrics;
    }

    /**
     * Perform cohort analysis
     */
    async getCohortAnalysis(nodeId, cohortPeriod = '6m') {
        const { startDate, endDate } = calculateDateRange(cohortPeriod);
        
        // Get all nodes in the network within period
        const nodes = await prisma.node.findMany({
            where: {
                ancestorId: nodeId,
                createdAt: { gte: startDate, lte: endDate }
            },
            include: {
                user: true,
                package: true,
                commissions: {
                    where: {
                        createdAt: { gte: startDate, lte: endDate }
                    }
                }
            }
        });

        // Group nodes by cohort (join month)
        const cohorts = this._groupByCohort(nodes);

        // Calculate metrics for each cohort
        const cohortMetrics = cohorts.map(cohort => ({
            period: cohort.period,
            size: cohort.nodes.length,
            retention: this._calculateCohortRetention(cohort.nodes, endDate),
            performance: {
                averageCommissions: this._calculateAverageCommissions(cohort.nodes),
                packageDistribution: this._getPackageDistribution(cohort.nodes),
                activeRate: this._calculateActiveRate(cohort.nodes)
            }
        }));

        return {
            cohorts: cohortMetrics,
            summary: this._summarizeCohortMetrics(cohortMetrics)
        };
    }

    /**
     * Calculate network health score
     */
    async getNetworkHealth(nodeId) {
        const metrics = await prisma.$transaction(async (tx) => {
            // Structure health
            const structure = await tx.node.findMany({
                where: { ancestorId: nodeId },
                include: {
                    _count: {
                        select: {
                            children: true,
                            sponsored: true
                        }
                    }
                }
            });

            // Activity health
            const activity = await this.getTeamPerformance(nodeId, '30d', ['sales', 'recruits', 'commissions']);

            // Growth health
            const growth = await this.getPredictiveAnalytics(nodeId, '1m');

            // Calculate health scores
            const structureScore = this._calculateStructureHealth(structure);
            const activityScore = this._calculateActivityHealth(activity);
            const growthScore = this._calculateGrowthHealth(growth);

            const overallHealth = (structureScore + activityScore + growthScore) / 3;

            return {
                overall: overallHealth,
                components: {
                    structure: structureScore,
                    activity: activityScore,
                    growth: growthScore
                },
                recommendations: this._generateHealthRecommendations({
                    structure: structureScore,
                    activity: activityScore,
                    growth: growthScore
                })
            };
        });

        return metrics;
    }

    /**
     * Analyze retention patterns
     */
    async getRetentionAnalytics(nodeId, period = '6m') {
        const { startDate, endDate } = calculateDateRange(period);
        
        const data = await prisma.$transaction(async (tx) => {
            // Get all team members
            const team = await tx.node.findMany({
                where: {
                    ancestorId: nodeId,
                    createdAt: { lte: endDate }
                },
                include: {
                    user: true,
                    package: true,
                    commissions: {
                        where: {
                            createdAt: { gte: startDate, lte: endDate }
                        }
                    }
                }
            });

            // Calculate retention metrics
            const retentionByPackage = this._calculateRetentionByPackage(team);
            const retentionByPeriod = this._calculateRetentionByPeriod(team, startDate, endDate);
            const churnAnalysis = this._analyzeChurnPatterns(team);

            return {
                overallRetention: this._calculateOverallRetention(team),
                byPackage: retentionByPackage,
                byPeriod: retentionByPeriod,
                churnAnalysis,
                riskAssessment: await this._assessChurnRisk(team)
            };
        });

        return data;
    }

    // Helper methods for calculations
    _calculateGrowthRate(data) {
        // Implementation for calculating growth rate
        return data.length > 1 ? ((data[data.length - 1] - data[0]) / data[0]) * 100 : 0;
    }

    _calculateTrend(data) {
        // Simple linear regression implementation
        return data.length > 1 ? ((data[data.length - 1] - data[0]) / data.length) : 0;
    }

    _projectGrowth(currentValue, rate, months) {
        return currentValue * Math.pow(1 + rate/100, months);
    }

    _calculateConfidenceScore(rate, sampleSize) {
        return Math.min(100, (rate > 0 ? rate * 0.7 : 0) + (sampleSize * 0.3));
    }

    _calculateMetricScore(value, type) {
        const benchmarks = {
            recruitment: { low: 2, high: 10 },
            commission: { low: 5, high: 20 }
        };
        const { low, high } = benchmarks[type];
        return Math.min(100, (value / high) * 100);
    }

    _calculateTeamScore(performance) {
        return (
            (performance.sales?.volume || 0) * 0.4 +
            (performance.recruits?.count || 0) * 0.3 +
            (performance.commissions?.volume || 0) * 0.3
        ) / 100;
    }

    _calculateRankScore(rank) {
        return (rank?.level || 1) * 10;
    }

    async _calculatePercentile(score, nodeId) {
        const allScores = await prisma.node.findMany({
            select: { id: true },
            where: {
                id: { not: nodeId }
            }
        });
        
        const position = allScores.filter(n => n.score <= score).length;
        return (position / allScores.length) * 100;
    }

    _groupByCohort(nodes) {
        return nodes.reduce((acc, node) => {
            const period = node.createdAt.toISOString().slice(0, 7); // YYYY-MM
            const cohort = acc.find(c => c.period === period);
            if (cohort) {
                cohort.nodes.push(node);
            } else {
                acc.push({ period, nodes: [node] });
            }
            return acc;
        }, []);
    }

    _calculateStructureHealth(structure) {
        const metrics = {
            balanceScore: this._calculateBalanceScore(structure),
            depthScore: this._calculateDepthScore(structure),
            spreadScore: this._calculateSpreadScore(structure)
        };
        
        return Object.values(metrics).reduce((a, b) => a + b) / 3;
    }

    _generateHealthRecommendations(scores) {
        const recommendations = [];
        
        if (scores.structure < 70) {
            recommendations.push({
                area: 'Network Structure',
                action: 'Focus on balancing team legs and improving network depth',
                priority: 'High'
            });
        }
        
        if (scores.activity < 70) {
            recommendations.push({
                area: 'Team Activity',
                action: 'Implement activation campaigns and increase engagement',
                priority: 'Medium'
            });
        }
        
        if (scores.growth < 70) {
            recommendations.push({
                area: 'Growth',
                action: 'Develop recruitment strategies and retention programs',
                priority: 'High'
            });
        }
        
        return recommendations;
    }
}

module.exports = new AnalyticsService();
