const nodePaymentService = require('../services/nodePayment.service');
const nodePackageService = require('../services/nodePackage.service');
const nodeService = require('../services/node.service');
const packageService = require('../services/package.service');
const nodeStatementService = require('../services/nodeStatement.service');
const commissionService = require('../services/commission.service');
const { validatePayment } = require('../middleware/validate');
const { calculateCommissions } = require('../utils/commission.utils');
const { PrismaClient } = require('@prisma/client');
const UgandaMobileMoneyUtil = require('../utils/ugandaMobileMoney.util');

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
                paymentReference, 
                phoneNumber 
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

            // Mobile money specific validation
            if (paymentMethod === 'MTN_MOBILE_MONEY' || paymentMethod === 'AIRTEL_MONEY') {
                if (!phoneNumber) {
                    return res.status(400).json({
                        success: false,
                        mobileMoneyError: 'Phone number is required for mobile money payment'
                    });
                }

                // Validate phone number format
                const ugandaPhoneRegex = /^(0|\+?256)?(7[0-9]{8})$/;
                if (!ugandaPhoneRegex.test(phoneNumber)) {
                    return res.status(400).json({
                        success: false,
                        mobileMoneyError: 'Invalid Ugandan mobile number'
                    });
                }
            }

            // Process payment in a transaction
            const result = await prisma.$transaction(async (tx) => {
                // Initiate mobile money payment for specific providers
                let mobileMoneyResponse = null;
                if (paymentMethod === 'MTN_MOBILE_MONEY') {
                    const mobileMoneyUtil = new UgandaMobileMoneyUtil('mtn');
                    mobileMoneyResponse = await mobileMoneyUtil.initiateMtnPayment(
                        phoneNumber, 
                        pkg.price, 
                        `PKG_${node.id}_${packageId}`
                    );
                } else if (paymentMethod === 'AIRTEL_MONEY') {
                    const mobileMoneyUtil = new UgandaMobileMoneyUtil('airtel');
                    mobileMoneyResponse = await mobileMoneyUtil.initiateAirtelPayment(
                        phoneNumber, 
                        pkg.price, 
                        `PKG_${node.id}_${packageId}`
                    );
                }

                // Create payment record
                const payment = await nodePaymentService.create({
                    nodeId: node.id,
                    amount: pkg.price,
                    reference: `${paymentMethod}_${mobileMoneyResponse?.data?.referenceId || paymentReference}`,
                    status: mobileMoneyResponse ? 'PENDING' : 'COMPLETED',
                    type: 'PACKAGE_PURCHASE'
                }, tx);

                // For non-mobile money or successful mobile money initiation
                if (!mobileMoneyResponse || mobileMoneyResponse.success) {
                    // Create or update node package
                    const nodePackage = await nodePackageService.create({
                        nodeId: node.id,
                        packageId: pkg.id,
                        status: mobileMoneyResponse ? 'PENDING' : 'ACTIVE'
                    }, tx);

                    // Create statement record
                    const statement = await nodeStatementService.create({
                        nodeId: node.id,
                        amount: pkg.price,
                        type: 'DEBIT',
                        description: `Package purchase: ${pkg.name}`,
                        status: mobileMoneyResponse ? 'PENDING' : 'COMPLETED',
                        referenceType: 'PACKAGE',
                        referenceId: nodePackage.id
                    }, tx);

                    // Calculate and create commissions if not a pending mobile money payment
                    if (!mobileMoneyResponse) {
                        const commissions = await calculateCommissions(node.id, pkg.price);
                        await Promise.all(commissions.map(commission => 
                            commissionService.create({
                                ...commission,
                                packageId: pkg.id,
                                status: 'PENDING'
                            }, tx)
                        ));
                    }

                    return {
                        payment,
                        nodePackage,
                        statement,
                        ...(mobileMoneyResponse && { 
                            paymentUrl: mobileMoneyResponse.data.paymentUrl,
                            referenceId: mobileMoneyResponse.data.referenceId 
                        })
                    };
                }

                // Mobile money payment initiation failed
                throw new Error('Mobile money payment initiation failed');
            });

            // Successful response
            res.status(201).json({
                success: true,
                message: 'Payment processed successfully',
                data: result
            });

        } catch (error) {
            console.error('Payment processing error:', error);
            res.status(500).json({
                success: false,
                mobileMoneyError: error.message || 'Error processing payment'
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
            const { error } = validatePayment(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const { currentPackageId, newPackageId, paymentMethod, paymentReference } = req.body;
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
                // Create payment record
                const payment = await nodePaymentService.create({
                    nodeId: node.id,
                    packageId: newPackageId,
                    amount: upgradeCost,
                    paymentReference,
                    status: 'COMPLETED',
                    isUpgrade: true,
                    previousPackageId: currentPackageId
                }, tx);

                // Create upgrade package record
                const nodePackage = await nodePackageService.createUpgrade(
                    node.id,
                    newPackageId,
                    currentPackageId,
                    { paymentReference }
                );

                // Create statement record
                const statement = await nodeStatementService.create({
                    nodeId: node.id,
                    amount: upgradeCost,
                    type: 'DEBIT',
                    description: `Package upgrade: ${currentPackage.package.name} to ${newPackage.name}`,
                    status: 'COMPLETED',
                    referenceType: 'PACKAGE_UPGRADE',
                    referenceId: nodePackage.id
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
                    nodePackage,
                    statement
                };
            });

            res.status(201).json({
                success: true,
                message: 'Upgrade payment processed successfully',
                data: result
            });

        } catch (error) {
            console.error('Upgrade payment processing error:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing upgrade payment'
            });
        }
    }

    /**
     * Get payment history
     * @param {Request} req 
     * @param {Response} res 
     */
    async getPaymentHistory(req, res) {
        try {
            const userId = req.user.id;
            const { startDate, endDate, type } = req.query;

            const node = await nodeService.findByUserId(userId);
            if (!node) {
                return res.status(404).json({
                    success: false,
                    message: 'Node not found for user'
                });
            }

            const payments = await nodePaymentService.findAll(node.id, {
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                type
            });

            res.json({
                success: true,
                data: payments
            });

        } catch (error) {
            console.error('Get payment history error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving payment history'
            });
        }
    }
}

module.exports = new PaymentController();
