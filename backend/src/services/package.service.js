const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PackageService {
    async findAll() {
        return prisma.package.findMany({
            include: {
                nodePackages: {
                    include: {
                        node: {
                            include: {
                                user: true
                            }
                        }
                    }
                },
                commissions: true
            }
        });
    }

    async findById(id) {
        return prisma.package.findUnique({
            where: { id },
            include: {
                nodePackages: {
                    include: {
                        node: {
                            include: {
                                user: true
                            }
                        }
                    }
                },
                commissions: true
            }
        });
    }

    async create(packageData) {
        return prisma.package.create({
            data: packageData
        });
    }

    async update(id, packageData) {
        return prisma.package.update({
            where: { id },
            data: packageData
        });
    }

    async delete(id) {
        return prisma.package.delete({
            where: { id }
        });
    }

    async assignToNode(nodeId, packageId) {
        return prisma.nodePackage.create({
            data: {
                nodeId,
                packageId,
                status: 'ACTIVE'
            },
            include: {
                node: {
                    include: {
                        user: true
                    }
                },
                package: true
            }
        });
    }

    async getNodePackages(nodeId) {
        return prisma.nodePackage.findMany({
            where: {
                nodeId
            },
            include: {
                package: true
            }
        });
    }

    async upgradePackage(nodeId, newPackageId) {
        return await prisma.$transaction(async (tx) => {
            const currentPackage = await tx.nodePackage.findFirst({
                where: {
                    nodeId,
                    status: 'ACTIVE'
                },
                include: {
                    package: true
                }
            });

            if (!currentPackage) {
                throw new Error('No active package found for this node');
            }

            const newPackage = await tx.package.findUnique({
                where: { id: newPackageId }
            });

            if (!newPackage) {
                throw new Error('New package not found');
            }

            if (newPackage.level <= currentPackage.package.level) {
                throw new Error('New package must be of a higher level');
            }

            await tx.nodePackage.update({
                where: { id: currentPackage.id },
                data: {
                    status: 'INACTIVE',
                    endDate: new Date()
                }
            });

            const upgradedPackage = await tx.nodePackage.create({
                data: {
                    nodeId,
                    packageId: newPackageId,
                    status: 'ACTIVE',
                    startDate: new Date(),
                    upgradedFrom: currentPackage.id
                },
                include: {
                    node: {
                        include: {
                            user: true
                        }
                    },
                    package: true
                }
            });

            await tx.packageUpgradeHistory.create({
                data: {
                    nodeId,
                    fromPackageId: currentPackage.packageId,
                    toPackageId: newPackageId,
                    upgradedAt: new Date()
                }
            });

            await tx.notification.create({
                data: {
                    userId: upgradedPackage.node.userId,
                    title: 'Package Upgraded',
                    message: `Your package has been upgraded from ${currentPackage.package.name} to ${newPackage.name}`,
                    type: 'PACKAGE_UPGRADE'
                }
            });

            return upgradedPackage;
        });
    }

    async manageSubscription(nodePackageId, action) {
        const validActions = ['RENEW', 'CANCEL', 'PAUSE', 'RESUME'];
        if (!validActions.includes(action)) {
            throw new Error('Invalid subscription action');
        }

        return await prisma.$transaction(async (tx) => {
            const nodePackage = await tx.nodePackage.findUnique({
                where: { id: nodePackageId },
                include: {
                    package: true,
                    node: {
                        include: {
                            user: true
                        }
                    }
                }
            });

            if (!nodePackage) {
                throw new Error('Node package not found');
            }

            let updateData = {};
            let notificationData = {};

            switch (action) {
                case 'RENEW':
                    const renewalDate = new Date();
                    renewalDate.setMonth(renewalDate.getMonth() + nodePackage.package.duration);
                    updateData = {
                        status: 'ACTIVE',
                        startDate: new Date(),
                        endDate: renewalDate,
                        renewalCount: {
                            increment: 1
                        }
                    };
                    notificationData = {
                        title: 'Package Renewed',
                        message: `Your ${nodePackage.package.name} package has been renewed for ${nodePackage.package.duration} months`
                    };
                    break;

                case 'CANCEL':
                    updateData = {
                        status: 'CANCELLED',
                        endDate: new Date()
                    };
                    notificationData = {
                        title: 'Package Cancelled',
                        message: `Your ${nodePackage.package.name} package subscription has been cancelled`
                    };
                    break;

                case 'PAUSE':
                    updateData = {
                        status: 'PAUSED',
                        pausedAt: new Date()
                    };
                    notificationData = {
                        title: 'Package Paused',
                        message: `Your ${nodePackage.package.name} package has been paused`
                    };
                    break;

                case 'RESUME':
                    if (nodePackage.status !== 'PAUSED') {
                        throw new Error('Can only resume paused packages');
                    }
                    const pauseDuration = nodePackage.pausedAt ? 
                        (new Date().getTime() - nodePackage.pausedAt.getTime()) : 0;
                    
                    updateData = {
                        status: 'ACTIVE',
                        pausedAt: null,
                        endDate: new Date(nodePackage.endDate.getTime() + pauseDuration)
                    };
                    notificationData = {
                        title: 'Package Resumed',
                        message: `Your ${nodePackage.package.name} package has been resumed`
                    };
                    break;
            }

            const updatedPackage = await tx.nodePackage.update({
                where: { id: nodePackageId },
                data: updateData,
                include: {
                    package: true,
                    node: {
                        include: {
                            user: true
                        }
                    }
                }
            });

            await tx.packageSubscriptionHistory.create({
                data: {
                    nodePackageId,
                    action,
                    performedAt: new Date(),
                    metadata: updateData
                }
            });

            await tx.notification.create({
                data: {
                    userId: nodePackage.node.userId,
                    type: 'PACKAGE_SUBSCRIPTION',
                    ...notificationData
                }
            });

            return updatedPackage;
        });
    }

    async trackBenefits(nodeId) {
        const activePackage = await prisma.nodePackage.findFirst({
            where: {
                nodeId,
                status: 'ACTIVE'
            },
            include: {
                package: true,
                node: {
                    include: {
                        user: true,
                        commissions: {
                            where: {
                                createdAt: {
                                    gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!activePackage) {
            throw new Error('No active package found');
        }

        const benefits = {
            package: {
                name: activePackage.package.name,
                level: activePackage.package.level,
                price: activePackage.package.price
            },
            status: activePackage.status,
            validity: {
                startDate: activePackage.startDate,
                endDate: activePackage.endDate,
                remainingDays: Math.ceil(
                    (activePackage.endDate - new Date()) / (1000 * 60 * 60 * 24)
                )
            },
            benefits: {
                maxDirectReferrals: activePackage.package.maxDirectReferrals,
                commissionRates: activePackage.package.commissionRates,
                bonusEligibility: activePackage.package.bonusEligibility
            },
            usage: {
                directReferrals: await prisma.node.count({
                    where: {
                        sponsorId: nodeId,
                        createdAt: {
                            gte: activePackage.startDate
                        }
                    }
                }),
                monthlyCommissions: activePackage.node.commissions.reduce(
                    (sum, commission) => sum + commission.amount, 0
                ),
                achievedBonuses: [] // To be implemented based on bonus structure
            }
        };

        return benefits;
    }

    async getUpgradeOptions(nodeId) {
        const currentPackage = await prisma.nodePackage.findFirst({
            where: {
                nodeId,
                status: 'ACTIVE'
            },
            include: {
                package: true
            }
        });

        if (!currentPackage) {
            throw new Error('No active package found');
        }

        const upgradeOptions = await prisma.package.findMany({
            where: {
                level: {
                    gt: currentPackage.package.level
                },
                isActive: true
            },
            orderBy: {
                level: 'asc'
            }
        });

        return {
            currentPackage: currentPackage.package,
            upgradeOptions: upgradeOptions.map(option => ({
                ...option,
                priceDifference: option.price - currentPackage.package.price,
                additionalBenefits: {
                    directReferralIncrease: option.maxDirectReferrals - currentPackage.package.maxDirectReferrals,
                    commissionRateIncrease: {
                        direct: option.commissionRates.direct - currentPackage.package.commissionRates.direct,
                        indirect: option.commissionRates.indirect - currentPackage.package.commissionRates.indirect
                    }
                }
            }))
        };
    }

    async adminFindAll() {
        return prisma.package.findMany({
            orderBy: {
                level: 'asc'
            }
        });
    }

    async adminFindById(id) {
        return prisma.package.findUnique({
            where: { id }
        });
    }

    async adminCreate(data) {
        return prisma.package.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                level: data.level,
                benefits: data.benefits || null,
                features: Array.isArray(data.features) ? JSON.stringify(data.features) : data.features,
                maxNodes: data.maxNodes || 1,
                duration: data.duration || 30,
                status: data.status || 'ACTIVE',
                imageUrl: data.imageUrl || null
            }
        });
    }

    async adminUpdate(id, data) {
        return prisma.package.update({
            where: { id: Number(id) },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.description && { description: data.description }),
                ...(data.price && { price: data.price }),
                ...(data.level && { level: data.level }),
                ...(data.benefits && { benefits: data.benefits }),
                ...(data.features && { features: Array.isArray(data.features) ? JSON.stringify(data.features) : data.features }),
                ...(data.maxNodes && { maxNodes: data.maxNodes }),
                ...(data.duration && { duration: data.duration }),
                ...(data.status && { status: data.status }),
                ...(data.imageUrl && { imageUrl: data.imageUrl }),
                updatedAt: new Date()
            }
        });
    }

    async adminToggleStatus(id) {
        const pkg = await this.adminFindById(id);
        return prisma.package.update({
            where: { id },
            data: {
                isActive: !pkg.isActive,
                updatedAt: new Date()
            }
        });
    }

    async adminGetStats() {
        const [
            totalCount,
            activeCount,
            packageStats
        ] = await prisma.$transaction([
            // Total packages count
            prisma.package.count(),
            
            // Active packages count
            prisma.package.count({
                where: { isActive: true }
            }),
            
            // Package usage and revenue stats
            prisma.nodePackage.groupBy({
                by: ['packageId'],
                _count: {
                    _all: true
                },
                _sum: {
                    price: true
                }
            })
        ]);

        // Get package details for each stat
        const packagesWithStats = await Promise.all(
            packageStats.map(async (stat) => {
                const pkg = await this.adminFindById(stat.packageId);
                return {
                    ...pkg,
                    userCount: stat._count._all,
                    totalRevenue: stat._sum.price
                };
            })
        );

        return {
            totalPackages: totalCount,
            activePackages: activeCount,
            packageStats: packagesWithStats,
            totalRevenue: packageStats.reduce((sum, stat) => sum + (stat._sum.price || 0), 0),
            totalUsers: packageStats.reduce((sum, stat) => sum + stat._count._all, 0)
        };
    }

    async adminDelete(id) {
        return prisma.package.delete({
            where: { id }
        });
    }
}

module.exports = new PackageService();
