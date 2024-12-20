const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const withdrawalService = require('../services/nodeWithdrawal.service');
const notificationService = require('../services/notification.service');
const ugandaMobileMoneyUtil = require('../utils/ugandaMobileMoneyUtil');

class WithdrawalController {
    /**
     * Request a new withdrawal
     * @param {Request} req 
     * @param {Response} res 
     */
    async requestWithdrawal(req, res) {
        try {
            const { amount, phone } = req.body;
            const userId = req.user.id;

            //check user balance
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    node:true,
                    commissions: true }
            });
            console.log('Found user:', {
                userId,
                hasNode: !!user?.node,
                nodeId: user?.node?.id
            });
            if (!user || !user.node) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            const availableBalance = user.commissions.reduce((total, commission) => total + (commission.status === 'PENDING' ? commission.amount : 0));
            console.log('Available balance for user:', availableBalance);
            if (availableBalance < amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient balance'
                });
            }

            //generate transaction id
            const trans_id = `WTH${Date.now()}${Math.random().toString(36).substr(2, 4)}`;
            console.log('Transaction ID generated for withdrawal:', trans_id);
            // Create withdrawal record
            const withdrawal = await prisma.withdrawal.create({
                data: {
                    
                    userId: userId,
                    amount: amount,
                    status: 'PENDING',
                    method: 'MOBILE MONEY',
                    createdAt: new Date(),
                    userId: user.id,
                    
                details: {
                    phone,
                    trans_id,
                    amount,
                    user: user.id
                }
                },
                include:{
                    user: true
                }
            });

            console.log('Withdrawal record created :', withdrawal);

            //process withdrawal using scriptnetworks
            console.log('Processing withdrawal using Script Networks...');
           const scriptNetworksResponse = await ugandaMobileMoneyUtil.requestWithdrawal({
                amount,
                phone,
                trans_id,
                reason: 'bills'
            });

            console.log('Script Networks response:', scriptNetworksResponse);

            // Update withdrawal status based on Script Networks response
            const updatedStatus = scriptNetworksResponse.success ? 'COMPLETED' : 'FAILED';
            await prisma.withdrawal.update({
                where: { id: withdrawal.id },
                data: {
                    status: updatedStatus,
                    details: {
                        ...withdrawal.details,
                        scriptNetworksResponse: scriptNetworksResponse.data
                    }
                }
            });

            await notificationService.createWithdrawalNotification(
                userId,
                withdrawal.id,
                'PENDING',
                amount
            );

            res.status(201).json({
                success: true,
                message: 'Withdrawal  successfully',
                data: withdrawal
            });
        } catch (error) {
            console.error('Request withdrawal error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get user's withdrawal history
     * @param {Request} req 
     * @param {Response} res 
     */
    async getWithdrawalHistory(req, res) {
        try {
            const userId = req.user.id;
            const { status, withdrawal_method, start_date, end_date, min_amount, max_amount, page = 1, limit = 10 } = req.query;

            const withdrawals = await withdrawalService.findAll({
                userId,
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
            console.error('Get withdrawal history error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

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
