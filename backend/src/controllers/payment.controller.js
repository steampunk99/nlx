const { PrismaClient } = require('@prisma/client');
const nodePackageService = require('../services/nodePackage.service');
const nodeService = require('../services/node.service');
const packageService = require('../services/package.service');
const nodePaymentService = require('../services/nodePayment.service');
const mobileMoneyUtil = require('../utils/ugandaMobileMoneyUtil');
const { addDays } = require('../utils/date.utils');
const logger = require('../services/logger.service');
const nodeStatementService = require('../services/nodeStatement.service');
const { generateTransactionId } = require('../utils/transaction.utils');
const systemRevenueService = require('../services/systemRevenue.service');
const commissionUtil = require('../utils/commission.utils');
const notificationService = require('../services/notification.service'); // Added notification service
const adminNotificationUtils = require('../utils/admin-notification.utils'); // Added admin notification utils
const bonusUtils = require('../utils/bonus.utils');
const userService = require('../services/user.service');

const prisma = new PrismaClient();

class PaymentController {

    //process manual payment
    async processManualPayment(req, res) {
        try {
            const { transactionId, amount, packageId } = req.body;
            const userId = req.user.id;
            
            const { payment } = await prisma.$transaction(async (tx) => {
                const node = await nodeService.findByUserId(userId, tx);
                if (!node) {
                    throw new Error('Node not found for user');
                }

                // Verify package exists
                const pkg = await packageService.findById(packageId, tx);
                if (!pkg) {
                    throw new Error('Package not found');
                }

                // Check for duplicate transaction ID
                const existingPayment = await nodePaymentService.findByTransactionId(transactionId, tx);
                if (existingPayment) {
                    throw new Error('Transaction ID already exists');
                }

                const payment = await nodePaymentService.create({
                    transactionDetails: transactionId,
                    amount,
                    transactionId: transactionId,
                    reference: transactionId,
                    type: 'MANUAL',
                    packageId,
                    nodeId: node.id,
                    paymentMethod: 'Mobile Money',
                    status: 'PENDING',
                },tx);
                console.log('Node Payment created:', payment);

                // Create pending statement
                await nodeStatementService.create({
                    nodeId: node.id,
                    amount,
                    type: 'DEBIT',
                    status: 'PENDING',
                    description: `Package purchase - ${pkg.name} (Manual Mobile Money)`,
                    referenceType: 'DEPOSIT',
                    referenceId: payment.id
                }, tx);

                logger.info('Created manual payment record and statement:', {
                    payment_id: payment.id,
                    transactionId,
                    amount,
                    packageId
                });

                return { payment };
            }, { maxWait: 10000, timeout: 15000 });

            res.status(201).json({
                success: true,
                transactionId,
                status: "PENDING",
                payment_id: payment.id
            });
        } catch (error) {
            logger.error('Manual payment processing error:', {
                error: error.message,
                stack: error.stack,
                transactionId: req.body?.transactionId
            });

            // Alert admins of payment processing error
            await adminNotificationUtils.systemAlert(
                'Payment Processing Error',
                `Failed to process manual payment ${req.body.transactionId}. Error: ${error.message}`
            );


            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to process payment'
                });
            }
        }
    }

    //process usdt payment

    async processUsdtPayment(req, res) {
        try {
            const { amount, packageId } = req.body;
            const userId = req.user.id;
            const trans_id = generateTransactionId();
            const { payment } = await prisma.$transaction(async (tx) => {
                const node = await nodeService.findByUserId(userId, tx);
                if (!node) {
                    throw new Error('Node not found for user');
                }

                // Verify package exists
                const pkg = await packageService.findById(packageId, tx);
                if (!pkg) {
                    throw new Error('Package not found');
                }

                // Check for duplicate transaction ID
                const existingPayment = await nodePaymentService.findByTransactionId(trans_id, tx);
                if (existingPayment) {
                    throw new Error('Transaction ID already exists');
                }

                // Create  nodepayment record
                const payment = await nodePaymentService.create({
                    transactionDetails: trans_id,
                    amount,
                    transactionId: trans_id,
                    reference: trans_id,
                    type: 'USDT Package Payment',
                    packageId,
                    nodeId: node.id,
                    paymentMethod: 'USDT',
                    status: 'PENDING',
                },tx);
                console.log('Node Payment created:', payment);

                // Create pending statement
                await nodeStatementService.create({
                    nodeId: node.id,
                    amount,
                    type: 'DEBIT',
                    status: 'PENDING',
                    description: `Package purchase payment - ${pkg.name} (USDT)`,
                    referenceType: 'DEPOSIT',
                    referenceId: payment.id
                }, tx);

                logger.info('Created payment record and statement:', {
                    payment_id: payment.id,
                    trans_id,
                    amount
                });

                return { payment };
            }, { maxWait: 10000, timeout: 15000 });

            res.status(201).json({
                success: true,
                trans_id,
                status: "PENDING",
                payment_id: payment.id
            });
        } catch (error) {
            logger.error('Payment processing error:', {
                error: error.message,
                stack: error.stack,
                trans_id: req.body?.trans_id
            });

            // Alert admins of payment processing error
            await adminNotificationUtils.systemAlert(
                'Payment Processing Error',
                `Failed to process payment ${req.body.trans_id}. Error: ${error.message}`
            );

            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to process payment'
                });
            }
        }
    }

    // Process successful payment (called by callback - USDT)
    async processUsdtCallback(req, res) {
        const { trans_id, status } = req.body;
        try {
            // Find payment by transaction ID
            const payment = await prisma.nodePayment.findFirst({
                where: { transactionId: trans_id },
                include: {
                    package: true,
                    node: true
                }
            });

            if (!payment) {
                logger.error('Payment not found:', { trans_id });
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            // Process in transaction
            const result = await prisma.$transaction(async (tx) => {
                // Update payment status
                const updatedPayment = await nodePaymentService.updateMobileMoneyPaymentStatus(
                    payment.id,
                    status,
                    tx
                );

                if (status === 'SUCCESSFUL') {
                    // Create and activate node package
                    const nodePackage = await nodePackageService.create({
                        nodeId: payment.nodeId,
                        packageId: payment.packageId,
                        status: 'ACTIVE',
                        expiresAt: addDays(new Date(), 30),
                        activatedAt: new Date(),
                    }, tx);

                    // Update node status
                    await tx.node.update({
                        where: { id: payment.nodeId },
                        data: { 
                            status: 'ACTIVE',
                            updatedAt: new Date()
                        }
                    });

                    // Create completed statement
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

                    // Calculate revenue and commissions
                    await systemRevenueService.calculatePackageRevenue(updatedPayment, payment.package, tx);
                    await commissionUtil.calculateCommissions(payment.nodeId, payment.amount, payment.packageId, tx);
                    await bonusUtils.giveActivationBonus(payment.nodeId, payment.id, tx);

                    // Create notification for successful package purchase
                    await notificationService.create({
                        userId: payment.node.userId,
                        title: 'Package Purchase Successful',
                        message: `Your payment of ${payment.amount} for ${payment.package.name} package has been confirmed.`,
                        type: 'PACKAGE_PURCHASE'
                    }, tx);

                    await userService.verifyUser(payment.node.userId, tx);

                    logger.info('USDT payment processed successfully:', {
                        payment_id: payment.id,
                        trans_id,
                        status
                    });
                }

                return updatedPayment;
            }, { maxWait: 10000, timeout: 15000 });

            res.status(200).json({
                success: true,
                message: 'Payment status updated successfully',
                data: result
            });

        } catch (error) {
            logger.error('Error processing USDT callback:', {
                error: error.message,
                stack: error.stack,
                trans_id
            });

            // Alert admins of payment processing error
            await adminNotificationUtils.systemAlert(
                'Payment Processing Error',
                `Failed to process USDT callback ${trans_id}. Error: ${error.message}`
            );

            res.status(500).json({
                success: false,
                message: 'Failed to process payment callback',
                error: error.message
            });
        }
    }

    // Check payment status usdt
    async checkPaymentStatus(req, res) {
        try {
            const { transactionId } = req.query;
            
            const payment = await prisma.nodePayment.findFirst({
                where: { transactionId },
                include: {
                    package: true
                }
            });

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            // Map internal status to frontend status
            let status = payment.status;
            if (status === 'SUCCESSFUL') {
                status = 'COMPLETED';
            }

            res.json({
                success: true,
                status,
                transactionId: payment.transactionId,
                amount: payment.amount,
                packageName: payment.package.name,
                paymentMethod: payment.paymentMethod,
                createdAt: payment.createdAt
            });
        } catch (error) {
            logger.error('Error checking payment status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check payment status'
            });
        }
    }

    // Process package payment
    async processPackagePayment(req, res) {
        try {
            const { amount, phone, packageId } = req.body;
            const userId = req.user.id;
            const trans_id = generateTransactionId();
            let mobileMoneyResponse;


            // 1. Create payment record only if mobile money request was successful
            const { payment } = await prisma.$transaction(async (tx) => {
                const node = await nodeService.findByUserId(userId, tx);
                if (!node) {
                    throw new Error('Node not found for user');
                }

                // Verify package exists
                const pkg = await packageService.findById(packageId, tx);
                if (!pkg) {
                    throw new Error('Package not found');
                }

                // Check for duplicate transaction ID
                const existingPayment = await nodePaymentService.findByTransactionId(trans_id, tx);
                if (existingPayment) {
                    throw new Error('Transaction ID already exists');
                }

                // Create  nodepayment record
                const payment = await nodePaymentService.createMobileMoneyPayment({
                    transactionDetails: trans_id,
                    amount,
                    transactionId: trans_id,
                    reference: trans_id,
                    phone: phone,
                    type: 'MOBILE_MONEY',  
                    packageId,
                    nodeId: node.id,
                    status: 'PENDING',
                },tx);
                console.log('Node Payment created:', {});

                // Create pending statement
                await nodeStatementService.create({
                    nodeId: node.id,
                    amount,
                    type: 'DEBIT',
                    status: 'PENDING',
                    description: `Package purchase payment - ${pkg.name} (Mobile Money)`,
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
            }, { maxWait: 10000, timeout: 15000 });

            // 2. First validate mobile money request before creating payment record
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
                    // Mark payment as FAILED to avoid dangling PENDING
                    try {
                        await nodePaymentService.updateMobileMoneyPaymentStatus(payment.id, 'FAILED');
                    } catch (e) {
                        logger.error('Failed to mark payment FAILED after mobile money error:', { payment_id: payment.id, error: e.message });
                    }
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
                // Mark payment as FAILED to avoid dangling PENDING
                try {
                    await nodePaymentService.updateMobileMoneyPaymentStatus(payment.id, 'FAILED');
                } catch (e) {
                    logger.error('Failed to mark payment FAILED after request error:', { payment_id: payment.id, error: e.message });
                }
                return res.status(400).json({
                    success: false,
                    message: 'Mobile money request failed',
                    error: error.message
                });
            }

          
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
                }, { maxWait: 10000, timeout: 15000 });
            }
            

        } catch (error) {
            logger.error('Payment processing error:', {
                error: error.message,
                stack: error.stack,
                trans_id: req.body?.trans_id
            });

            // Alert admins of payment processing error
            await adminNotificationUtils.systemAlert(
                'Payment Processing Error',
                `Failed to process payment ${req.body.trans_id}. Error: ${error.message}`
            );

            if (!res.headersSent) {
            res.status(500).json({
                success: false,
                    message: error.message || 'Failed to process payment',
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
            expiresAt: addDays(new Date(), 366),
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
            referenceType: 'DEPOSIT',
            referenceId: payment.id,
            completedAt: new Date()
        }, tx);
        

        // Calculate package revenue
        await systemRevenueService.calculatePackageRevenue(payment, payment.package, tx);

        // // Create notification for successful package purchase
        // await notificationService.create({
        //     userId: payment.node.userId,
        //     title: 'Package Purchase Successful',
        //     message: `Your payment of (payment.amount)} for ${payment.package.name} package has been confirmed.`,
        //     type: 'PACKAGE_PURCHASE'
        // }, tx);

        // // Alert admins of payment processing
        // await adminNotificationUtils.systemAlert(
        //     'Payment Processing Successful',
        //     `Payment ID ${payment.id} processed successfully`
        // );

         //give user account activation bonus
         // Only give bonus if this is the user's first successful package payment
       // Give activation bonus

        await userService.verifyUser(payment.node.userId, tx);
           
         
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

            // Verify package exists
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
            // Alert admins of payment processing error
            await adminNotificationUtils.systemAlert(
                'Payment Processing Error',
                `Failed to process upgrade payment ${req.body.trans_id}. Error: ${error.message}`
            );
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to process upgrade payment'
            });
        }
    }
}

module.exports = new PaymentController();