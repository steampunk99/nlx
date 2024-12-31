const { PrismaClient } = require('@prisma/client');
const logger = require('../services/logger.service');
const nodePaymentService = require('../services/nodePayment.service');
const nodePackageService = require('../services/nodePackage.service');
const paymentController = require('./payment.controller');
const { calculateCommissions } = require('../utils/commission.utils');

const prisma = new PrismaClient();

class MobileMoneyCallbackController {
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
          
          logger.info('📦 Package activated:', {
            nodePackageId: nodePackage.id,
            status: nodePackage.status,
            trans_id
          });
          
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