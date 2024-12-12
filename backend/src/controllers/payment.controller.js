const nodePaymentService = require('../services/nodePayment.service');
const nodePackageService = require('../services/nodePackage.service');
const nodeService = require('../services/node.service');
const packageService = require('../services/package.service');
const nodeStatementService = require('../services/nodeStatement.service');
const commissionService = require('../services/commission.service');
const { calculateCommissions } = require('../utils/commission.utils');
const { PrismaClient } = require('@prisma/client');
const UgandaMobileMoneyUtil = require('../utils/ugandaMobileMoneyUtil');

const prisma = new PrismaClient();

class PaymentController {
    /**
     * Process package purchase payment
     * @param {Request} req 
     * @param {Response} res 
     */
    async processPackagePayment(req, res) {
        try {
            const { 
                packageId, 
                paymentMethod,
                phoneNumber
            } = req.body;
            const userId = req.user.id;
            console.log('packageId',packageId);
            console.log('paymentMethod',paymentMethod);
            console.log('phoneNumber',phoneNumber);
            console.log('userId',userId);
            

            // Validate payment method
            if (!['MTN_MOBILE', 'AIRTEL_MONEY'].includes(paymentMethod)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid payment method'
                });
            }

            // Get package details
            const pkg = await packageService.findById(packageId);
            console.log('package details',pkg);
            if (!pkg) {
                return res.status(400).json({
                    success: false,
                    message: 'Package not found'
                });
            }

            // Get node details
            const node = await nodeService.findByUserId(userId);
            console.log('node details',node);
            if (!node) {
                return res.status(404).json({
                    success: false,
                    message: 'Node not found for user'
                });
            }

            console.log("Initializing transaction..")

            // Process payment in a transaction
            const result = await prisma.$transaction(async (tx) => {

                      // Check existing package status
        const existingPackage = await nodePackageService.findByNodeId(node.id);
        if (existingPackage) {
                    if (existingPackage.status === 'ACTIVE') {
                        return res.status(400).json({
                            success: false,
                            message: 'Node already has an active package'
                        });
                } else if (existingPackage.status === 'PENDING') {
                    return res.status(400).json({
                        success: false,
                        message: 'Node has a pending package purchase'
                    });
                }
            }

                // Initialize mobile money utility
                const provider = paymentMethod === 'MTN_MOBILE' ? 'mtn' : 'airtel';
                const mobileMoneyUtil = new UgandaMobileMoneyUtil(provider);

                // Prepare payment request
                const paymentRequest = {
                    amount: pkg.price,
                    phoneNumber,
                    externalId: `PKG_${node.id}_${packageId}`,
                    description: `Package Purchase: ${pkg.name}`
                };

                   // Request payment with timeout
                   const paymentResponse = await Promise.race([
                    provider === 'mtn' 
                        ? mobileMoneyUtil.requestToPay(paymentRequest)
                        : mobileMoneyUtil.collectPayment(paymentRequest),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Payment request timeout')), 30000)
                    )
                ]);

                // Create payment record
                const payment = await nodePaymentService.create({
                    nodeId: node.id,
                    amount: pkg.price,
                    reference: paymentResponse.referenceId,
                    status: 'PENDING',
                    type: 'PACKAGE_PURCHASE',
                    paymentMethod,
                    transactionDetails: {
                        initiatedAt: new Date(),
                        provider,
                        requestId: paymentResponse.referenceId,
                        packageDetails: {
                            id: pkg.id,
                            name: pkg.name,
                            price: pkg.price
                        }
                    }
                }, tx);

                console.log("Payment initiated, Enter pin to complete payment",payment);

                // Create pending node package
                const nodePackage = await nodePackageService.create({
                    nodeId: node.id,
                    packageId: pkg.id,
                    status: 'PENDING'
                }, tx);

                // Create statement record
                const statement = await nodeStatementService.create({
                    nodeId: node.id,
                    amount: pkg.price,
                    type: 'DEBIT',
                    description: `Package purchase: ${pkg.name}`,
                    status: 'PENDING',
                    referenceType: 'PACKAGE',
                    referenceId: nodePackage.id
                }, tx);

                return {
                    payment,
                    nodePackage,
                    statement,
                    transactionId: paymentResponse.referenceId
                };
            });

            res.status(201).json({
                success: true,
                message: 'Payment initiated successfully',
                data: {
                    transactionId: result.transactionId,
                    paymentId: result.payment.id
                }
            });
            // update node package status to paid
            await nodePackageService.update(result.nodePackage.id, {
                status: 'PAID',
                activatedAt: new Date()
            });

            // update statement status to paid
            await nodeStatementService.update(result.statement.id, {
                status: 'PAID',
                completedAt: new Date()
            });

    

        } catch (error) {
            console.error('Payment processing error:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing payment',
                error: error.message
            });
        }
    }

    /**
     * Process package upgrade payment
     * @param {Request} req 
     * @param {Response} res 
     */
    async processUpgradePayment(req, res) {
        try {
            const { currentPackageId, newPackageId } = req.body;
            const userId = req.user.id;

            // Get node details
            const node = await nodeService.findByUserId(userId);
            if (!node) {
                return res.status(404).json({
                    success: false,
                    message: 'Node not found for user'
                });
            }

            // Get package details
            const [currentPackage, newPackage] = await Promise.all([
                nodePackageService.findById(currentPackageId),
                packageService.findById(newPackageId)
            ]);

            if (!currentPackage || currentPackage.nodeId !== node.id) {
                return res.status(404).json({
                    success: false,
                    message: 'Current package not found'
                });
            }

            if (!newPackage) {
                return res.status(404).json({
                    success: false,
                    message: 'New package not found'
                });
            }

            // Calculate upgrade cost
            const upgradeCost = newPackage.price - currentPackage.package.price;
            if (upgradeCost <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid upgrade: new package must be more expensive'
                });
            }

            // Process upgrade payment in a transaction
            const result = await prisma.$transaction(async (tx) => {
                // Initialize mobile money utility
                const provider = 'mtn'; // default to mtn for now
                const mobileMoneyUtil = new UgandaMobileMoneyUtil(provider);

                // Prepare payment request
                const paymentRequest = {
                    amount: upgradeCost,
                    phoneNumber: req.body.phoneNumber,
                    externalId: `UPGRADE_${node.id}_${currentPackageId}_${newPackageId}`,
                    description: `Package Upgrade: ${currentPackage.package.name} to ${newPackage.name}`
                };

                // Request payment
                const paymentResponse = await mobileMoneyUtil.requestToPay(paymentRequest);

                // Create payment record
                const payment = await nodePaymentService.create({
                    nodeId: node.id,
                    packageId: newPackageId,
                    amount: upgradeCost,
                    reference: paymentResponse.referenceId,
                    status: 'PENDING',
                    type: 'PACKAGE_UPGRADE',
                    paymentMethod: 'MTN_MOBILE',
                    transactionDetails: {
                        phoneNumber: req.body.phoneNumber,
                        provider,
                        ...paymentResponse
                    },
                    isUpgrade: true,
                    previousPackageId: currentPackageId
                }, tx);

                // Create statement record
                const statement = await nodeStatementService.create({
                    nodeId: node.id,
                    amount: upgradeCost,
                    type: 'DEBIT',
                    description: `Package upgrade: ${currentPackage.package.name} to ${newPackage.name}`,
                    status: 'PENDING',
                    referenceType: 'PACKAGE_UPGRADE',
                    referenceId: payment.id
                }, tx);

                // Calculate and create upgrade commissions
                const commissions = await calculateCommissions(node.id, upgradeCost);
                await Promise.all(commissions.map(commission => 
                    commissionService.create({
                        ...commission,
                        packageId: newPackageId,
                        status: 'PENDING',
                        type: 'UPGRADE'
                    }, tx)
                ));

                return {
                    payment,
                    statement,
                    transactionId: paymentResponse.referenceId
                };
            });

            res.status(201).json({
                success: true,
                message: 'Upgrade payment initiated',
                data: {
                    transactionId: result.transactionId,
                    paymentId: result.payment.id
                }
            });

        } catch (error) {
            console.error('Upgrade payment processing error:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing upgrade payment',
                error: error.message
            });
        }
    }

    /**
     * Handle mobile money callback
     */
    async handleMobileMoneyCallback(req, res) {
        try {
            const { provider } = req.params;
            const callbackData = req.body;

            console.log('Received callback:', { provider, callbackData });

            // Validate provider
            if (!['mtn', 'airtel'].includes(provider)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid provider'
                });
            }

            // Initialize mobile money utility
            const mobileMoneyUtil = new UgandaMobileMoneyUtil(provider);
            const referenceId = callbackData.referenceId || callbackData.transactionId;

            // Get payment details
            const payment = await nodePaymentService.findByReference(referenceId);
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            // Process based on status
            if (callbackData.status === 'SUCCESSFUL' || callbackData.status === 'COMPLETED') {
                await prisma.$transaction(async (tx) => {
                    // Update payment status
                    await nodePaymentService.update(payment.id, {
                        status: 'COMPLETED',
                        completedAt: new Date()
                    }, tx);

                    // Activate package if it's a package purchase
                    if (payment.type === 'PACKAGE_PURCHASE') {
                        await nodePackageService.update(payment.nodePackageId, {
                            status: 'ACTIVE',
                            activatedAt: new Date()
                        }, tx);
                    }

                    // Update statement
                    await nodeStatementService.update(payment.statementId, {
                        status: 'COMPLETED'
                    }, tx);

                    // Process commissions if needed
                    if (payment.type === 'PACKAGE_PURCHASE') {
                        await calculateCommissions(payment.nodeId, payment.amount, tx);
                    }
                });
            } else if (callbackData.status === 'FAILED') {
                await prisma.$transaction(async (tx) => {
                    // Update payment status
                    await nodePaymentService.update(payment.id, {
                        status: 'FAILED',
                        completedAt: new Date()
                    }, tx);

                    // Cancel package if it's a package purchase
                    if (payment.type === 'PACKAGE_PURCHASE') {
                        await nodePackageService.update(payment.nodePackageId, {
                            status: 'CANCELLED'
                        }, tx);
                    }

                    // Update statement
                    await nodeStatementService.update(payment.statementId, {
                        status: 'FAILED'
                    }, tx);
                });
            }

            res.status(200).json({ 
                success: true,
                message: 'Callback processed successfully'
            });

        } catch (error) {
            console.error('Mobile money callback error:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing callback',
                error: error.message
            });
        }
    }

    /**
     * Check payment status
     * @param {Request} req 
     * @param {Response} res 
     */
    async checkPaymentStatus(req, res) {
        try {
            const { paymentId } = req.params;
            
            // Convert paymentId to integer
            const id = parseInt(paymentId, 10);
            
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid payment ID format'
                });
            }

            const payment = await nodePaymentService.findById(id);
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            // Initialize mobile money utility
            const provider = payment.paymentMethod.startsWith('MTN') ? 'mtn' : 'airtel';
            const mobileMoneyUtil = new UgandaMobileMoneyUtil(provider);

            // Check transaction status
            const transactionStatus = await mobileMoneyUtil.checkTransactionStatus(payment.reference);

            res.status(200).json({
                success: true,
                data: {
                    paymentId: payment.id,
                    status: payment.status,
                    mtnStatus: transactionStatus.status,
                    transactionId: payment.reference,
                    amount: payment.amount,
                    paymentMethod: payment.paymentMethod,
                    createdAt: payment.createdAt,
                    completedAt: payment.completedAt
                }
            });

        } catch (error) {
            console.error('Error checking payment status:', error);
            res.status(500).json({
                success: false,
                message: 'Error checking payment status',
                error: error.message
            });
        }
    }
}



module.exports = new PaymentController();
