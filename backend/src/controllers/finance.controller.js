const nodeStatementService = require('../services/nodeStatement.service');
const nodeWithdrawalService = require('../services/nodeWithdrawal.service');
const nodeService = require('../services/node.service');
const userService = require('../services/user.service');
const { validateWithdrawalRequest } = require('../middleware/withdrawal.validate');
const { calculateCommissions } = require('../utils/commission.utils');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class FinanceController {
    /**
     * Get user's current balance and history
     * @param {Request} req 
     * @param {Response} res 
     */
    async getBalance(req, res) {
        try {
            const userId = req.user.id;
            const node = await nodeService.findByUserId(userId);
            
            if (!node) {
                return res.status(404).json({
                    success: false,
                    message: 'Node not found for user'
                });
            }

            const balanceInfo = await nodeStatementService.getBalance(node.id);

            res.json({
                success: true,
                data: balanceInfo
            });

        } catch (error) {
            console.error('Get balance error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving balance'
            });
        }
    }

    /**
     * Get user's statement/transactions with pagination
     * @param {Request} req 
     * @param {Response} res 
     */
    async getStatement(req, res) {
        try {
            const userId = req.user.id;
            const { 
                startDate, 
                endDate, 
                type,
                page = 1,
                limit = 10,
                status
            } = req.query;
            
            const node = await nodeService.findByUserId(userId);
            if (!node) {
                return res.status(404).json({
                    success: false,
                    message: 'Node not found for user'
                });
            }

            const result = await nodeStatementService.findAll(node.id, {
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                type,
                page: parseInt(page),
                limit: parseInt(limit),
                status
            });

            res.json({
                success: true,
                data: result.statements,
                pagination: result.pagination
            });

        } catch (error) {
            console.error('Get statement error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving statements'
            });
        }
    }

    /**
     * Request withdrawal with limits check
     * @param {Request} req 
     * @param {Response} res 
     */
    async requestWithdrawal(req, res) {
        const tx = await prisma.$transaction(async (prisma) => {
            try {
                const { error } = validateWithdrawalRequest(req.body);
                if (error) {
                    return res.status(400).json({
                        success: false,
                        message: error.details[0].message
                    });
                }

                const userId = req.user.id;
                const { amount, paymentMethod, phoneNumber } = req.body;

                const node = await nodeService.findByUserId(userId);
                if (!node) {
                    return res.status(404).json({
                        success: false,
                        message: 'Node not found for user'
                    });
                }

                // Check withdrawal limits
                const withdrawalLimits = await nodeStatementService.getWithdrawalLimits(node.id);
                
                if (amount < withdrawalLimits.minimum) {
                    return res.status(400).json({
                        success: false,
                        message: `Minimum withdrawal amount is ${withdrawalLimits.minimum}`
                    });
                }

                if (amount > withdrawalLimits.daily.remaining) {
                    return res.status(400).json({
                        success: false,
                        message: `Daily withdrawal limit exceeded. Remaining: ${withdrawalLimits.daily.remaining}`
                    });
                }

                if (amount > withdrawalLimits.weekly.remaining) {
                    return res.status(400).json({
                        success: false,
                        message: `Weekly withdrawal limit exceeded. Remaining: ${withdrawalLimits.weekly.remaining}`
                    });
                }

                if (amount > withdrawalLimits.monthly.remaining) {
                    return res.status(400).json({
                        success: false,
                        message: `Monthly withdrawal limit exceeded. Remaining: ${withdrawalLimits.monthly.remaining}`
                    });
                }

                // Check user's balance
                const balance = await nodeStatementService.getBalance(node.id);
                if (balance.currentBalance < amount) {
                    return res.status(400).json({
                        success: false,
                        message: 'Insufficient balance'
                    });
                }

                // Check pending withdrawals
                const pendingWithdrawals = await nodeWithdrawalService.findPendingByNodeId(node.id);
                if (pendingWithdrawals.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'You already have a pending withdrawal request'
                    });
                }

                const withdrawal = await nodeWithdrawalService.create({
                    nodeId: node.id,
                    amount,
                    paymentMethod,
                    paymentPhone: phoneNumber,
                    status: 'PENDING'
                }, prisma);

                // Create statement record for withdrawal
                await nodeStatementService.create({
                    nodeId: node.id,
                    amount,
                    type: 'DEBIT',
                    description: 'Withdrawal request',
                    status: 'PENDING',
                    referenceType: 'WITHDRAWAL',
                    referenceId: withdrawal.id
                }, prisma);

                return withdrawal;
            } catch (error) {
                throw error;
            }
        });

        res.status(201).json({
            success: true,
            message: 'Withdrawal request submitted successfully',
            data: tx
        });
    }

    /**
     * Get user's withdrawal history with pagination
     * @param {Request} req 
     * @param {Response} res 
     */
    async getWithdrawals(req, res) {
        try {
            const userId = req.user.id;
            const { 
                status,
                page = 1,
                limit = 10,
                startDate,
                endDate
            } = req.query;

            const node = await nodeService.findByUserId(userId);
            if (!node) {
                return res.status(404).json({
                    success: false,
                    message: 'Node not found for user'
                });
            }

            const withdrawals = await nodeWithdrawalService.findAll(node.id, {
                status,
                page: parseInt(page),
                limit: parseInt(limit),
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined
            });

            res.json({
                success: true,
                data: withdrawals.items,
                pagination: withdrawals.pagination
            });

        } catch (error) {
            console.error('Get withdrawals error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving withdrawals'
            });
        }
    }

    /**
     * Schedule payouts for multiple users
     * @param {Request} req 
     * @param {Response} res 
     */
    async schedulePayouts(req, res) {
        try {
            const { payouts } = req.body;
            
            if (!Array.isArray(payouts) || payouts.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid payouts data'
                });
            }

            const scheduledPayouts = await nodeStatementService.schedulePayouts(payouts);

            res.json({
                success: true,
                message: `Successfully scheduled ${scheduledPayouts.length} payouts`,
                data: scheduledPayouts
            });

        } catch (error) {
            console.error('Schedule payouts error:', error);
            res.status(500).json({
                success: false,
                message: 'Error scheduling payouts'
            });
        }
    }

    /**
     * Process scheduled payouts
     * @param {Request} req 
     * @param {Response} res 
     */
    async processScheduledPayouts(req, res) {
        try {
            const processedPayouts = await nodeStatementService.processScheduledPayouts();

            res.json({
                success: true,
                message: `Successfully processed ${processedPayouts.length} payouts`,
                data: processedPayouts
            });

        } catch (error) {
            console.error('Process scheduled payouts error:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing scheduled payouts'
            });
        }
    }

    /**
     * Create bulk statements
     * @param {Request} req 
     * @param {Response} res 
     */
    async createBulkStatements(req, res) {
        try {
            const { statements } = req.body;
            
            if (!Array.isArray(statements) || statements.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid statements data'
                });
            }

            const createdStatements = await nodeStatementService.createBulk(statements);

            res.status(201).json({
                success: true,
                message: `Successfully created ${createdStatements.length} statements`,
                data: createdStatements
            });

        } catch (error) {
            console.error('Create bulk statements error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating bulk statements'
            });
        }
    }

    /**
     * Calculate and distribute commissions for a package purchase
     * @param {Request} req 
     * @param {Response} res 
     */
    async distributeCommissions(req, res) {
        try {
            const { userId, packageId } = req.body;

            if (!userId || !packageId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID and package ID are required'
                });
            }

            // Get user and package details
            const user = await userService.findById(userId);
            const pkg = await prisma.package.findUnique({
                where: { id: packageId }
            });

            if (!user || !pkg) {
                return res.status(404).json({
                    success: false,
                    message: 'User or package not found'
                });
            }

            // Use transaction to ensure atomic commission distribution
            const result = await prisma.$transaction(async (tx) => {
                await calculateCommissions(user, pkg, tx);
            });

            res.json({
                success: true,
                message: 'Commissions distributed successfully',
                data: result
            });

        } catch (error) {
            console.error('Distribute commissions error:', error);
            res.status(500).json({
                success: false,
                message: 'Error distributing commissions'
            });
        }
    }
}

module.exports = new FinanceController();
