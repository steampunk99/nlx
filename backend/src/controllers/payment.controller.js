const nodePaymentService = require('../services/nodePayment.service');
const nodePackageService = require('../services/nodePackage.service');
const nodeService = require('../services/node.service');
const packageService = require('../services/package.service');
const nodeStatementService = require('../services/nodeStatement.service');
const commissionService = require('../services/commission.service');
const { calculateCommissions } = require('../utils/commission.utils');
const { PrismaClient } = require('@prisma/client');
const mobileMoneyUtil = require('../utils/ugandaMobileMoneyUtil');

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
            console.log("Step 1: package details",pkg)
         
            if (!pkg) {
                return res.status(400).json({
                    success: false,
                    message: 'Package not found'
                });
            }

            // Get node details
            const node = await nodeService.findByUserId(userId);
            console.log('Step 2 - node details',node);
            if (!node) {
                return res.status(404).json({
                    success: false,
                    message: 'Node not found for user'
                });
            }

            console.log("Initializing transaction..")

            // Start transaction
            const result = await prisma.$transaction(async (tx) => {
                // Create payment record with trans_id
                const payment = await nodePaymentService.createMobileMoneyPayment({
                    transactionDetails:trans_id,  // This will be used to match the callback
                    amount,
                    reference:trans_id,
                    phoneNumber:phone,
                    packageId,
                    nodeId: node.id,
                    status: 'PENDING'
                }, tx);

                try {
                    // Initiate mobile money request
                    const mobileMoneyResponse = await mobileMoneyUtil.requestToPay({
                        amount,
                        phone,
                        trans_id,  // Script Networks will return this
                    });
                    console.log("Mobile money response",mobileMoneyResponse)

                    //webhook response
                    const webhookResponse = await mobileMoneyUtil.webhookResponse(mobileMoneyResponse.trans_id);
                    console.log('webhook response in payment controller', webhookResponse)
                    return {
                        trans_id,  // Return this for frontend polling
                        status: webhookResponse.status,
                        mobileMoneyResponse,
                        webhookResponse
                    };

                } catch (error) {
                    await nodePaymentService.updateMobileMoneyPaymentStatus(
                        payment.id, 
                        'FAILED', 
                        tx
                    );
                    throw error;
                }
            });

            // Return trans_id for polling mobile money
            //include mobile money response
            return res.status(201).json({
                success: true,
                data: {
                    trans_id: result.trans_id,
                    status: 'PENDING',
                    mobileMoneyResponse: result.mobileMoneyResponse,
                    webhookResponse: result.webhookResponse
                }
            });

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
               
                const mobileMoneyUtil = new UgandaMobileMoneyUtil();

                // Prepare payment request
                const paymentRequest = {
                    amount: upgradeCost,
                    phone: req.body.phoneNumber,
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
                    reference: paymentResponse.trans_id,
                    status: 'PENDING',
                    type: 'PACKAGE_UPGRADE',
                    paymentMethod: 'MTN_MOBILE',
                    transactionDetails: {
                        phone: req.body.phone,
                        
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

               

                return {
                    payment,
                    statement,
                    transactionId: paymentResponse.trans_id
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

 
}



module.exports = new PaymentController();
