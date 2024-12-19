const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class NodeChildrenService {
    async getDownline({ userId, level, status, startDate, endDate }) {
        const where = {
            sponsorId: userId
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

    async getTotalNetwork(nodeId) {
        const nodes = await prisma.node.findMany({
            where: {
                sponsorId: nodeId
            }
        });

        let total = nodes.length;
        
        // Recursively get counts for each child node
        for (const node of nodes) {
            total += await this.getTotalNetwork(node.id);
        }

        return total;
    }

    async getNetworkStats(userId) {
        try {
            // First get the user with their node
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { node: true }
            });

            console.log('Found user:', {
                userId,
                hasNode: !!user?.node,
                nodeId: user?.node?.id
            });

            if (!user) {
                throw new Error('User not found');
            }

            if (!user.node) {
                console.log('User has no node, creating one...');
                // Create a node if it doesn't exist
                const node = await prisma.node.create({
                    data: {
                        userId: user.id,
                        position: 'ONE',
                        status: 'ACTIVE',
                        level: 1
                    }
                });
                user.node = node;
                console.log('Created node:', node);
            }

            // Get direct referrals (users who have this user's node as sponsor)
            const directReferrals = await prisma.node.count({
                where: {
                    sponsorId: user.node.id,
                }
            });

            console.log('Direct referrals:', {
                sponsorId: user.node.id,
                count: directReferrals
            });

            // Get total team (all nodes in downline recursively)
            const totalTeam = await this.getTotalNetwork(user.node.id);

            console.log('Total team:', {
                sponsorId: user.node.id,
                count: totalTeam
            });

            // Get active members
            const activeMembers = await prisma.node.count({
                where: {
                    sponsorId: user.node.id,
                    status: 'ACTIVE'
                }
            });

            return {
                directReferrals,
                totalTeam,
                activeMembers
            };
        } catch (error) {
            console.error('Error getting network stats:', error);
            throw error;
        }
    }

    async getTeamStats(userId) {
        const [directReferrals, leftTeam, rightTeam] = await Promise.all([
            prisma.node.count({
                where: {
                    sponsorId: userId
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
                    direction
                }
            }),
            prisma.node.count({
                where: {
                    parentId: userId,
                    direction,
                    status: 'ACTIVE'
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
            ]
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

    async getGenealogyTree({ userId, depth = 5 }) {
        try {
            // Get the root user's node
            const rootNode = await prisma.node.findFirst({
                where: { userId },
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                }
            });

            if (!rootNode) {
                throw new Error('Node not found for user');
            }

            // Recursive function to get all children for a node
            async function getChildrenRecursive(nodeId, currentLevel, maxLevel) {
                if (currentLevel > maxLevel) return null;

                // Get up to 3 children for this node
                const children = await prisma.node.findMany({
                    where: { 
                        sponsorId: nodeId,
                        position: { in: ['ONE', 'TWO', 'THREE'] }
                    },
                    orderBy: {
                        position: 'asc'
                    },
                    take: 3,
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                });

                // Process each child recursively
                const processedChildren = await Promise.all(
                    children.map(async (child) => {
                        const childChildren = await getChildrenRecursive(
                            child.id,
                            currentLevel + 1,
                            maxLevel
                        );

                        return {
                            ...child,
                            children: childChildren || []
                        };
                    })
                );

                return processedChildren;
            }

            // Get all children recursively
            const allChildren = await getChildrenRecursive(rootNode.id, 1, depth);

            // Organize children by levels
            const levels = {};
            function organizeByLevels(nodes, level = 1) {
                if (!nodes || nodes.length === 0) return;
                
                levels[level] = levels[level] || [];
                levels[level].push(...nodes);

                // Process next level
                nodes.forEach(node => {
                    if (node.children && node.children.length > 0) {
                        organizeByLevels(node.children, level + 1);
                    }
                });
            }

            organizeByLevels(allChildren);

            // Log the structure for debugging
            console.log('Network structure:', {
                totalLevels: Object.keys(levels).length,
                nodesPerLevel: Object.entries(levels).map(([level, nodes]) => ({
                    level,
                    count: nodes.length
                }))
            });

            return {
                id: rootNode.id,
                user: rootNode.user,
                status: rootNode.status,
                children: levels
            };
        } catch (error) {
            console.error('Error getting genealogy tree:', error);
            throw error;
        }
    }

    async getDirectReferrals({ userId, status, startDate, endDate, page = 1, limit = 10 }) {
        try {
            // First get the user with their node
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { node: true }
            });

            console.log('Found user:', {
                userId,
                hasNode: !!user?.node,
                nodeId: user?.node?.id
            });

            if (!user) {
                throw new Error('User not found');
            }

            if (!user.node) {
                console.log('User has no node, creating one...');
                // Create a node if it doesn't exist
                const node = await prisma.node.create({
                    data: {
                        userId: user.id,
                        position: 'ONE',
                        status: 'ACTIVE',
                        level: 1
                    }
                });
                user.node = node;
                console.log('Created node:', node);
            }

            // Build where clause for referrals
            const where = {
                sponsorId: user.node.id
            };

            if (status) where.status = status;
            if (startDate) where.createdAt = { gte: new Date(startDate) };
            if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };

            console.log('Searching for referrals with:', where);

            // Get total count and referrals
            const [total, referrals] = await Promise.all([
                prisma.node.count({ where }),
                prisma.node.findMany({
                    where,
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true,
                                status: true,
                                createdAt: true
                            }
                        }
                    },
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: {
                        createdAt: 'desc'
                    }
                })
            ]);

            console.log('Found referrals:', {
                sponsorId: user.node.id,
                total,
                referrals: referrals.length,
                referralDetails: referrals.map(ref => ({
                    nodeId: ref.id,
                    userId: ref.userId,
                    email: ref.user.email
                }))
            });

            return {
                data: referrals,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error getting direct referrals:', error);
            throw error;
        }
    }

    async getBusinessVolume({ userId, startDate, endDate }) {
        const where = {
            OR: [
                { parentId: userId },
                { sponsorId: userId }
            ]
        };

        if (startDate) where.createdAt = { gte: startDate };
        if (endDate) where.createdAt = { ...where.createdAt, lte: endDate };

        const [personalVolume, groupVolume] = await Promise.all([
            prisma.transaction.aggregate({
                where: {
                    userId,
                    type: 'PURCHASE'
                },
                _sum: {
                    amount: true
                }
            }),
            prisma.transaction.aggregate({
                where: {
                    node: {
                        OR: [
                            { parentId: userId },
                            { sponsorId: userId }
                        ]
                    },
                    type: 'PURCHASE'
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
                    [structure === 'binary' ? 'parentId' : 'sponsorId']: nodeId
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
            ]
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
                direction
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
                status: 'INACTIVE'
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
                ]
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
                    direction
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

    async getNetworkLevels(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { node: true }
            });

            if (!user?.node) {
                return [];
            }

            // Get direct referrals (level 1)
            const directReferrals = await prisma.node.findMany({
                where: { sponsorId: user.node.id },
                include: { user: true,
                    statements: {
                        where: {
                            type: {
                                in: 'COMMISSIONS'
                            }
                        }
                    }
                 }
            });

            const levelsMap = new Map();

            // Add level 1 (direct referrals)
            if (directReferrals.length > 0) {
                levelsMap.set(1, {
                    level: 1,
                    members: directReferrals.length,
                    active: directReferrals.filter(n => n.status === 'ACTIVE').length,
                    commissionss: 0
                });
            }

            // For each direct referral, get their referrals (level 2)
            for (const referral of directReferrals) {
                const level2Referrals = await prisma.node.findMany({
                    where: { sponsorId: referral.id },
                    include: { user: true,
                        statements: {
                            where: {
                                status: {
                                    in: ['PENDING', 'PROCESSED']
                                },
                                
                            },
                            select: {
                                amount: true
                            }
                        }
                     }
                });

                if (level2Referrals.length > 0) {
                    const level2Commissions = level2Referrals.reduce((sum, node) => {
                        return sum + node.statements.reduce((sum, stmt) => {
                            return sum + Number(stmt.amount || 0);
                        }, 0);
                    }, 0);
                    const currentLevel = levelsMap.get(2) || {
                        level: 2,
                        members: 0,
                        active: 0,
                        commissionss:0
                    };

                    currentLevel.members += level2Referrals.length;
                    currentLevel.active += level2Referrals.filter(n => n.status === 'ACTIVE').length;
                    currentLevel.commissionss =level2Commissions
                    levelsMap.set(2, currentLevel);
                }
            }

            // Convert map to array and sort by level
            return Array.from(levelsMap.values()).sort((a, b) => a.level - b.level);
        } catch (error) {
            console.error('Error getting network levels:', error);
            throw error;
        }
    }

    async getNodesAtLevel(sponsorId, level) {
        const nodes = await prisma.node.findMany({
            where: { sponsorId }
        });

        let allNodes = [...nodes];

        // Recursively get nodes for next level
        for (const node of nodes) {
            const childNodes = await this.getNodesAtLevel(node.id, level + 1);
            allNodes = allNodes.concat(childNodes);
        }

        return allNodes;
    }

    async fixNodeRelationships() {
        try {
            // Get the referral link to find the relationship
            const referralLink = await prisma.referralLink.findFirst({
                where: { code: '9ba11114' },
                include: {
                    user: {
                        include: { node: true }
                    }
                }
            });

            if (!referralLink) {
                throw new Error('Referral link not found');
            }

            // Update node 2 to have node 1 as sponsor
            await prisma.node.update({
                where: { id: 2 }, // User 2's node
                data: {
                    sponsorId: 1, // User 1's node
                    level: 2 // Level 2 since it's under node 1
                }
            });

            return true;
        } catch (error) {
            console.error('Error fixing node relationships:', error);
            throw error;
        }
    }

    async fixAllNodeRelationships() {
        try {
            // Fix Node 2's relationship (already correct but included for completeness)
            await prisma.node.update({
                where: { id: 2 },
                data: {
                    sponsorId: 1,
                    level: 2
                }
            });

            // Fix Node 3's relationship
            await prisma.node.update({
                where: { id: 3 },
                data: {
                    sponsorId: 2,
                    level: 3
                }
            });

            return true;
        } catch (error) {
            console.error('Error fixing node relationships:', error);
            throw error;
        }
    }

    async getGenealogy({ userId, maxLevel }) {
        return this.getGenealogyTree({ userId, depth: maxLevel });
    }
}

module.exports = new NodeChildrenService();
