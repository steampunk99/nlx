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

            // Combined Database Transaction for payment and package
            const { payment, nodePackage } = await prisma.$transaction(async (tx) => {
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
                    transactionId: trans_id,
                    reference: trans_id,
                    phoneNumber: phone,
                    packageId,
                    nodeId: node.id,
                    status: 'PENDING',
                }, tx);

                // Create nodePackage within the same transaction
                const nodePackage = await nodePackageService.create({
                    nodeId: payment.nodeId,
                    packageId: payment.packageId,
                    expiresAt: addDays(new Date(), 30),
                    status: 'INACTIVE',
                    activatedAt: new Date(),
                }, tx);

                return { payment, nodePackage };
            });

            // 2. Initiate Mobile Money Request
            const mobileMoneyResponse = await mobileMoneyUtil.requestToPay({
                amount,
                phone,
                trans_id,
            });

            logger.info('Mobile money request initiated:', {
                trans_id,
                payment_id: payment.id,
                node_package_id: nodePackage.id
            });

            // Get initial status from Script Networks
            const initialStatus = await mobileMoneyUtil.webhookResponse(trans_id);
            
            // Return early response with initial status
            res.status(201).json({
                success: true,
                data: {
                    trans_id,
                    status: "PENDING",
                    payment_id: payment.id,
                    mobileMoneyResponse
                }
            });

            // Update payment status if not pending
            if (initialStatus) {
                await prisma.$transaction(async (tx) => {
                    if (initialStatus.status === 'FAILED') {
                        await nodePaymentService.updateMobileMoneyPaymentStatus(payment.id, 'FAILED', tx);
                        logger.error('Initial payment status failed:', { trans_id, payment_id: payment.id });
                    } else if (initialStatus.status === 'SUCCESSFUL') {
                        await this.processSuccessfulPayment(payment.id, tx);
                        logger.info('Initial payment status successful:', { trans_id, payment_id: payment.id });
                    }
                });
            }

        } catch (error) {
            logger.error('Payment processing error:', {
                error: error.message,
                stack: error.stack,
                trans_id: req.body?.trans_id
            });
            
            // Send error response if not already sent
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to process payment',
                    error: error.message
                });
            }
        }
    }

    // Shared method for processing successful payments
    async processSuccessfulPayment(paymentId, tx) {
        console.log('Processing successful payment:', { paymentId });
        
        const payment = await nodePaymentService.updateMobileMoneyPaymentStatus(paymentId, 'SUCCESSFUL', tx);
        
        // Fetch full payment details with package info
        const fullPayment = await nodePaymentService.findById(payment.id, tx);
        
        console.log('Payment updated successfully:', {
            paymentId: payment.id,
            status: payment.status
        });

        return fullPayment;
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
