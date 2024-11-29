const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class NodeChildrenService {
    async getDownline({ userId, level, status, startDate, endDate }) {
        const where = {
            sponsorId: userId,
            isDeleted: false
        };

        if (status) where.status = status;
        if (startDate) where.createdAt = { gte: startDate };
        if (endDate) where.createdAt = { ...where.createdAt, lte: endDate };

        return prisma.node.findMany({
            where,
            include: {
                package: true,
                rank: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async getUpline({ userId, level }) {
        const genealogy = [];
        let currentNode = await prisma.node.findUnique({
            where: { id: userId },
            include: {
                parent: true
            }
        });

        while (currentNode?.parent && (!level || genealogy.length < level)) {
            genealogy.push(currentNode.parent);
            currentNode = await prisma.node.findUnique({
                where: { id: currentNode.parent.id },
                include: {
                    parent: true
                }
            });
        }

        return genealogy;
    }

    async getNetworkStats(userId) {
        const [directReferrals, leftTeam, rightTeam] = await Promise.all([
            prisma.node.count({
                where: {
                    sponsorId: userId,
                    isDeleted: false
                }
            }),
            this.getTeamCount(userId, 'L'),
            this.getTeamCount(userId, 'R')
        ]);

        return {
            directReferrals,
            leftTeam,
            rightTeam,
            totalTeam: leftTeam.total + rightTeam.total
        };
    }

    async getTeamCount(userId, direction) {
        const [total, active] = await Promise.all([
            prisma.node.count({
                where: {
                    parentId: userId,
                    direction,
                    isDeleted: false
                }
            }),
            prisma.node.count({
                where: {
                    parentId: userId,
                    direction,
                    status: 'ACTIVE',
                    isDeleted: false
                }
            })
        ]);

        return { total, active };
    }

    async getTeamPerformance({ userId, startDate, endDate }) {
        const where = {
            OR: [
                { parentId: userId },
                { sponsorId: userId }
            ],
            isDeleted: false
        };

        if (startDate) where.createdAt = { gte: startDate };
        if (endDate) where.createdAt = { ...where.createdAt, lte: endDate };

        const performance = await prisma.node.findMany({
            where,
            include: {
                package: true,
                transactions: {
                    where: {
                        type: 'COMMISSION',
                        status: 'COMPLETED',
                        createdAt: {
                            gte: startDate,
                            lte: endDate
                        }
                    }
                }
            }
        });

        return performance.map(member => ({
            ...member,
            totalCommission: member.transactions.reduce((sum, tx) => sum + tx.amount, 0)
        }));
    }

    async getGenealogyTree({ userId, depth = 3 }) {
        const getChildren = async (nodeId, currentDepth) => {
            if (currentDepth >= depth) return null;

            const children = await prisma.node.findMany({
                where: {
                    parentId: nodeId,
                    isDeleted: false
                },
                include: {
                    package: true,
                    rank: true
                }
            });

            const childrenWithSubtrees = await Promise.all(
                children.map(async child => ({
                    ...child,
                    children: await getChildren(child.id, currentDepth + 1)
                }))
            );

            return {
                left: childrenWithSubtrees.find(child => child.direction === 'L') || null,
                right: childrenWithSubtrees.find(child => child.direction === 'R') || null
            };
        };

        const root = await prisma.node.findUnique({
            where: { id: userId },
            include: {
                package: true,
                rank: true
            }
        });

        return {
            ...root,
            children: await getChildren(userId, 0)
        };
    }

    async getDirectReferrals({ userId, status, startDate, endDate, page = 1, limit = 10 }) {
        const where = {
            sponsorId: userId,
            isDeleted: false
        };

        if (status) where.status = status;
        if (startDate) where.createdAt = { gte: startDate };
        if (endDate) where.createdAt = { ...where.createdAt, lte: endDate };

        const [total, referrals] = await Promise.all([
            prisma.node.count({ where }),
            prisma.node.findMany({
                where,
                include: {
                    package: true,
                    rank: true
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                }
            })
        ]);

        return {
            data: referrals,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getBusinessVolume({ userId, startDate, endDate }) {
        const where = {
            OR: [
                { parentId: userId },
                { sponsorId: userId }
            ],
            isDeleted: false
        };

        if (startDate) where.createdAt = { gte: startDate };
        if (endDate) where.createdAt = { ...where.createdAt, lte: endDate };

        const [personalVolume, groupVolume] = await Promise.all([
            prisma.transaction.aggregate({
                where: {
                    userId,
                    type: 'PURCHASE',
                    status: 'COMPLETED',
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _sum: {
                    amount: true
                }
            }),
            prisma.transaction.aggregate({
                where: {
                    user: {
                        OR: [
                            { parentId: userId },
                            { sponsorId: userId }
                        ]
                    },
                    type: 'PURCHASE',
                    status: 'COMPLETED',
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _sum: {
                    amount: true
                }
            })
        ]);

        return {
            personalVolume: personalVolume._sum.amount || 0,
            groupVolume: groupVolume._sum.amount || 0,
            totalVolume: (personalVolume._sum.amount || 0) + (groupVolume._sum.amount || 0)
        };
    }

    async getRankQualification(userId) {
        const user = await prisma.node.findUnique({
            where: { id: userId },
            include: {
                rank: true,
                package: true
            }
        });

        const nextRank = await prisma.rank.findFirst({
            where: {
                level: {
                    gt: user.rank.level
                }
            },
            orderBy: {
                level: 'asc'
            }
        });

        if (!nextRank) {
            return {
                currentRank: user.rank,
                nextRank: null,
                requirements: null,
                progress: null
            };
        }

        const [directReferrals, teamVolume] = await Promise.all([
            prisma.node.count({
                where: {
                    sponsorId: userId,
                    isDeleted: false,
                    status: 'ACTIVE'
                }
            }),
            this.getBusinessVolume({
                userId,
                startDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
            })
        ]);

        const requirements = {
            directReferrals: {
                required: nextRank.requiredDirectReferrals,
                current: directReferrals
            },
            teamVolume: {
                required: nextRank.requiredTeamVolume,
                current: teamVolume.totalVolume
            }
        };

        const progress = {
            directReferrals: (directReferrals / nextRank.requiredDirectReferrals) * 100,
            teamVolume: (teamVolume.totalVolume / nextRank.requiredTeamVolume) * 100
        };

        return {
            currentRank: user.rank,
            nextRank,
            requirements,
            progress
        };
    }

    async getTeamStructure({ userId, view }) {
        const getStructure = async (nodeId, structure) => {
            const node = await prisma.node.findUnique({
                where: { id: nodeId },
                include: {
                    package: true,
                    rank: true
                }
            });

            if (!node) return null;

            const children = await prisma.node.findMany({
                where: {
                    [structure === 'binary' ? 'parentId' : 'sponsorId']: nodeId,
                    isDeleted: false
                },
                include: {
                    package: true,
                    rank: true
                }
            });

            return {
                ...node,
                children: await Promise.all(
                    children.map(child => getStructure(child.id, structure))
                )
            };
        };

        return getStructure(userId, view);
    }

    async searchNetwork({ userId, query, type }) {
        const where = {
            OR: [
                { parentId: userId },
                { sponsorId: userId }
            ],
            isDeleted: false
        };

        if (type === 'username') {
            where.OR.push({ username: { contains: query } });
        } else if (type === 'email') {
            where.OR.push({ email: { contains: query } });
        }

        return prisma.node.findMany({
            where,
            include: {
                package: true,
                rank: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async getTeamBalanceMetrics(userId) {
        const [leftTeam, rightTeam] = await Promise.all([
            this.getDetailedTeamMetrics(userId, 'L'),
            this.getDetailedTeamMetrics(userId, 'R')
        ]);

        const balanceRatio = Math.min(leftTeam.volume, rightTeam.volume) / 
                            Math.max(leftTeam.volume, rightTeam.volume) || 0;

        return {
            metrics: {
                left: leftTeam,
                right: rightTeam,
                balanceRatio: balanceRatio * 100,
                isBalanced: balanceRatio >= 0.7
            },
            recommendations: this._generateBalanceRecommendations(leftTeam, rightTeam)
        };
    }

    async getDetailedTeamMetrics(userId, direction) {
        const nodes = await prisma.node.findMany({
            where: {
                parentId: userId,
                direction,
                isDeleted: false
            },
            include: {
                package: {
                    include: {
                        package: true
                    }
                },
                rank: true,
                sponsored: {
                    where: {
                        status: 'ACTIVE'
                    }
                },
                children: {
                    where: {
                        status: 'ACTIVE'
                    }
                }
            }
        });

        const volume = await this._calculateTeamVolume(nodes);
        const activeRate = nodes.length > 0 ? 
            nodes.filter(n => n.status === 'ACTIVE').length / nodes.length : 0;

        return {
            totalNodes: nodes.length,
            activeNodes: nodes.filter(n => n.status === 'ACTIVE').length,
            volume,
            activeRate: activeRate * 100,
            avgPackageLevel: this._calculateAvgPackageLevel(nodes),
            powerNodes: this._identifyPowerNodes(nodes),
            growth: await this._calculateGrowthRate(nodes),
            depth: await this._calculateTeamDepth(userId, direction)
        };
    }

    async getCompressionOpportunities(userId) {
        const inactiveNodes = await prisma.node.findMany({
            where: {
                OR: [
                    { parentId: userId },
                    { sponsorId: userId }
                ],
                status: 'INACTIVE',
                isDeleted: false
            },
            include: {
                children: {
                    where: {
                        status: 'ACTIVE'
                    },
                    include: {
                        package: true
                    }
                }
            }
        });

        return inactiveNodes.map(node => ({
            nodeId: node.id,
            inactiveDuration: this._calculateInactiveDuration(node),
            activeChildren: node.children.length,
            compressionImpact: this._calculateCompressionImpact(node),
            recommendedAction: this._getCompressionRecommendation(node)
        }));
    }

    async getPowerTeamAnalysis(userId) {
        const team = await prisma.node.findMany({
            where: {
                OR: [
                    { parentId: userId },
                    { sponsorId: userId }
                ],
                isDeleted: false
            },
            include: {
                package: {
                    include: {
                        package: true
                    }
                },
                sponsored: {
                    where: {
                        status: 'ACTIVE'
                    }
                },
                children: {
                    where: {
                        status: 'ACTIVE'
                    }
                },
                commissions: {
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                        }
                    }
                }
            }
        });

        const powerMembers = team.filter(member => this._isPowerMember(member));
        const potentialPowerMembers = team.filter(member => this._isPotentialPowerMember(member));

        return {
            powerMembers: powerMembers.map(member => ({
                nodeId: member.id,
                metrics: this._calculatePowerMetrics(member),
                influence: this._calculateInfluenceScore(member),
                contribution: this._calculateContribution(member)
            })),
            potentialPowerMembers: potentialPowerMembers.map(member => ({
                nodeId: member.id,
                currentMetrics: this._calculatePowerMetrics(member),
                gap: this._calculatePowerGap(member),
                recommendations: this._getPowerMemberRecommendations(member)
            })),
            teamDynamics: this._analyzeTeamDynamics(team, powerMembers)
        };
    }

    _calculateTeamVolume(nodes) {
        return nodes.reduce((sum, node) => 
            sum + (node.package?.package?.price || 0) * 
            (1 + (node.children.length * 0.1)), 0);
    }

    _calculateAvgPackageLevel(nodes) {
        const levels = nodes.map(n => n.package?.package?.level || 0);
        return levels.length > 0 ? 
            levels.reduce((sum, level) => sum + level, 0) / levels.length : 0;
    }

    _identifyPowerNodes(nodes) {
        return nodes.filter(node => 
            node.status === 'ACTIVE' &&
            node.sponsored.length >= 5 &&
            node.children.length >= 2
        );
    }

    async _calculateGrowthRate(nodes) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const oldCount = nodes.filter(n => n.createdAt <= thirtyDaysAgo).length;
        const newCount = nodes.filter(n => n.createdAt > thirtyDaysAgo).length;
        
        return oldCount > 0 ? (newCount / oldCount) * 100 : 0;
    }

    async _calculateTeamDepth(userId, direction) {
        let depth = 0;
        let currentLevel = [userId];

        while (currentLevel.length > 0) {
            const nextLevel = await prisma.node.findMany({
                where: {
                    parentId: { in: currentLevel },
                    direction,
                    isDeleted: false
                },
                select: { id: true }
            });

            if (nextLevel.length === 0) break;
            depth++;
            currentLevel = nextLevel.map(n => n.id);
        }

        return depth;
    }

    _generateBalanceRecommendations(leftTeam, rightTeam) {
        const recommendations = [];
        const weaker = leftTeam.volume < rightTeam.volume ? 'left' : 'right';
        const volumeDiff = Math.abs(leftTeam.volume - rightTeam.volume);

        if (volumeDiff > 1000) {
            recommendations.push({
                type: 'CRITICAL',
                action: `Focus on strengthening ${weaker} leg`,
                impact: 'HIGH',
                details: `Volume difference of ${volumeDiff} needs attention`
            });
        }

        if (leftTeam.activeRate < 70 || rightTeam.activeRate < 70) {
            recommendations.push({
                type: 'ACTIVATION',
                action: 'Implement activation campaign',
                impact: 'MEDIUM',
                details: 'Increase active member percentage'
            });
        }

        return recommendations;
    }

    _calculateCompressionImpact(node) {
        return {
            volumeImpact: node.children.reduce((sum, child) => 
                sum + (child.package?.price || 0), 0),
            structureImpact: node.children.length,
            rankImpact: 'MEDIUM'
        };
    }

    _getCompressionRecommendation(node) {
        const impact = this._calculateCompressionImpact(node);
        
        if (impact.volumeImpact > 5000 || impact.structureImpact > 5) {
            return {
                action: 'COMPRESS',
                priority: 'HIGH',
                timing: 'IMMEDIATE'
            };
        }

        return {
            action: 'MONITOR',
            priority: 'MEDIUM',
            timing: 'NEXT_REVIEW'
        };
    }

    _isPowerMember(member) {
        return (
            member.sponsored.length >= 5 &&
            member.children.length >= 2 &&
            member.commissions.length >= 10 &&
            member.package?.package?.level >= 3
        );
    }

    _calculatePowerMetrics(member) {
        return {
            recruitment: member.sponsored.length,
            retention: member.sponsored.filter(s => s.status === 'ACTIVE').length / 
                      member.sponsored.length * 100,
            commission: member.commissions.reduce((sum, c) => sum + c.amount, 0),
            teamSize: member.children.length
        };
    }

    _calculateInfluenceScore(member) {
        const metrics = this._calculatePowerMetrics(member);
        return (
            (metrics.recruitment * 0.3) +
            (metrics.retention * 0.3) +
            (metrics.teamSize * 0.2) +
            ((member.package?.package?.level || 0) * 10 * 0.2)
        );
    }

    _calculateContribution(member) {
        return {
            volume: member.package?.package?.price || 0,
            teamVolume: member.children.reduce((sum, child) => 
                sum + (child.package?.package?.price || 0), 0)
        };
    }

    _calculatePowerGap(member) {
        const metrics = this._calculatePowerMetrics(member);
        return {
            recruitment: 5 - metrics.recruitment,
            retention: 80 - metrics.retention,
            commission: 1000 - metrics.commission,
            teamSize: 5 - metrics.teamSize
        };
    }

    _getPowerMemberRecommendations(member) {
        const gap = this._calculatePowerGap(member);
        const recommendations = [];

        if (gap.recruitment > 0) {
            recommendations.push({
                type: 'RECRUITMENT',
                action: 'Focus on recruiting new members',
                impact: 'HIGH',
                details: `Recruit ${gap.recruitment} more members`
            });
        }

        if (gap.retention > 0) {
            recommendations.push({
                type: 'RETENTION',
                action: 'Implement retention strategies',
                impact: 'MEDIUM',
                details: `Improve retention by ${gap.retention}%`
            });
        }

        if (gap.commission > 0) {
            recommendations.push({
                type: 'COMMISSION',
                action: 'Increase commission earnings',
                impact: 'HIGH',
                details: `Earn ${gap.commission} more in commissions`
            });
        }

        if (gap.teamSize > 0) {
            recommendations.push({
                type: 'TEAM_SIZE',
                action: 'Grow team size',
                impact: 'MEDIUM',
                details: `Grow team by ${gap.teamSize} members`
            });
        }

        return recommendations;
    }

    _analyzeTeamDynamics(team, powerMembers) {
        const teamSize = team.length;
        const powerMemberCount = powerMembers.length;
        const teamVolume = team.reduce((sum, member) => 
            sum + (member.package?.package?.price || 0), 0);

        return {
            teamSize,
            powerMemberCount,
            teamVolume,
            powerMemberPercentage: (powerMemberCount / teamSize) * 100,
            averageTeamVolume: teamVolume / teamSize
        };
    }
}

module.exports = new NodeChildrenService();
