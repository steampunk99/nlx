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

    // Log incoming webhook
    logger.info('📥 Webhook:', { trans_id, status, type });

    // Handle PENDING status early
    if (status === 'PENDING') {
      return res.status(200).json({
        success: true,
        message: 'Pending status acknowledged'
      });
    }

    try {
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
          // Use the transaction context for all operations, including commissions
          const updatedPayment = await paymentController.processSuccessfulPayment(payment.id, tx);
          const nodePackage = await nodePackageService.activatePackageForPayment(updatedPayment, tx);
          await commissionUtil.calculateCommissions(payment.nodeId, payment.amount, payment.packageId, tx);
          logger.info('✅ Payment processed:', {
            payment_id: payment.id,
            trans_id,
            package_id: nodePackage.id
          });
        }, { timeout: 150000 }); // Set transaction timeout to 1.5 minute

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

      // Unknown status
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
      logger.error('💥 Error processing payment:', {
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