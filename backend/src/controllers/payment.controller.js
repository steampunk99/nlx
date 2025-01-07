const nodePaymentService = require('../services/nodePayment.service');
const nodePackageService = require('../services/nodePackage.service');
const nodeService = require('../services/node.service');
const packageService = require('../services/package.service');
const { PrismaClient } = require('@prisma/client');
const mobileMoneyUtil = require('../utils/ugandaMobileMoneyUtil');
const { addDays } = require('../utils/date.utils');
const logger = require('../services/logger.service');
const nodeStatementService = require('../services/nodeStatement.service');
const { generateTransactionId } = require('../utils/transaction.utils');

const prisma = new PrismaClient();

class PaymentController {
    async processPackagePayment(req, res) {
        try {
            const { amount, phone, packageId } = req.body;
            const userId = req.user.id;
            const trans_id = generateTransactionId();
            let mobileMoneyResponse;

            // 1. First validate mobile money request before creating payment record
            try {
                // Pre-validate the mobile money request
                mobileMoneyResponse = await mobileMoneyUtil.requestToPay({
                    amount,
                    phone,
                    trans_id,
                });

                if (!mobileMoneyResponse || mobileMoneyResponse.error) {
                    logger.error('Mobile money request failed:', {
                        error: mobileMoneyResponse?.error,
                        trans_id
                    });
                    return res.status(400).json({
                        success: false,
                        message: 'Mobile money request failed',
                        error: mobileMoneyResponse?.error || 'Unknown error'
                    });
                }

                logger.info('Mobile money request successful:', {
                    trans_id,
                    response: mobileMoneyResponse
                });
            } catch (error) {
                logger.error('Mobile money request error:', {
                    error: error.message,
                    trans_id
                });
                return res.status(400).json({
                    success: false,
                    message: 'Mobile money request failed',
                    error: error.message
                });
            }

            // 2. Create payment record only if mobile money request was successful
            const { payment } = await prisma.$transaction(async (tx) => {
                const node = await nodeService.findByUserId(userId, tx);
                if (!node) {
                    throw new Error('Node not found for user');
                }

                const pkg = await packageService.findById(packageId, tx);
                if (!pkg) {
                    throw new Error('Package not found');
                }

                // Create payment with correct phone parameter
                const payment = await nodePaymentService.createMobileMoneyPayment({
                    transactionDetails: trans_id,
                    amount,
                    transactionId: trans_id,
                    reference: trans_id,
                    phone: phone,  
                    packageId,
                    nodeId: node.id,
                    status: 'PENDING',
                }, tx);
                console.log('Node Payment created:', {});

                // Create pending statement
                await nodeStatementService.create({
                    nodeId: node.id,
                    amount,
                    type: 'DEBIT',
                    status: 'PENDING',
                    description: `Package purchase payment - ${pkg.name}`,
                    referenceType: 'DEPOSIT',
                    referenceId: payment.id
                }, tx);

                logger.info('Created payment record and statement:', {
                    payment_id: payment.id,
                    trans_id,
                    phone,
                    amount
                });

                return { payment };
            });
          
            // Return early response with initial status
            res.status(201).json({
                success: true,
                    trans_id,
                    status: "PENDING",
                    payment_id: payment.id,
                    mobileMoneyResponse
            });
            const initialStatus = await nodePaymentService.findByTransactionId(trans_id);

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
    async processSuccessfulPayment(paymentId, tx = prisma) {
        logger.info('Processing successful payment:', { paymentId });
        
        const payment = await nodePaymentService.updateMobileMoneyPaymentStatus(paymentId, 'SUCCESSFUL', tx);
        
        // Create and activate node package only on successful payment
        const nodePackage = await nodePackageService.create({
            nodeId: payment.nodeId,
            packageId: payment.packageId,
            status: 'ACTIVE',
            expiresAt: addDays(new Date(), 30),
            activatedAt: new Date(),
        }, tx);

        // Update node status to ACTIVE
        await tx.node.update({
            where: { id: payment.nodeId },
            data: { 
                status: 'ACTIVE',
                updatedAt: new Date()
            }
        });

        // Update statement to completed
        await nodeStatementService.create({
            nodeId: payment.nodeId,
            amount: payment.amount,
            type: 'DEBIT',
            status: 'COMPLETED',
            description: `Package purchase completed - ${payment.package.name}`,
            referenceType: 'PAYMENT',
            referenceId: payment.id,
            completedAt: new Date()
        }, tx);

        logger.info('Payment processed successfully:', {
            paymentId: payment.id,
            nodePackageId: nodePackage.id,
            status: payment.status
        });

        return payment;
    }



    async processUpgradePayment(req, res) {
        try {
            const { 
                currentPackageId, 
                newPackageId,
                amount,
                phone
            } = req.body;
            const userId = req.user.id;
            const trans_id = generateTransactionId();

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

            // Create pending statement
            await nodeStatementService.create({
                nodeId: node.id,
                amount,
                type: 'DEBIT',
                status: 'PENDING',
                description: `Package upgrade payment - ${newPackage.name}`,
                referenceType: 'PAYMENT',
                referenceId: payment.id
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
