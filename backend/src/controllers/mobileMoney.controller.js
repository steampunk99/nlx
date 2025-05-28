const { PrismaClient } = require('@prisma/client');
const logger = require('../services/logger.service');
const nodePaymentService = require('../services/nodePayment.service');
const nodePackageService = require('../services/nodePackage.service');
const commissionService = require('../services/commission.service');
const commissionUtil = require('../utils/commission.utils');
const paymentController = require('./payment.controller');
const nodeStatementService = require('../services/nodeStatement.service');

const prisma = new PrismaClient();

class MobileMoneyCallbackController {

  async checkPaymentStatus(req, res) {
    const { trans_id } = req.body;

    if (!trans_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing transaction ID'
      });
    }

    try {
      logger.info('Checking payment status:', { trans_id });
      
      const payment = await nodePaymentService.findByTransactionId(trans_id);
      
      if (!payment) {
        logger.info('Payment not found yet:', { trans_id });
        return res.status(200).json({
          success: true,
          data: { 
            trans_id,
            status: 'PENDING',
            message: 'Payment processing initiated'
          }
        });
      }

      logger.info('Payment status check:', {
        trans_id,
        status: payment.status,
        payment_id: payment.id
      });

      // Get associated node package if payment is successful
      let nodePackage = null;
      if (payment.status === 'SUCCESSFUL') {
        nodePackage = await prisma.nodePackage.findUnique({
          where: { nodeId: payment.nodeId },
          include: { node: true }
        });
      }

      return res.status(200).json({
        success: true,
        
        trans_id,
          status: payment.status,
          payment_id: payment.id,
        
      });

    } catch (error) {
      logger.error('Status check error:', {
        trans_id,
        error: error.message,
        stack: error.stack
      });
      return res.status(500).json({
        success: false,
        message: 'Error checking payment status'
      });
    }
  }


  async handleCallback(req, res) {
    const { status, type, trans_id } = req.body;

    // Basic validation
    if (!trans_id || !status || !type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    logger.info('📥 Webhook:', { trans_id, status, type });

    // Handle PENDING status early
    if (status === 'PENDING') {
      return res.status(200).json({
        success: true,
        message: 'Pending status acknowledged'
      });
    }

    try {
      if (type === 'WITHDRAW') {
        // --- WITHDRAWAL CALLBACK LOGIC ---
        // Find withdrawal and nodeWithdrawal by transactionId
        const withdrawal = await prisma.withdrawal.findUnique({ where: { transactionId: trans_id } });
        const nodeWithdrawal = await prisma.nodeWithdrawal.findUnique({ where: { transactionId: trans_id } });

        if (!withdrawal || !nodeWithdrawal) {
          logger.warn('Withdrawal or NodeWithdrawal not found for webhook', { trans_id });
          return res.status(200).json({ success: true, message: 'Acknowledged' });
        }

        // Idempotency: Only update if not already terminal
        const terminalStatuses = ['SUCCESSFUL', 'FAILED', 'CANCELLED', 'REJECTED'];
        if (terminalStatuses.includes(withdrawal.status)) {
          logger.info('Withdrawal already in terminal state, skipping update', { trans_id, status: withdrawal.status });
          return res.status(200).json({ success: true, message: 'Already processed' });
        }

        await prisma.$transaction(async (tx) => {
          // Find node and statements
          const node = await tx.node.findUnique({ where: { id: nodeWithdrawal.nodeId } });
          const nodeStatements = await tx.nodeStatement.findMany({
            where: {
              referenceType: 'WITHDRAWAL',
              referenceId: withdrawal.id
            }
          });

          if (status === 'SUCCESSFUL') {
            // Update withdrawal, nodeWithdrawal, nodeStatement, decrement balance
            
            await Promise.all([
              tx.withdrawal.update({
                where: { id: withdrawal.id },
                data: {
                  status: 'SUCCESSFUL',
                  details: {
                    ...withdrawal.details,
                    webhookStatus: 'SUCCESSFUL',
                    createdAt: new Date()
                  }
                }
              }),
              tx.nodeWithdrawal.update({
                where: { id: nodeWithdrawal.id },
                data: {
                  status: 'SUCCESSFUL',
                  createdAt: new Date()
                }
              }),
              tx.nodeStatement.updateMany({
                where: {
                  referenceType: 'WITHDRAWAL',
                  referenceId: withdrawal.id
                },
                data: {
                  status: 'SUCCESSFUL',
                  createdAt: new Date()
                }
              }),
              // Only decrement if not already decremented (idempotency)
              node && node.availableBalance >= withdrawal.amount
                ? tx.node.update({
                    where: { id: node.id },
                    data: {
                      availableBalance: { decrement: withdrawal.amount },
                      updatedAt: new Date()
                    }
                  })
                : Promise.resolve()
            ]);
            // Notification (outside tx for reliability)
            setImmediate(() => {
              require('../services/notification.service').create({
                userId: withdrawal.userId,
                title: 'Withdrawal Successful',
                message: `Your withdrawal request of ${withdrawal.amount} has been completed successfully!`,
                type: 'WITHDRAWAL_SUCCESS'
              });
            });
            logger.info('✅ Withdrawal marked as SUCCESSFUL', { withdrawalId: withdrawal.id, trans_id });
          } else if (status === 'FAILED') {
            await Promise.all([
              tx.withdrawal.update({
                where: { id: withdrawal.id },
                data: {
                  status: 'FAILED',
                  details: {
                    ...withdrawal.details,
                    webhookStatus: 'FAILED',
                    failureReason: req.body.message || 'Withdrawal failed',
                    failedAt: new Date()
                  }
                }
              }),
              tx.nodeWithdrawal.update({
                where: { id: nodeWithdrawal.id },
                data: {
                  status: 'FAILED',
                  reason: req.body.message || 'Withdrawal failed'
                }
              }),
              tx.nodeStatement.updateMany({
                where: {
                  referenceType: 'WITHDRAWAL',
                  referenceId: withdrawal.id
                },
                data: {
                  status: 'FAILED',
                  description: `Withdrawal failed: ${req.body.message || 'Withdrawal failed'}`
                }
              })
            ]);
            setImmediate(() => {
              require('../services/notification.service').create({
                userId: withdrawal.userId,
                title: 'Withdrawal Failed',
                message: `Your withdrawal request of ${withdrawal.amount} has failed. Please contact support if you need assistance.`,
                type: 'WITHDRAWAL_FAILED'
              });
            });
            logger.info('❌ Withdrawal marked as FAILED', { withdrawalId: withdrawal.id, trans_id });
          } else {
            logger.warn('⚠️ Unknown withdrawal status in webhook', { trans_id, status });
          }
        }, { timeout: 15000 }); // 15s timeout for withdrawal tx

        return res.status(200).json({
          success: true,
          message: `Withdrawal status updated: ${status}`
        });
      }
      // Find our payment
      const payment = await nodePaymentService.findByTransactionId(trans_id);
      // If not our transaction, acknowledge and return
      if (!payment) {
        return res.status(200).json({
          success: true,
          message: 'Acknowledged'
        });
      }
      // Process our payment status
      if (status === 'SUCCESSFUL') {
        await prisma.$transaction(async (tx) => {
          const updatedPayment = await paymentController.processSuccessfulPayment(payment.id, tx);
          const nodePackage = await nodePackageService.activatePackageForPayment(updatedPayment, tx);
          await commissionUtil.calculateCommissions(payment.nodeId, payment.amount, payment.packageId, tx);
          logger.info('✅ Payment processed:', {
            payment_id: payment.id,
            trans_id,
            package_id: nodePackage.id
          });
        }, { timeout: 150000 });
        return res.status(200).json({
          success: true,
          message: 'Payment processed successfully'
        });
      }
      if (status === 'FAILED') {
        await nodePaymentService.updateStatus(payment.id, 'FAILED');
        await nodeStatementService.create({
          nodeId: payment.nodeId,
          amount: payment.amount,
          type: 'DEBIT',
          status: 'FAILED',
          paymentId: payment.id,
          referenceType: 'DEPOSIT',
          referenceId: payment.id,
        });
        logger.info('❌ Payment failed:', {
          payment_id: payment.id,
          trans_id
        });
        return res.status(200).json({
          success: true,
          message: 'Payment marked as failed'
        });
      }
      logger.warn('⚠️ Unknown payment status:', { 
        trans_id, 
        status,
        payment_id: payment.id 
      });
      return res.status(200).json({
        success: true,
        message: 'Status acknowledged'
      });
    } catch (error) {
      logger.error('💥 Error processing callback:', {
        trans_id,
        error: error.message
      });
      return res.status(200).json({
        success: true,
        message: 'Webhook received'
      });
    }
  }

}

module.exports = new MobileMoneyCallbackController();