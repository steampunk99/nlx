const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { addDays } = require('date-fns');

class NodePackageService {
    async findAll() {
        return prisma.nodePackage.findMany({
            include: {
                node: {
                    include: {
                        user: true
                    }
                },
                package: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async findById(id) {
        return prisma.nodePackage.findUnique({
            where: { id },
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

    async findByNodeId(nodeId) {
        return prisma.nodePackage.findUnique({
            where: { nodeId },
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

    async create(nodePackageData, tx = prisma) {
        const pkg = await tx.package.findUnique({
            where: { id: nodePackageData.packageId }
        });

        if (!pkg) {
            throw new Error('Package not found');
        }

        const now = new Date();
        const existingPackage = await tx.nodePackage.findFirst({
            where: { nodeId: nodePackageData.nodeId }
        });

        if (existingPackage) {
            // If exists, update it instead of creating new
            return tx.nodePackage.update({
                where: { id: existingPackage.id },
                data: {
                    ...nodePackageData,
                    activatedAt: now,
                    expiresAt: addDays(now, pkg.duration),
                    updatedAt: new Date()
                }
            });
        }

        // If no existing package, create new one
        return tx.nodePackage.create({
            data: {
                ...nodePackageData,
                activatedAt: now,
                expiresAt: addDays(now, pkg.duration)
            }
        });
    }

    async update(id, nodePackageData) {
        return prisma.nodePackage.update({
            where: { id },
            data: nodePackageData,
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

    async updateStatus(id, status, tx = prisma) {
        return tx.nodePackage.update({
            where: { id },
            data: { status },
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

    async delete(id) {
        return prisma.nodePackage.delete({
            where: { id }
        });
    }

    async checkExpiredPackages() {
        const now = new Date();
        const expiredPackages = await prisma.nodePackage.findMany({
            where: {
                status: 'ACTIVE',
                expiresAt: {
                    lt: now
                }
            },
            include: {
                node: {
                    include: {
                        user: true
                    }
                }
            }
        });

        for (const nodePackage of expiredPackages) {
            await prisma.$transaction(async (tx) => {
                // Update package status to EXPIRED
                await this.updateStatus(nodePackage.id, 'EXPIRED', tx);

                // Update node status if needed
                await tx.node.update({
                    where: { id: nodePackage.nodeId },
                    data: { status: 'INACTIVE' }
                });

                // Create notification for user
                await tx.notification.create({
                    data: {
                        userId: nodePackage.node.user.id,
                        title: 'Package Expired',
                        message: `Your package has expired. Please purchase a new package to continue enjoying our services.`,
                        type: 'PACKAGE_EXPIRED',
                        status: 'UNREAD'
                    }
                });
            });
        }

        return expiredPackages;
    }

    async findActivePackagesByNodeId(nodeId) {
        return prisma.nodePackage.findMany({
            where: {
                nodeId,
                status: 'ACTIVE'
            },
            include: {
                package: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async findByPackageId(packageId) {
        return prisma.nodePackage.findMany({
            where: { packageId },
            include: {
                node: {
                    include: {
                        user: true
                    }
                },
                package: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async findUpgradeHistory(nodeId) {
        return prisma.nodePackage.findMany({
            where: {
                nodeId,
                isUpgrade: true
            },
            include: {
                package: true,
                previousPackage: {
                    include: {
                        package: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async createUpgrade(nodeId, packageId, previousPackageId, paymentData) {
        // First deactivate the previous package
        await prisma.nodePackage.update({
            where: { id: previousPackageId },
            data: { status: 'UPGRADED' }
        });

        // Create new package record as upgrade
        return prisma.nodePackage.create({
            data: {
                nodeId,
                packageId,
                status: 'PENDING',
                isUpgrade: true,
                previousPackageId,
                paymentMethod: paymentData.paymentMethod,
                paymentPhone: paymentData.phone
            },
            include: {
                node: {
                    include: {
                        user: true
                    }
                },
                package: true,
                previousPackage: {
                    include: {
                        package: true
                    }
                }
            }
        });
    }

    async updateStatus(nodePackageId, status, tx = prisma) {
        return tx.nodePackage.update({
          where: { id: nodePackageId },
          data: {
            status,
            updatedAt: new Date()
          },
          include: {
            node: true,
            package: true
          }
        });
    }
}

module.exports = new NodePackageService();
