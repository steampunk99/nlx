const nodePaymentService = require('../services/nodePayment.service');
const nodePackageService = require('../services/nodePackage.service');
const nodeService = require('../services/node.service');
const packageService = require('../services/package.service');
const { PrismaClient } = require('@prisma/client');
const mobileMoneyUtil = require('../utils/ugandaMobileMoneyUtil');
const { addDays } = require('../utils/date.utils');
const logger = require('../services/logger.service');

const prisma = new PrismaClient();

class PaymentController {
    async processPackagePayment(req, res) {
        try {
            const { trans_id, amount, phone, packageId } = req.body;
            const userId = req.user.id;

            // 1. Initial Database Transaction
            const { payment } = await prisma.$transaction(async (tx) => {
                const node = await nodeService.findByUserId(userId, tx);
                if (!node) {
                    throw new Error('Node not found for user');
                }

                const pkg = await packageService.findById(packageId, tx);
                if (!pkg) {
                    throw new Error('Package not found');
                }

                const payment = await nodePaymentService.createMobileMoneyPayment({
                    transactionDetails: trans_id,
                    amount,
                    reference: trans_id,
                    phone,
                    packageId,
                    nodeId: node.id,
                    status: 'PENDING',
                    transactionId: trans_id
                }, tx);

                return { payment };
            });

            // 2. Initiate Mobile Money Request
            const mobileMoneyResponse = await mobileMoneyUtil.requestToPay({
                amount,
                phone,
                trans_id,
                paymentId: payment.id
            });

            if (!mobileMoneyResponse || mobileMoneyResponse.error) {
                await nodePaymentService.updateMobileMoneyPaymentStatus(payment.id, 'FAILED');
                return res.status(400).json({
                    success: false,
                    message: 'Mobile money request failed',
                    error: mobileMoneyResponse?.error || 'Unknown error'
                });
            }

            // 3. Send Response
            res.status(201).json({
                success: true,
                data: {
                    trans_id,
                    status: 'PENDING',
                    payment_id: payment.id
                }
            });

        } catch (error) {
            logger.error('Payment processing error:', error);
            if (!res.headersSent) {
                return res.status(500).json({
                    success: false,
                    message: error.message || 'Payment processing failed'
                });
            }
        }
    }

    // Shared method for processing successful payments
    async processSuccessfulPayment(paymentId) {
        logger.info('Processing successful payment:', { paymentId });
        
        const payment = await nodePaymentService.updateMobileMoneyPaymentStatus(paymentId, 'SUCCESSFUL');
        
        // Fetch full payment details with package info
        const fullPayment = await nodePaymentService.findById(payment.id);
        
        logger.info('Payment updated successfully:', {
            paymentId: payment.id,
            status: payment.status
        });

        return fullPayment;
    }

    async getPaymentStatus(req, res) {
        try {
            const { transId } = req.params;
            const payment = await nodePaymentService.findByTransactionId(transId);
            
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            return res.json({
                success: true,
                data: {
                    status: payment.status,
                    updatedAt: payment.updatedAt
                }
            });

        } catch (error) {
            logger.error('Payment status check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch payment status'
            });
        }
    }

    async processUpgradePayment(req, res) {
        try {
            const { 
                trans_id,
                currentPackageId, 
                newPackageId,
                amount,
                phone
            } = req.body;
            const userId = req.user.id;

            // Validate package upgrade
            const node = await nodeService.findByUserId(userId);
            if (!node) {
                throw new Error('Node not found for user');
            }

            const currentPackage = await packageService.findById(currentPackageId);
            const newPackage = await packageService.findById(newPackageId);

            if (!currentPackage || !newPackage) {
                throw new Error('Invalid package IDs');
            }

            if (newPackage.price <= currentPackage.price) {
                throw new Error('New package must be higher value than current package');
            }

            // Create payment record
            const payment = await nodePaymentService.createMobileMoneyPayment({
                transactionDetails: trans_id,
                amount,
                reference: trans_id,
                phone,
                packageId: newPackageId,
                nodeId: node.id,
                status: 'PENDING',
                transactionId: trans_id
            });

            // Initiate mobile money request
            const mobileMoneyResponse = await mobileMoneyUtil.requestToPay({
                amount,
                phone,
                trans_id,
                paymentId: payment.id
            });

            if (!mobileMoneyResponse || mobileMoneyResponse.error) {
                await nodePaymentService.updateMobileMoneyPaymentStatus(payment.id, 'FAILED');
                return res.status(400).json({
                    success: false,
                    message: 'Mobile money request failed',
                    error: mobileMoneyResponse?.error || 'Unknown error'
                });
            }

            return res.status(201).json({
                success: true,
                data: {
                    trans_id,
                    status: 'PENDING',
                    payment_id: payment.id
                }
            });

        } catch (error) {
            logger.error('Upgrade payment error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to process upgrade payment'
            });
        }
    }
}

module.exports = new PaymentController();
