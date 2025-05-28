const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const withdrawalService = require('../services/withdrawal.service');
const systemRevenueService = require('../services/systemRevenue.service');
const notificationService = require('../services/notification.service');
const ugandaMobileMoneyUtil = require('../utils/ugandaMobileMoneyUtil');
const logger = require('../services/logger.service');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class WithdrawalController {
    /**
     * Request a new withdrawal
     */
    requestWithdrawal = catchAsync(async (req, res) => {
        const { amount, phone } = req.body;
        const userId = req.user.id;
        const config = require('../config/config');
        const isLiveMode = process.env.NODE_ENV === 'production' || config.env === 'production';

        logger.info('Received withdrawal request:', {
            amount,
            phone,
            user_id: userId
        });

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
            logger.warn(`User ${userId} has pending withdrawals:`, pendingWithdrawals);
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
                logger.error(`User or node not found for User ID: ${userId}`);
                throw new AppError('User or node not found', 404);
            }

            logger.info(`Processing withdrawal for user:`, user);

            // Check available balance
            if (user.node.availableBalance < amount) {
                logger.error(`Insufficient balance for User ID: ${userId}. Available: ${user.node.availableBalance}, Requested: ${amount}`);
                throw new AppError('Insufficient balance', 400);
            }

            // Calculate withdrawal fee
            const fee = await systemRevenueService.calculateWithdrawalFee(amount);

            // Generate transaction ID
            const trans_id = `WTH${Date.now()}${Math.random().toString(36).substr(2, 4)}`;
            logger.info(`Generated Transaction ID: ${trans_id}`);

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
                            attempts: 0,
                            fee
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

            logger.info(`Withdrawal records created: User Withdrawal ID: ${withdrawal.id}, Node Withdrawal ID: ${nodeWithdrawal.id}`);

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

            // // Record system revenue from fee
            // await systemRevenueService.recordRevenue({
            //     amount: fee,
            //     type: 'WITHDRAWAL_FEE',
            //     referenceId: withdrawal.id
            // }, tx);

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

            // --- LIVE MODE: Call real API ---
            if (isLiveMode) {
                try {
                    // Process withdrawal using Script Networks
                    const scriptNetworksResponse = await ugandaMobileMoneyUtil.requestWithdrawal({
                        amount,
                        phone,
                        trans_id,
                        reason: 'Commission withdrawal'
                    });

                    logger.info(`Script Networks Response:`, scriptNetworksResponse);

                    // Always leave withdrawal as PROCESSING; webhook will update status
                    await tx.withdrawal.update({
                        where: { id: withdrawal.id },
                        data: {
                            details: {
                                ...withdrawal.details,
                                scriptNetworksResponse: scriptNetworksResponse.data,
                                lastAttempt: new Date()
                            }
                        }
                    });
                    await tx.nodeWithdrawal.update({
                        where: { id: nodeWithdrawal.id },
                        data: {
                            details: {
                                scriptNetworksResponse: scriptNetworksResponse.data,
                                lastAttempt: new Date()
                            }
                        }
                    });
                    // Optionally, you can log or store the API response for debugging
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

                    // Create notification for failed withdrawal
                    await notificationService.create({
                        userId: withdrawal.userId,
                        title: 'Withdrawal Failed',
                        message: `Your withdrawal request of ${withdrawal.amount} has failed. Please contact support if you need assistance.`,
                        type: 'WITHDRAWAL_FAILED'
                    }, tx);

                    throw error;
                }
            } else {
                // --- TEST/DEV MODE: Do not mark as failed, leave as PROCESSING ---
                await tx.withdrawal.update({
                    where: { id: withdrawal.id },
                    data: {
                        details: {
                            ...withdrawal.details,
                            note: 'Test mode: withdrawal not sent to real API',
                            lastAttempt: new Date()
                        }
                    }
                });
                logger.info('Test mode: withdrawal left as PROCESSING, awaiting webhook or manual update', { withdrawalId: withdrawal.id });
                return { withdrawal, scriptNetworksResponse: { success: true, testMode: true } };
            }
        });

        res.status(201).json({
            success: true,
            message: result.scriptNetworksResponse.success 
                ? 'Withdrawal request submitted successfully' 
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

        // Initialize default stats for all statuses
        const defaultStats = {
            pending: { count: 0, amount: "0" },
            processing: { count: 0, amount: "0" },
            successful: { count: 0, amount: "0" },
            failed: { count: 0, amount: "0" },
            rejected: { count: 0, amount: "0" }
        };

        // Convert stats to proper format with defaults
        const formattedStats = stats.reduce((acc, stat) => {
            const status = stat.status.toLowerCase();
            // Convert Decimal to string to preserve precision
            const amount = stat._sum.amount?.toString() || "0";
            return {
                ...acc,
                [status]: {
                    count: stat._count,
                    amount
                }
            };
        }, defaultStats);

        res.json({
            success: true,
            data: {
                withdrawals: withdrawals.map(w => ({
                    ...w,
                    phone: w.details?.phone,
                    failureReason: w.details?.failureReason,
                    attempts: w.details?.attempts,
                    fee: w.details?.fee
                })),
                stats: formattedStats,
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

            const withdrawal = await prisma.withdrawal.findUnique({
                where: { id },
                include: {
                    user: true
                }
            });

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

            const cancelledWithdrawal = await prisma.withdrawal.update({
                where: { id },
                data: {
                    status: 'CANCELLED',
                    remarks: 'Cancelled by user'
                }
            });

            // Create notification for cancelled withdrawal
            await notificationService.create({
                userId: withdrawal.userId,
                title: 'Withdrawal Cancelled',
                message: `Your withdrawal request of ${withdrawal.amount} has been cancelled.`,
                type: 'WITHDRAWAL_CANCELLED'
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
            logger.error('Cancel withdrawal error:', {
                error: error.message,
                user_id: req.user?.id
            });

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
    processWithdrawal = catchAsync(async (req, res) => {
        const { id } = req.params;
        const { status, remarks } = req.body;

        // Get withdrawal with user
        const withdrawal = await prisma.withdrawal.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: true
            }
        });

        if (!withdrawal) {
            throw new AppError('Withdrawal not found', 404);
        }

        if (!['SUCCESSFUL', 'FAILED', 'REJECTED'].includes(status)) {
            throw new AppError('Invalid status', 400);
        }

        if (withdrawal.status !== 'PENDING') {
            throw new AppError('Can only process pending withdrawals', 400);
        }

        // Update withdrawal in a transaction
        const updatedWithdrawal = await prisma.$transaction(async (tx) => {
            // Update withdrawal status
            const updated = await tx.withdrawal.update({
                where: { id: parseInt(id) },
                data: {
                    status,
                    processedAt: new Date(),
                    details: {
                        ...withdrawal.details,
                        processedAt: new Date(),
                        processedBy: req.user.id,
                        remarks: remarks || (status === 'SUCCESSFUL' ? 'Approved by admin' : 'Rejected by admin')
                    }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                }
            });

            // Update node withdrawal and statement if exists
            if (withdrawal.transactionId) {
                await Promise.all([
                    tx.nodeWithdrawal.updateMany({
                        where: { transactionId: withdrawal.transactionId },
                        data: { 
                            status: status === 'SUCCESSFUL' ? 'SUCCESSFUL' : 'FAILED',
                            reason: remarks || (status === 'SUCCESSFUL' ? 'Approved by admin' : 'Rejected by admin')
                        }
                    }),
                    tx.nodeStatement.updateMany({
                        where: {
                            referenceType: 'WITHDRAWAL',
                            referenceId: withdrawal.id
                        },
                        data: { 
                            status: status === 'SUCCESSFUL' ? 'SUCCESSFUL' : 'FAILED',
                            description: remarks 
                                ? `${withdrawal.description || 'Withdrawal request'} - ${remarks}`
                                : `${withdrawal.description || 'Withdrawal request'} - ${status === 'SUCCESSFUL' ? 'Approved by admin' : 'Rejected by admin'}`
                        }
                    })
                ]);
            }

            // Update node balance if withdrawal is successful
            if (status === 'SUCCESSFUL' && withdrawal.details?.nodeId) {
                await tx.node.update({
                    where: { id: withdrawal.details.nodeId },
                    data: {
                        availableBalance: {
                            decrement: withdrawal.amount
                        }
                    }
                });
            }

            // Create notification within the transaction
            if (status === 'SUCCESSFUL') {
                await notificationService.create({
                    userId: withdrawal.userId,
                    title: 'Withdrawal Successful',
                    message: `Your withdrawal request has been processed and completed successfully.`,
                    type: 'WITHDRAWAL_SUCCESS'
                }, tx);
            } else if (status === 'FAILED') {
                await notificationService.create({
                    userId: withdrawal.userId,
                    title: 'Withdrawal Failed',
                    message: `Your withdrawal request has failed. Please contact support if you need assistance.`,
                    type: 'WITHDRAWAL_FAILED'
                }, tx);
            } else if (status === 'REJECTED') {
                await notificationService.create({
                    userId: withdrawal.userId,
                    title: 'Withdrawal Rejected',
                    message: `Your withdrawal request has been rejected. Please contact support if you need assistance.`,
                    type: 'WITHDRAWAL_REJECTED'
                }, tx);
            }

            // Create notification within the transaction
            await notificationService.createWithdrawalNotification(
                withdrawal.userId,
                withdrawal.id,
                status,
                withdrawal.amount,
                remarks,
                tx
            );

            return updated;
        });

        res.json({
            success: true,
            message: `Withdrawal ${status.toLowerCase()} successfully`,
            data: {
                ...updatedWithdrawal,
                phone: updatedWithdrawal.details?.phone,
                failureReason: updatedWithdrawal.details?.failureReason,
                attempts: updatedWithdrawal.details?.attempts,
                fee: updatedWithdrawal.details?.fee
            }
        });
    })

    /**
     * Get all withdrawals (Admin only)
     * @param {Request} req 
     * @param {Response} res 
     */
    getAllWithdrawals = catchAsync(async (req, res) => {
        const { status, startDate, endDate, page = 1, limit = 10, search } = req.query;

        // Build where clause
        const where = {
            ...(status && { status }),
            ...(startDate && endDate && {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            }),
            ...(search && {
                OR: [
                    { transactionId: { contains: search } },
                    { user: { 
                        OR: [
                            { firstName: { contains: search } },
                            { lastName: { contains: search } },
                            { email: { contains: search } }
                        ]
                    }}
                ]
            })
        };

        // Get withdrawals with filters
        const [withdrawals, total] = await Promise.all([
            prisma.withdrawal.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * parseInt(limit),
                take: parseInt(limit),
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                }
            }),
            prisma.withdrawal.count({ where })
        ]);

        // Get withdrawal statistics
        const stats = await prisma.withdrawal.groupBy({
            by: ['status'],
            _count: true,
            _sum: {
                amount: true
            }
        });

        // Initialize default stats for all statuses
        const defaultStats = {
            pending: { count: 0, amount: "0" },
            processing: { count: 0, amount: "0" },
            successful: { count: 0, amount: "0" },
            failed: { count: 0, amount: "0" },
            rejected: { count: 0, amount: "0" }
        };

        // Convert stats to proper format with defaults
        const formattedStats = stats.reduce((acc, stat) => {
            const status = stat.status.toLowerCase();
            // Convert Decimal to string to preserve precision
            const amount = stat._sum.amount?.toString() || "0";
            return {
                ...acc,
                [status]: {
                    count: stat._count,
                    amount
                }
            };
        }, defaultStats);

        res.json({
            success: true,
            data: {
                withdrawals: withdrawals.map(w => ({
                    ...w,
                    phone: w.details?.phone,
                    failureReason: w.details?.failureReason,
                    attempts: w.details?.attempts,
                    fee: w.details?.fee
                })),
                stats: formattedStats,
                pagination: {
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            }
        });
    })

    /**
     * Check withdrawal status by transactionId
     */
    checkWithdrawalStatus = catchAsync(async (req, res) => {
        const { transactionId } = req.params;
        if (!transactionId) {
            return res.status(400).json({
                success: false,
                message: 'Missing transactionId'
            });
        }
        const withdrawal = await prisma.withdrawal.findUnique({
            where: { transactionId },
        });
        if (!withdrawal) {
            return res.status(404).json({
                success: false,
                message: 'Withdrawal not found'
            });
        }
        res.json({
            success: true,
            
                transactionId: withdrawal.transactionId,
                status: withdrawal.status,
                amount: withdrawal.amount,
                method: withdrawal.method,
                details: withdrawal.details,
                createdAt: withdrawal.createdAt,
                processedAt: withdrawal.processedAt,
                completedAt: withdrawal.completedAt
            
        });
    });
}

module.exports = new WithdrawalController();
