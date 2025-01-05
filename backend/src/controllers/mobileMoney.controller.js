const { PrismaClient } = require('@prisma/client');
const logger = require('../services/logger.service');
const nodePaymentService = require('../services/nodePayment.service');
const nodePackageService = require('../services/nodePackage.service');
const commissionService = require('../services/commission.service');
const { calculateCommissions } = require('../utils/commission.utils');
const paymentController = require('./payment.controller');

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
      
      const payment = await nodePaymentService.findByReference(trans_id);
      
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
        data: {
          trans_id,
          status: payment.status,
          payment_id: payment.id,
          node_status: nodePackage?.node?.status,
          package_status: nodePackage?.status
        }
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

    logger.info('📥 Webhook Request Received:', {
      trans_id,
      status,
      type,
      timestamp: new Date().toISOString()
    });

    // If it's a PENDING status, just acknowledge without processing
    if (status === 'PENDING') {
      logger.info('⏳ Ignoring PENDING status webhook:', { trans_id });
      return res.status(200).json({
        success: true,
        message: 'Pending status acknowledged'
      });
    }

    try {
      // Process everything in a single transaction
      const result = await prisma.$transaction(async (tx) => {
        const payment = await nodePaymentService.findByReference(trans_id, tx);
        if (!payment) {
          logger.error('❌ Payment not found:', {
            trans_id,
            error: 'Transaction ID not found in database'
          });
          throw new Error(`Payment not found: ${trans_id}`);
        }

        // Check if payment is already in final state
        if (payment.status === 'SUCCESSFUL' || payment.status === 'FAILED') {
          logger.info('⚠️ Payment already processed:', {
            trans_id,
            currentStatus: payment.status
          });
          return { payment, alreadyProcessed: true };
        }

        logger.info('💳 Processing payment:', {
          trans_id,
          amount: payment.amount,
          currentStatus: payment.status,
          newStatus: status
        });

        if (status === 'SUCCESSFUL') {
          logger.info('✅ Processing successful payment:', { trans_id });
          
          // Process successful payment (creates nodePackage and updates statuses)
          const updatedPayment = await paymentController.processSuccessfulPayment(payment.id, tx);
          
          logger.info('💰 Payment processed successfully:', { 
            trans_id,
            payment_id: payment.id
          });

          return { payment: updatedPayment };
        } else if (status === 'FAILED') {
          logger.info('❌ Processing failed payment:', { trans_id });
          
          const updatedPayment = await nodePaymentService.updateMobileMoneyPaymentStatus(payment.id, 'FAILED', tx);
          return { payment: updatedPayment };
        }

        throw new Error(`Invalid payment status: ${status}`);
      });

      // Send response based on processing result
      if (result.alreadyProcessed) {
        return res.status(200).json({
          success: true,
          message: 'Payment already processed',
          data: { 
            trans_id,
            status: result.payment.status
          }
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Payment processed successfully',
        data: {
          trans_id,
          status: result.payment.status,
          payment_id: result.payment.id
        }
      });

    } catch (error) {
      logger.error('💥 Callback processing error:', {
        trans_id,
        error: error.message,
        stack: error.stack
      });

      return res.status(error.message.includes('Payment not found') ? 404 : 500).json({
        success: false,
        message: error.message.includes('Payment not found') ? 
          error.message : 
          'Error processing payment callback'
      });
    }
  }

}

module.exports = new MobileMoneyCallbackController();