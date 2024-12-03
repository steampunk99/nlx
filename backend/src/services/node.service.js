const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class NodeService {
    async findById(id) {
        return prisma.node.findUnique({
            where: { id },
            include: {
                user: true,
                sponsor: true,
                sponsored: true,
                parent: true,
                children: true,
                package: {
                    include: {
                        package: true
                    }
                },
                payments: true,
                statements: true,
                withdrawals: true
            }
        });
    }

    async findByUserId(userId) {
        return prisma.node.findUnique({
            where: { userId },
            include: {
                user: true,
                sponsor: true,
                sponsored: true,
                parent: true,
                children: true,
                package: {
                    include: {
                        package: true
                    }
                }
            }
        });
    }

    async create(nodeData) {
        return prisma.node.create({
            data: nodeData,
            include: {
                user: true,
                sponsor: true,
                parent: true
            }
        });
    }

    async update(id, nodeData) {
        return prisma.node.update({
            where: { id },
            data: nodeData,
            include: {
                user: true,
                sponsor: true,
                parent: true
            }
        });
    }

    async getDownline(id, levels = 1) {
        const node = await prisma.node.findUnique({
            where: { id },
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
                }
            }
        });

        if (!node) return null;

        if (levels === 1) {
            return node.sponsored;
        }

        const downline = [...node.sponsored];
        for (const sponsoredNode of node.sponsored) {
            const subDownline = await this.getDownline(sponsoredNode.id, levels - 1);
            if (subDownline) {
                downline.push(...subDownline);
            }
        }

        return downline;
    }

    async getBinaryTree(id) {
        return prisma.node.findUnique({
            where: { id },
            include: {
                children: {
                    include: {
                        user: true,
                        package: {
                            include: {
                                package: true
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
    }

    async findPlacementPosition(sponsorId) {
        const sponsor = await this.getBinaryTree(sponsorId);
        if (!sponsor) return null;

        const queue = [sponsor];
        while (queue.length > 0) {
            const current = queue.shift();
            const leftChild = current.children.find(child => child.position === 'LEFT');
            const rightChild = current.children.find(child => child.position === 'RIGHT');

            if (!leftChild) {
                return { parentId: current.id, position: 'LEFT' };
            }
            if (!rightChild) {
                return { parentId: current.id, position: 'RIGHT' };
            }

            queue.push(...current.children);
        }

        return null;
    }

    async optimizePlacement(sponsorId, newNodePackageLevel) {
        const sponsor = await this.getBinaryTree(sponsorId);
        if (!sponsor) throw new Error('Sponsor not found');

        const [leftVolume, rightVolume] = await Promise.all([
            this.calculateLegVolume(sponsor.id, 'LEFT'),
            this.calculateLegVolume(sponsor.id, 'RIGHT')
        ]);

        const weakerLeg = leftVolume.total <= rightVolume.total ? 'LEFT' : 'RIGHT';
        const strongerLeg = weakerLeg === 'LEFT' ? 'RIGHT' : 'LEFT';

        const optimalPosition = await this.findOptimalPosition(sponsor.id, weakerLeg, newNodePackageLevel);

        return {
            recommendedPlacement: {
                position: weakerLeg,
                parentId: optimalPosition.parentId
            },
            teamMetrics: {
                leftLeg: leftVolume,
                rightLeg: rightVolume
            },
            placementReason: `Placement in ${weakerLeg} leg optimizes team volume balance and network depth`
        };
    }

    async calculateLegVolume(nodeId, position) {
        const children = await prisma.node.findMany({
            where: {
                parentId: nodeId,
                position
            },
            include: {
                package: {
                    include: {
                        package: true
                    }
                },
                commissions: {
                    where: {
                        createdAt: {
                            gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
                        }
                    }
                }
            }
        });

        let total = 0;
        let activeCount = 0;
        let packageVolume = 0;

        for (const child of children) {
            if (child.package?.package?.price) {
                packageVolume += child.package.package.price;
            }

            const commissionVolume = child.commissions.reduce((sum, comm) => sum + comm.amount, 0);
            total += commissionVolume;

            if (commissionVolume > 0 || child.package?.status === 'ACTIVE') {
                activeCount++;
            }

            const childVolume = await this.calculateLegVolume(child.id, position);
            total += childVolume.total;
            activeCount += childVolume.activeCount;
            packageVolume += childVolume.packageVolume;
        }

        return {
            total,
            activeCount,
            packageVolume,
            averagePerMember: children.length > 0 ? total / children.length : 0
        };
    }

    async findOptimalPosition(rootId, position, newPackageLevel) {
        const getNodeScore = (node, depth) => {
            const packageLevel = node.package?.package?.level || 0;
            const activeBonus = node.package?.status === 'ACTIVE' ? 2 : 0;
            const depthPenalty = depth * 0.5;
            
            return packageLevel + activeBonus - depthPenalty;
        };

        const findBestPosition = async (nodeId, depth = 0) => {
            const node = await prisma.node.findUnique({
                where: { id: nodeId },
                include: {
                    children: {
                        where: { position },
                        include: {
                            package: {
                                include: {
                                    package: true
                                }
                            }
                        }
                    },
                    package: {
                        include: {
                            package: true
                        }
                    }
                }
            });

            if (!node) return null;

            const child = node.children[0];
            if (!child) {
                return {
                    parentId: node.id,
                    score: getNodeScore(node, depth)
                };
            }

            const childPosition = await findBestPosition(child.id, depth + 1);
            const currentPosition = {
                parentId: node.id,
                score: getNodeScore(node, depth)
            };

            return childPosition.score > currentPosition.score ? childPosition : currentPosition;
        };

        const optimalPosition = await findBestPosition(rootId);
        return optimalPosition || { parentId: rootId };
    }

    async rebalanceNetwork(nodeId) {
        return await prisma.$transaction(async (tx) => {
            const node = await this.getBinaryTree(nodeId);
            if (!node) throw new Error('Node not found');

            const [leftVolume, rightVolume] = await Promise.all([
                this.calculateLegVolume(node.id, 'LEFT'),
                this.calculateLegVolume(node.id, 'RIGHT')
            ]);

            const volumeDifference = Math.abs(leftVolume.total - rightVolume.total);
            const volumeRatio = Math.min(leftVolume.total, rightVolume.total) / 
                Math.max(leftVolume.total, rightVolume.total);

            if (volumeRatio >= 0.7) {
                return {
                    status: 'BALANCED',
                    metrics: {
                        leftVolume,
                        rightVolume,
                        volumeRatio
                    }
                };
            }

            const sourcePosition = leftVolume.total > rightVolume.total ? 'LEFT' : 'RIGHT';
            const targetPosition = sourcePosition === 'LEFT' ? 'RIGHT' : 'LEFT';

            const movableNodes = await this.findMovableNodes(node.id, sourcePosition, volumeDifference);
            if (!movableNodes.length) {
                return {
                    status: 'NO_SOLUTION',
                    metrics: {
                        leftVolume,
                        rightVolume,
                        volumeRatio
                    }
                };
            }

            const rebalancingOperations = [];
            for (const movableNode of movableNodes) {
                const newParent = await this.findOptimalPosition(node.id, targetPosition, 
                    movableNode.package?.package?.level || 0);

                rebalancingOperations.push({
                    nodeId: movableNode.id,
                    oldParentId: movableNode.parentId,
                    newParentId: newParent.parentId,
                    newPosition: targetPosition
                });
            }

            for (const operation of rebalancingOperations) {
                await tx.node.update({
                    where: { id: operation.nodeId },
                    data: {
                        parentId: operation.newParentId,
                        position: operation.newPosition
                    }
                });

                await tx.networkRebalancingHistory.create({
                    data: {
                        nodeId: operation.nodeId,
                        oldParentId: operation.oldParentId,
                        newParentId: operation.newParentId,
                        oldPosition: sourcePosition,
                        newPosition: targetPosition,
                        reason: 'VOLUME_IMBALANCE'
                    }
                });
            }

            const [newLeftVolume, newRightVolume] = await Promise.all([
                this.calculateLegVolume(node.id, 'LEFT'),
                this.calculateLegVolume(node.id, 'RIGHT')
            ]);

            return {
                status: 'REBALANCED',
                operations: rebalancingOperations,
                metrics: {
                    before: {
                        leftVolume,
                        rightVolume,
                        volumeRatio
                    },
                    after: {
                        leftVolume: newLeftVolume,
                        rightVolume: newRightVolume,
                        volumeRatio: Math.min(newLeftVolume.total, newRightVolume.total) / 
                            Math.max(newLeftVolume.total, newRightVolume.total)
                    }
                }
            };
        });
    }

    async findMovableNodes(rootId, position, targetVolume) {
        const nodes = await prisma.node.findMany({
            where: {
                parentId: rootId,
                position
            },
            include: {
                children: true,
                package: {
                    include: {
                        package: true
                    }
                },
                commissions: {
                    where: {
                        createdAt: {
                            gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
                        }
                    }
                }
            }
        });

        const movableNodes = [];
        let currentVolume = 0;

        const scoredNodes = nodes.map(node => ({
            node,
            mobilityScore: (node.children.length * 2) + 
                (node.commissions.reduce((sum, c) => sum + c.amount, 0) / 1000)
        })).sort((a, b) => a.mobilityScore - b.mobilityScore);

        for (const {node} of scoredNodes) {
            const nodeVolume = node.commissions.reduce((sum, c) => sum + c.amount, 0);
            if (currentVolume + nodeVolume <= targetVolume) {
                movableNodes.push(node);
                currentVolume += nodeVolume;
            }
            if (currentVolume >= targetVolume) break;
        }

        return movableNodes;
    }

    async findTernaryPosition(sponsorId) {
        try {
            // Get the sponsor's direct children
            const sponsorChildren = await prisma.node.findMany({
                where: { sponsorId },
                orderBy: {
                    position: 'asc'
                }
            });

            // Find the first available position
            const usedPositions = sponsorChildren.map(child => child.position);
            const positions = ['ONE', 'TWO', 'THREE'];
            for (const pos of positions) {
                if (!usedPositions.includes(pos)) {
                    return pos;
                }
            }

            // If sponsor already has 3 direct children, find the next available position
            // in the first incomplete node's downline
            const queue = [...sponsorChildren];
            while (queue.length > 0) {
                const current = queue.shift();
                
                const children = await prisma.node.findMany({
                    where: { sponsorId: current.id }
                });

                if (children.length < 3) {
                    // Found a node with less than 3 children
                    const usedChildPositions = children.map(child => child.position);
                    for (const pos of positions) {
                        if (!usedChildPositions.includes(pos)) {
                            return {
                                sponsorId: current.id,
                                position: pos
                            };
                        }
                    }
                }

                queue.push(...children);
            }

            throw new Error('No available positions found in the network');
        } catch (error) {
            console.error('Error finding ternary position:', error);
            throw error;
        }
    }

    async optimizeTernaryPlacement(sponsorId) {
        try {
            // If no sponsorId provided, return default position
            if (!sponsorId) {
                return {
                    recommendedPosition: 'ONE',
                    sponsorId: null,
                    reason: 'No sponsor provided'
                };
            }

            const sponsorNode = await prisma.node.findUnique({
                where: { id: sponsorId },
                include: {
                    children: true
                }
            });

            if (!sponsorNode) {
                return {
                    recommendedPosition: 'ONE',
                    sponsorId: null,
                    reason: 'Sponsor node not found'
                };
            }

            // Check direct placement under sponsor
            if (sponsorNode.children.length < 3) {
                const usedPositions = sponsorNode.children.map(child => child.position);
                const positions = ['ONE', 'TWO', 'THREE'];
                const availablePosition = positions.find(pos => !usedPositions.includes(pos));
                
                return {
                    recommendedPosition: availablePosition,
                    sponsorId: sponsorNode.id,
                    reason: 'Direct placement available'
                };
            }

            // If sponsor's positions are full, analyze the network
            const networkAnalysis = await this.analyzeNetwork(sponsorId);
            const { optimalNode, recommendedPosition } = networkAnalysis;

            return {
                recommendedPosition,
                sponsorId: optimalNode.id,
                reason: 'Optimal placement based on network analysis'
            };
        } catch (error) {
            console.error('Error optimizing ternary placement:', error);
            throw error;
        }
    }

    async analyzeNetwork(sponsorId) {
        // TO DO: implement network analysis logic
        // For now, just return a dummy result
        return {
            optimalNode: { id: sponsorId },
            recommendedPosition: 'ONE'
        };
    }
}

module.exports = new NodeService();
