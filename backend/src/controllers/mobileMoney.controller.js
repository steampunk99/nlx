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
      const payment = await nodePaymentService.findByReference(trans_id);
      
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found',
          data: { trans_id }
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          trans_id,
          status: payment.status,
          payment_id: payment.id
        }
      });

    } catch (error) {
      logger.error('Status check error:', {
        trans_id,
        error: error.message
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
      const payment = await nodePaymentService.findByReference(trans_id);
      if (!payment) {
        logger.error('❌ Payment not found:', {
          trans_id,
          error: 'Transaction ID not found in database'
        });
        return res.status(404).json({
          success: false,
          message: `Payment not found: ${trans_id}`
        });
      }

      logger.info('💳 Found payment record:', {
        trans_id,
        amount: payment.amount,
        currentStatus: payment.status
      });

      if (status === 'SUCCESSFUL') {
        logger.info('✅ Processing successful payment:', { trans_id });
        
        await prisma.$transaction(async (tx) => {
          const updatedPayment = await paymentController.processSuccessfulPayment(payment.id);
          const nodePackage = await nodePackageService.activatePackageForPayment(updatedPayment, tx);
          await calculateCommissions(payment.nodeId, payment.amount, tx);
          logger.info('💰 Commissions calculated:', { trans_id });
        });

        logger.info('✨ Payment processing completed:', { trans_id });
        return res.status(200).json({
          success: true,
          data: {
            status: 'COMPLETED',
            trans_id
          }
        });
      } 
      
      if (status === 'FAILED') {
        logger.info('❌ Processing failed payment:', { trans_id });
        await nodePaymentService.updateStatus(payment.id, 'FAILED', trans_id);
        
        return res.status(200).json({
          success: true,
          data: {
            status: 'FAILED',
            trans_id
          }
        });
      }

    } catch (error) {
      logger.error('💥 Error processing webhook:', {
        trans_id,
        error: error.message,
        stack: error.stack
      });
      return res.status(200).json({
        success: false,
        message: 'Error processing callback',
        data: {
          status: 'FAILED',
          trans_id
        }
      });
    }
  }

}

module.exports = new MobileMoneyCallbackController();