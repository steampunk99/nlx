const nodePaymentService = require('../services/nodePayment.service');
const nodePackageService = require('../services/nodePackage.service');
const nodeService = require('../services/node.service');
const packageService = require('../services/package.service');
const nodeStatementService = require('../services/nodeStatement.service');
const commissionService = require('../services/commission.service');
const { calculateCommissions } = require('../utils/commission.utils');
const { PrismaClient } = require('@prisma/client');
const mobileMoneyUtil = require('../utils/ugandaMobileMoneyUtil');
const { Prisma } = require('@prisma/client');

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
                trans_id, 
                amount,
                phone,
                packageId
            } = req.body;
    
            const userId = req.user.id;
    
            // Get package details
            const pkg = await packageService.findById(packageId);
            if (!pkg) {
                return res.status(400).json({
                    success: false,
                    message: 'Package not found'
                });
            }
    
            // Get node details
            const node = await nodeService.findByUserId(userId);
            if (!node) {
                return res.status(404).json({
                    success: false,
                    message: 'Node not found for user'
                });
            }
    
            // Create initial payment record with longer transaction timeout
            const result = await prisma.$transaction(async (tx) => {
                // Create payment record
                const payment = await nodePaymentService.createMobileMoneyPayment({
                    transactionDetails: trans_id,
                    amount,
                    reference: trans_id,
                    phoneNumber: phone,
                    packageId,
                    nodeId: node.id,
                    status: 'PENDING'
                }, tx);
    
                return payment;
            }, {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
                timeout: 30000 // 30 seconds timeout for DB operations
            });
    
            // Initiate mobile money request outside transaction
            try {
                // Initiate mobile money request
                const mobileMoneyResponse = await mobileMoneyUtil.requestToPay({
                    amount,
                    phone,
                    trans_id,
                });
    
                // Get webhook response
                const webhookResponse = await mobileMoneyUtil.webhookResponse(mobileMoneyResponse.trans_id);
    
                // Return early response to prevent timeout
                res.status(201).json({
                    success: true,
                    data: {
                        trans_id: result.trans_id,
                        status: 'PENDING',
                        mobileMoneyResponse,
                        webhookResponse
                    }
                });
    
                // Process webhook response asynchronously
                if (webhookResponse.status === 'FAILED') {
                    await nodePaymentService.updateMobileMoneyPaymentStatus(
                        result.id,
                        'FAILED'
                    );
                }
    
            } catch (error) {
                // Update payment status if mobile money request fails
                await nodePaymentService.updateMobileMoneyPaymentStatus(
                    result.id,
                    'FAILED'
                );
    
                return res.status(500).json({
                    success: false,
                    message: 'Payment processing failed',
                    error: error.message
                });
            }
    
        } catch (error) {
            console.error('Payment processing error:', error);
            return res.status(500).json({
                success: false,
                message: 'Payment processing failed'
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
            const { 
                trans_id,
                currentPackageId, 
                newPackageId,
                amount,
                phone
            } = req.body;

            console.group('Package Upgrade Request');
            console.log('Request Body:', {
                trans_id,
                currentPackageId,
                newPackageId,
                amount,
                phone
            });

            const userId = req.user.id;
            console.log('User ID:', userId);

            // Get node details
            const node = await nodeService.findByUserId(userId);
            console.log('Node found:', node);

            if (!node) {
                console.log('Node not found for user:', userId);
                console.groupEnd();
                return res.status(404).json({
                    success: false,
                    message: 'Node not found for user'
                });
            }

            // Get package details
                    // Get package details
                    console.log('Fetching package details...');
                    console.log('Looking for current package with ID:', currentPackageId);
                    console.log('Looking for new package with ID:', newPackageId);
        
                    // First get the node's current package
                    const currentNodePackage = await nodePackageService.findByNodeId(node.id);
                    console.log('Current Node Package found:', currentNodePackage);
        
                    if (!currentNodePackage || currentNodePackage.packageId !== currentPackageId) {
                        console.log('Current package validation failed:', {
                            packageFound: !!currentNodePackage,
                            currentPackageId: currentNodePackage?.packageId,
                            requestedPackageId: currentPackageId
                        });
                        console.groupEnd();
                        return res.status(404).json({
                            success: false,
                            message: 'Current package not found or does not match your active package'
                        });
                    }
        
                    // Get new package details
                    const newPackage = await packageService.findById(newPackageId);
                    console.log('New Package found:', newPackage);

            // Calculate upgrade cost
            const upgradeCost = newPackage.price - currentNodePackage.package.price;
            console.log('Upgrade cost calculation:', {
                newPackagePrice: newPackage.price,
                currentPackagePrice: currentNodePackage.package.price,
                calculatedCost: upgradeCost,
                providedAmount: amount
            });

            if (upgradeCost <= 0) {
                console.log('Invalid upgrade cost:', upgradeCost);
                console.groupEnd();
                return res.status(400).json({
                    success: false,
                    message: 'Invalid upgrade: new package must be more expensive'
                });
            }

            // Verify amount matches upgrade cost
            if (amount !== upgradeCost) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid amount for upgrade'
                });
            }

            // Create initial payment record with longer transaction timeout
            const result = await prisma.$transaction(async (tx) => {
                // Create payment record
                const payment = await nodePaymentService.createMobileMoneyPayment({
                    transactionDetails: trans_id,
                    amount: upgradeCost,
                    reference: trans_id,
                    phoneNumber: phone,
                    packageId: newPackageId,
                    nodeId: node.id,
                    status: 'PENDING',
                    type: 'PACKAGE_UPGRADE',
                   
                   
                }, tx);

                return payment;
            }, {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
                timeout: 30000 // 30 seconds timeout for DB operations
            });

            // Initiate mobile money request outside transaction
            try {
                // Initiate mobile money request
                const mobileMoneyResponse = await mobileMoneyUtil.requestToPay({
                    amount: upgradeCost,
                    phone,
                    trans_id,
                });

                // Get webhook response
                const webhookResponse = await mobileMoneyUtil.webhookResponse(mobileMoneyResponse.trans_id);

                // Return early response to prevent timeout
                res.status(201).json({
                    success: true,
                    data: {
                        trans_id: result.trans_id,
                        status: 'PENDING',
                        mobileMoneyResponse,
                        webhookResponse
                    }
                });

                // Process webhook response asynchronously
                if (webhookResponse.status === 'FAILED') {
                    await nodePaymentService.updateMobileMoneyPaymentStatus(
                        result.id,
                        'FAILED'
                    );
                }

            } catch (error) {
                // Update payment status if mobile money request fails
                await nodePaymentService.updateMobileMoneyPaymentStatus(
                    result.id,
                    'FAILED'
                );

                return res.status(500).json({
                    success: false,
                    message: 'Payment processing failed',
                    error: error.message
                });
            }

        } catch (error) {
            console.error('Upgrade payment processing error:', error);
            return res.status(500).json({
                success: false,
                message: 'Payment processing failed'
            });
        }
    }

 
}



module.exports = new PaymentController();
