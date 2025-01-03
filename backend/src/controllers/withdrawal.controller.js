const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const withdrawalService = require('../services/nodeWithdrawal.service');
const notificationService = require('../services/notification.service');
const ugandaMobileMoneyUtil = require('../utils/ugandaMobileMoneyUtil');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class WithdrawalController {
    /**
     * Request a new withdrawal
     */
    requestWithdrawal = catchAsync(async (req, res) => {
        const { amount, phone } = req.body;
        const userId = req.user.id;

        console.log(`Received withdrawal request: Amount: ${amount}, Phone: ${phone}, User ID: ${userId}`);

        // Check for existing pending withdrawals
        const pendingWithdrawals = await prisma.withdrawal.findMany({
            where: {
                userId,
                status: {
                    in: ['PENDING', 'PROCESSING']
                }
            }
        });

        if (pendingWithdrawals.length > 0) {
            console.warn(`User ${userId} has pending withdrawals:`, pendingWithdrawals);
            throw new AppError('You have pending withdrawals. Please wait for them to complete.', 400);
        }

        const result = await prisma.$transaction(async (tx) => {
            // Get user with node
            const user = await tx.user.findUnique({
                where: { id: userId },
                include: {
                    node: true
                }
            });

            if (!user?.node) {
                console.error(`User or node not found for User ID: ${userId}`);
                throw new AppError('User or node not found', 404);
            }

            console.log(`Processing withdrawal for user:`, user);

            // Check available balance
            if (user.node.availableBalance < amount) {
                console.error(`Insufficient balance for User ID: ${userId}. Available: ${user.node.availableBalance}, Requested: ${amount}`);
                throw new AppError('Insufficient balance', 400);
            }

            // Generate transaction ID
            const trans_id = `WTH${Date.now()}${Math.random().toString(36).substr(2, 4)}`;
            console.log(`Generated Transaction ID: ${trans_id}`);

            // Create withdrawal records with initial PENDING status
            const [withdrawal, nodeWithdrawal] = await Promise.all([
                // Create user withdrawal record
                tx.withdrawal.create({
                    data: {
                        userId: userId,
                        amount: amount,
                        status: 'PENDING',
                        method: 'MOBILE MONEY',
                        transactionId: trans_id,
                        details: {
                            phone,
                            trans_id,
                            amount,
                            user: user.id,
                            attempts: 0
                        }
                    },
                    include: {
                        user: true
                    }
                }),

                // Create node withdrawal record
                tx.nodeWithdrawal.create({
                    data: {
                        nodeId: user.node.id,
                        amount: amount,
                        status: 'PENDING',
                        transactionId: trans_id,
                        paymentPhone: phone,
                        paymentType: 'MOBILE MONEY',
                        reason: 'Commission withdrawal',
                        withdrawalDate: new Date()
                    }
                })
            ]);

            console.log(`Withdrawal records created: User Withdrawal ID: ${withdrawal.id}, Node Withdrawal ID: ${nodeWithdrawal.id}`);

            // Create node statement
            await tx.nodeStatement.create({
                data: {
                    nodeId: user.node.id,
                    amount: amount,
                    type: 'DEBIT',
                    status: 'PENDING',
                    description: `Withdrawal request #${withdrawal.id}`,
                    referenceType: 'WITHDRAWAL',
                    referenceId: withdrawal.id
                }
            });

            // Update to PROCESSING before mobile money request
            await Promise.all([
                tx.withdrawal.update({
                    where: { id: withdrawal.id },
                    data: {
                        status: 'PROCESSING',
                        details: {
                            ...withdrawal.details,
                            attempts: 1,
                            lastAttempt: new Date()
                        }
                    }
                }),
                tx.nodeWithdrawal.update({
                    where: { id: nodeWithdrawal.id },
                    data: { status: 'PROCESSING' }
                })
            ]);

            try {
                // Process withdrawal using Script Networks
                const scriptNetworksResponse = await ugandaMobileMoneyUtil.requestWithdrawal({
                    amount,
                    phone,
                    trans_id,
                    reason: 'Commission withdrawal'
                });

                console.log(`Script Networks Response:`, scriptNetworksResponse);

                // Update records based on Script Networks response
                if (scriptNetworksResponse.success) {
                    // Update withdrawal statuses to COMPLETED
                    await Promise.all([
                        tx.withdrawal.update({
                            where: { id: withdrawal.id },
                            data: {
                                status: 'COMPLETED',
                                completedAt: new Date(),
                                details: {
                                    ...withdrawal.details,
                                    scriptNetworksResponse: scriptNetworksResponse.data,
                                    completedAt: new Date()
                                }
                            }
                        }),
                        tx.nodeWithdrawal.update({
                            where: { id: nodeWithdrawal.id },
                            data: { 
                                status: 'COMPLETED',
                                completedAt: new Date()
                            }
                        }),
                        tx.nodeStatement.updateMany({
                            where: {
                                referenceType: 'WITHDRAWAL',
                                referenceId: withdrawal.id
                            },
                            data: { 
                                status: 'COMPLETED',
                                completedAt: new Date()
                            }
                        }),
                        // Update node's available balance
                        tx.node.update({
                            where: { id: user.node.id },
                            data: {
                                availableBalance: {
                                    decrement: withdrawal.amount
                                },
                                updatedAt: new Date()
                            }
                        })
                    ]);
                } else {
                    // Update records to FAILED status
                    const failureReason = scriptNetworksResponse.message || 'Mobile money transfer failed';
                    await Promise.all([
                        tx.withdrawal.update({
                            where: { id: withdrawal.id },
                            data: {
                                status: 'FAILED',
                                details: {
                                    ...withdrawal.details,
                                    scriptNetworksResponse: scriptNetworksResponse.data,
                                    failureReason,
                                    failedAt: new Date()
                                }
                            }
                        }),
                        tx.nodeWithdrawal.update({
                            where: { id: nodeWithdrawal.id },
                            data: { 
                                status: 'FAILED',
                                reason: failureReason
                            }
                        }),
                        tx.nodeStatement.updateMany({
                            where: {
                                referenceType: 'WITHDRAWAL',
                                referenceId: withdrawal.id
                            },
                            data: { 
                                status: 'FAILED',
                                description: `${withdrawal.description} - Failed: ${failureReason}`
                            }
                        })
                    ]);
                }

                return { withdrawal, scriptNetworksResponse };
            } catch (error) {
                // Handle unexpected errors during mobile money processing
                const errorMessage = 'Unexpected error during withdrawal processing';
                await Promise.all([
                    tx.withdrawal.update({
                        where: { id: withdrawal.id },
                        data: {
                            status: 'FAILED',
                            details: {
                                ...withdrawal.details,
                                error: error.message,
                                failureReason: errorMessage,
                                failedAt: new Date()
                            }
                        }
                    }),
                    tx.nodeWithdrawal.update({
                        where: { id: nodeWithdrawal.id },
                        data: { 
                            status: 'FAILED',
                            reason: errorMessage
                        }
                    }),
                    tx.nodeStatement.updateMany({
                        where: {
                            referenceType: 'WITHDRAWAL',
                            referenceId: withdrawal.id
                        },
                        data: { 
                            status: 'FAILED',
                            description: `${withdrawal.description} - Failed: ${errorMessage}`
                        }
                    })
                ]);
                throw error;
            }
        });

        // Create notification after transaction
        await notificationService.createWithdrawalNotification(
            userId,
            result.withdrawal.id,
            result.scriptNetworksResponse.success ? 'COMPLETED' : 'FAILED',
            amount
        );

        res.status(201).json({
            success: true,
            message: result.scriptNetworksResponse.success 
                ? 'Withdrawal processed successfully' 
                : 'Withdrawal failed',
            data: result.withdrawal
        });
    });

    /**
     * Get user's withdrawal history with detailed status tracking
     */
    getWithdrawalHistory = catchAsync(async (req, res) => {
        const userId = req.user.id;
        const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { node: true }
        });

        if (!user?.node) {
            throw new AppError('User not found', 404);
        }

        // Get both user withdrawals and node withdrawals with pagination
        const [withdrawals, nodeWithdrawals, total] = await Promise.all([
            prisma.withdrawal.findMany({
                where: {
                    userId,
                    ...(status && { status }),
                    ...(startDate && endDate && {
                        createdAt: {
                            gte: new Date(startDate),
                            lte: new Date(endDate)
                        }
                    })
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    user: {
                        select: {
                            username: true,
                            email: true
                        }
                    }
                }
            }),
            prisma.nodeWithdrawal.findMany({
                where: {
                    nodeId: user.node.id,
                    ...(status && { status }),
                    ...(startDate && endDate && {
                        createdAt: {
                            gte: new Date(startDate),
                            lte: new Date(endDate)
                        }
                    })
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.withdrawal.count({
                where: {
                    userId,
                    ...(status && { status }),
                    ...(startDate && endDate && {
                        createdAt: {
                            gte: new Date(startDate),
                            lte: new Date(endDate)
                        }
                    })
                }
            })
        ]);

        // Get withdrawal statistics
        const stats = await prisma.withdrawal.groupBy({
            by: ['status'],
            where: { userId },
            _count: true,
            _sum: {
                amount: true
            }
        });

        res.json({
            success: true,
            data: {
                withdrawals: withdrawals.map(w => ({
                    ...w,
                    phone: w.details?.phone,
                    failureReason: w.details?.failureReason,
                    attempts: w.details?.attempts
                })),
                stats: stats.reduce((acc, stat) => ({
                    ...acc,
                    [stat.status.toLowerCase()]: {
                        count: stat._count,
                        amount: stat._sum.amount
                    }
                }), {}),
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            }
        });
    });

    /**
     * Cancel a pending withdrawal request
     * @param {Request} req 
     * @param {Response} res 
     */
     async cancelWithdrawal(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const withdrawal = await withdrawalService.findById(id);
            if (!withdrawal || withdrawal.userId !== userId) {
                return res.status(404).json({
                    success: false,
                    message: 'Pending withdrawal not found'
                });
            }

            if (withdrawal.status !== 'PENDING') {
                return res.status(400).json({
                    success: false,
                    message: 'Only pending withdrawals can be cancelled'
                });
            }

            const cancelledWithdrawal = await withdrawalService.update(id, {
                status: 'CANCELLED',
                remarks: 'Cancelled by user'
            });

            await notificationService.createWithdrawalNotification(
                userId,
                id,
                'CANCELLED',
                withdrawal.amount
            );

            res.json({
                success: true,
                message: 'Withdrawal cancelled successfully'
            });
        } catch (error) {
            console.error('Cancel withdrawal error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Process withdrawal request (Admin only)
     * @param {Request} req 
     * @param {Response} res 
     */
    async processWithdrawal(req, res) {
        try {
            const { id } = req.params;
            const { status, remarks, transaction_hash } = req.body;

            // Only admin can update withdrawal status
            if (!req.user.isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized'
                });
            }

            const withdrawal = await withdrawalService.findById(id);
            if (!withdrawal) {
                return res.status(404).json({
                    success: false,
                    message: 'Withdrawal not found or already processed'
                });
            }

            const updatedWithdrawal = await withdrawalService.update(id, {
                status,
                remarks,
                processedAt: status === 'COMPLETED' ? new Date() : null,
                processedBy: req.user.id,
                transactionHash: transaction_hash
            });

            await notificationService.createWithdrawalNotification(
                withdrawal.userId,
                withdrawal.id,
                status,
                withdrawal.amount
            );

            res.json({
                success: true,
                message: `Withdrawal ${status} successfully`,
                data: updatedWithdrawal
            });
        } catch (error) {
            console.error('Process withdrawal error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get all withdrawals (Admin only)
     * @param {Request} req 
     * @param {Response} res 
     */
    async getAllWithdrawals(req, res) {
        try {
            // Only admin can view all withdrawals
            if (!req.user.isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized'
                });
            }

            const { status, withdrawal_method, start_date, end_date, min_amount, max_amount, page = 1, limit = 10 } = req.query;

            const withdrawals = await withdrawalService.findAll({
                status,
                withdrawal_method,
                startDate: start_date ? new Date(start_date) : null,
                endDate: end_date ? new Date(end_date) : null,
                minAmount: min_amount,
                maxAmount: max_amount,
                page,
                limit
            });

            res.json({
                success: true,
                data: {
                    withdrawals: withdrawals.rows,
                    pagination: {
                        total: withdrawals.count,
                        page: parseInt(page),
                        pages: Math.ceil(withdrawals.count / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Get all withdrawals error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

module.exports = new WithdrawalController();
