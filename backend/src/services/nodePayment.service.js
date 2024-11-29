const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const UgandaMobileMoneyUtil = require('../utils/ugandaMobileMoneyUtil');

class NodePaymentService {
    constructor() {
        this.mobileMoneyUtil = new UgandaMobileMoneyUtil();
    }

    async findAll(nodeId, { startDate, endDate, type } = {}) {
        const where = {};

        if (nodeId) {
            where.nodeId = nodeId;
        }

        if (startDate && endDate) {
            where.createdAt = {
                gte: startDate,
                lte: endDate
            };
        }

        if (type) {
            where.type = type;
        }

        return prisma.nodePayment.findMany({
            where,
            include: {
                node: {
                    include: {
                        user: true
                    }
                },
                package: true,
                previousPackage: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async findById(id) {
        return prisma.nodePayment.findUnique({
            where: { id },
            include: {
                node: {
                    include: {
                        user: true
                    }
                },
                package: true,
                previousPackage: true
            }
        });
    }

    async findByNodeId(nodeId) {
        return prisma.nodePayment.findMany({
            where: {
                nodeId
            },
            include: {
                node: {
                    include: {
                        user: true
                    }
                },
                package: true,
                previousPackage: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async create(paymentData, tx = prisma) {
        return tx.nodePayment.create({
            data: {
                ...paymentData,
                createdAt: new Date()
            },
            include: {
                node: {
                    include: {
                        user: true
                    }
                },
                package: true,
                previousPackage: true
            }
        });
    }

    async update(id, paymentData, tx = prisma) {
        return tx.nodePayment.update({
            where: { id },
            data: paymentData,
            include: {
                node: {
                    include: {
                        user: true
                    }
                },
                package: true,
                previousPackage: true
            }
        });
    }

    async updateStatus(id, status, reason = null, tx = prisma) {
        const data = {
            status,
            ...(reason && { reason }),
            processedAt: new Date()
        };

        return tx.nodePayment.update({
            where: { id },
            data,
            include: {
                node: {
                    include: {
                        user: true
                    }
                },
                package: true,
                previousPackage: true
            }
        });
    }

    async getTotalPayments(nodeId, { startDate, endDate, type } = {}) {
        const where = {
            nodeId,
            status: 'COMPLETED'
        };

        if (startDate && endDate) {
            where.createdAt = {
                gte: startDate,
                lte: endDate
            };
        }

        if (type) {
            where.type = type;
        }

        const result = await prisma.nodePayment.aggregate({
            where,
            _sum: {
                amount: true
            }
        });
        return result._sum.amount || 0;
    }

    async getPaymentStats(nodeId) {
        const [pending, completed, failed] = await Promise.all([
            prisma.nodePayment.aggregate({
                where: {
                    nodeId,
                    status: 'PENDING'
                },
                _count: true,
                _sum: {
                    amount: true
                }
            }),
            prisma.nodePayment.aggregate({
                where: {
                    nodeId,
                    status: 'COMPLETED'
                },
                _count: true,
                _sum: {
                    amount: true
                }
            }),
            prisma.nodePayment.aggregate({
                where: {
                    nodeId,
                    status: 'FAILED'
                },
                _count: true,
                _sum: {
                    amount: true
                }
            })
        ]);

        return {
            pending: {
                count: pending._count,
                amount: pending._sum.amount || 0
            },
            completed: {
                count: completed._count,
                amount: completed._sum.amount || 0
            },
            failed: {
                count: failed._count,
                amount: failed._sum.amount || 0
            }
        };
    }

    async findPendingPayments(nodeId) {
        return prisma.nodePayment.findMany({
            where: {
                nodeId,
                status: 'PENDING'
            },
            include: {
                node: {
                    include: {
                        user: true
                    }
                },
                package: true,
                previousPackage: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
    }

    /**
     * Detect mobile money provider from phone number
     */
    detectProvider(phoneNumber) {
        // Remove any non-digit characters and ensure number starts with 256
        const cleaned = phoneNumber.replace(/\D/g, '').replace(/^0/, '256');
        
        // MTN Uganda prefixes
        const mtnPrefixes = ['25677', '25678', '25676'];
        // Airtel Uganda prefixes
        const airtelPrefixes = ['25675', '25670', '25674'];
        
        if (mtnPrefixes.some(prefix => cleaned.startsWith(prefix))) {
            return 'mtn';
        }
        if (airtelPrefixes.some(prefix => cleaned.startsWith(prefix))) {
            return 'airtel';
        }
        throw new Error('Unsupported mobile money provider');
    }

    /**
     * Initiate mobile money payment
     */
    async initiateMobilePayment(nodeId, amount, phoneNumber, packageId = null) {
        return await prisma.$transaction(async (tx) => {
            const provider = this.detectProvider(phoneNumber);
            
            // Create payment record
            const payment = await this.create({
                nodeId,
                amount,
                type: 'MOBILE_MONEY',
                status: 'PENDING',
                packageId,
                paymentMethod: provider.toUpperCase(),
                paymentPhone: phoneNumber
            }, tx);

            try {
                // Initialize provider-specific mobile money util
                this.mobileMoneyUtil = new UgandaMobileMoneyUtil(provider);
                
                // Initiate mobile money payment based on provider
                const response = provider === 'mtn' 
                    ? await this.mobileMoneyUtil.initiateMtnPayment(
                        phoneNumber,
                        amount,
                        `PKG${packageId || 'GEN'}`
                    )
                    : await this.mobileMoneyUtil.initiateAirtelPayment(
                        phoneNumber,
                        amount,
                        `PKG${packageId || 'GEN'}`
                    );

                if (!response.success) {
                    throw new Error(response.error);
                }

                // Update payment with reference ID
                await this.update(payment.id, {
                    reference: response.data.referenceId,
                    status: 'PROCESSING'
                }, tx);

                return {
                    success: true,
                    paymentId: payment.id,
                    referenceId: response.data.referenceId,
                    provider
                };
            } catch (error) {
                // Update payment status to failed
                await this.updateStatus(payment.id, 'FAILED', error.message, tx);
                throw error;
            }
        });
    }

    /**
     * Process mobile money callback
     */
    async processMobileMoneyCallback(callbackData, provider) {
        const result = this.mobileMoneyUtil.processCallback(callbackData, provider);

        if (!result.success) {
            return {
                success: false,
                error: result.reason || result.message
            };
        }

        // Find payment by reference ID
        const payment = await prisma.nodePayment.findFirst({
            where: {
                reference: result.transactionId
            }
        });

        if (!payment) {
            return {
                success: false,
                error: 'Payment not found'
            };
        }

        return await prisma.$transaction(async (tx) => {
            // Update payment status
            const updatedPayment = await this.updateStatus(
                payment.id,
                'COMPLETED',
                null,
                tx
            );

            // If this is a package payment, activate the package
            if (payment.packageId) {
                await tx.nodePackage.update({
                    where: { id: payment.packageId },
                    data: { status: 'ACTIVE' }
                });
            }

            // Create transaction record
            await tx.nodeStatement.create({
                data: {
                    nodeId: payment.nodeId,
                    amount: payment.amount,
                    type: 'PAYMENT',
                    description: `${provider.toUpperCase()} Mobile Money Payment - ${result.transactionId}`,
                    reference: result.transactionId
                }
            });

            return {
                success: true,
                payment: updatedPayment,
                transactionId: result.transactionId
            };
        });
    }

    /**
     * Query payment status
     */
    async queryPaymentStatus(paymentId) {
        const payment = await this.findById(paymentId);
        if (!payment || !payment.reference) {
            throw new Error('Payment not found or invalid');
        }

        const provider = payment.paymentMethod.toLowerCase();
        this.mobileMoneyUtil = new UgandaMobileMoneyUtil(provider);

        const response = provider === 'mtn'
            ? await this.mobileMoneyUtil.queryMtnTransaction(payment.reference)
            : await this.mobileMoneyUtil.queryAirtelTransaction(payment.reference);
        
        if (!response.success) {
            return {
                success: false,
                error: response.error
            };
        }

        let status;
        if (provider === 'mtn') {
            status = response.data.status === 'SUCCESSFUL' ? 'COMPLETED'
                : response.data.status === 'FAILED' ? 'FAILED'
                : 'PROCESSING';
        } else {
            status = response.data.status === 'SUCCESS' ? 'COMPLETED'
                : response.data.status === 'FAILED' ? 'FAILED'
                : 'PROCESSING';
        }

        if (status !== payment.status) {
            await this.updateStatus(
                payment.id,
                status,
                response.data.reason || response.data.message
            );
        }

        return {
            success: true,
            status,
            description: response.data.reason || response.data.message
        };
    }
}

module.exports = new NodePaymentService();
