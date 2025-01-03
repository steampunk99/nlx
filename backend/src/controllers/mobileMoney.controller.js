const { PrismaClient } = require('@prisma/client');
const logger = require('../services/logger.service');
const nodePaymentService = require('../services/nodePayment.service');
const nodePackageService = require('../services/nodePackage.service');
const paymentController = require('./payment.controller');
const { calculateCommissions } = require('../utils/commission.utils');

const prisma = new PrismaClient();

class MobileMoneyController {
  /**
   * Handle status check requests from frontend
   */
  async checkPaymentStatus(req, res) {
    const { trans_id } = req.body;

    if (!trans_id) {
      logger.warn('❌ Status check: Missing transaction ID');
      return res.status(400).json({
        success: false,
        message: 'Missing transaction ID'
      });
    }

    try {
      const payment = await nodePaymentService.findByReference(trans_id);
      
      if (!payment) {
        logger.warn('❌ Status check: Payment not found:', { trans_id });
        return res.status(404).json({
          success: false,
          message: 'Payment not found',
          data: { trans_id }
        });
      }

      logger.info('🔍 Status check:', {
        trans_id,
        status: payment.status,
        timestamp: new Date().toISOString()
      });

      return res.status(200).json({
        success: true,
        data: {
          trans_id,
          status: payment.status
        }
      });

    } catch (error) {
      logger.error('💥 Status check error:', {
        trans_id,
        error: error.message
      });
      return res.status(500).json({
        success: false,
        message: 'Error checking payment status'
      });
    }
  }

  /**
   * Handle webhook callbacks from Script Networks
   */
  async handleCallback(req, res) {
    logger.info('📥 WEBHOOK: Received callback from Script Networks:', {
      body: JSON.stringify(req.body, null, 2),
      headers: req.headers,
      timestamp: new Date().toISOString()
    });

    const { trans_id, status, type } = req.body;

    if (!trans_id || !status) {
      logger.error('❌ WEBHOOK: Missing required fields:', {
        hasTransId: !!trans_id,
        hasStatus: !!status,
        body: req.body
      });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Map Script Networks status to our status
    let paymentStatus;
    if (status === 'SUCCESS' || status === 'SUCCESSFUL') {
      paymentStatus = 'SUCCESSFUL';
    } else if (status === 'FAILED' || status === 'FAILURE') {
      paymentStatus = 'FAILED';
    } else if (status === 'CANCELLED') {
      paymentStatus = 'CANCELLED';
    } else {
      paymentStatus = 'PENDING';
    }

    logger.info('📊 WEBHOOK: Processing payment:', {
      trans_id,
      originalStatus: status,
      mappedStatus: paymentStatus,
      type,
      timestamp: new Date().toISOString()
    });

    try {
      const payment = await nodePaymentService.findByReference(trans_id);
      
      if (!payment) {
        logger.error('❌ WEBHOOK: Payment not found:', { trans_id });
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      // Don't process if payment is already in a final state
      if (payment.status === 'SUCCESSFUL' || payment.status === 'CANCELLED') {
        logger.info('⚠️ WEBHOOK: Payment already processed:', { 
          trans_id,
          currentStatus: payment.status 
        });
        return res.status(200).json({
          success: true,
          message: 'Payment already processed',
          data: { status: payment.status }
        });
      }

      // Process based on status
      switch(paymentStatus) {
        case 'SUCCESSFUL':
          logger.info('✅ WEBHOOK: Processing successful payment:', { trans_id });
          
          await prisma.$transaction(async (tx) => {
            const updatedPayment = await paymentController.processSuccessfulPayment(payment.id);
            const nodePackage = await nodePackageService.activatePackageForPayment(updatedPayment, tx);
            
            logger.info('📦 WEBHOOK: Package activated:', {
              nodePackageId: nodePackage.id,
              status: nodePackage.status
            });
            
            await calculateCommissions(payment.nodeId, payment.amount, tx);
            logger.info('💰 WEBHOOK: Commissions calculated');
          });

          logger.info('✨ WEBHOOK: Payment processing completed:', { trans_id });
          break;

        case 'FAILED':
        case 'CANCELLED':
          logger.info(`❌ WEBHOOK: Processing ${paymentStatus.toLowerCase()} payment:`, { trans_id });
          await nodePaymentService.updateStatus(payment.id, paymentStatus, trans_id);
          break;

        default:
          logger.warn('⚠️ WEBHOOK: Unhandled payment status:', { 
            status: paymentStatus,
            trans_id 
          });
      }

      return res.status(200).json({
        success: true,
        message: 'Webhook processed',
        data: {
          trans_id,
          status: paymentStatus
        }
      });

    } catch (error) {
      logger.error('💥 WEBHOOK: Error processing payment:', {
        trans_id,
        error: error.message,
        stack: error.stack
      });
      
      return res.status(500).json({
        success: false,
        message: 'Error processing payment'
      });
    }
  }
}

module.exports = new MobileMoneyController();