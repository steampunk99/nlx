const { PrismaClient } = require('@prisma/client');
const logger = require('../services/logger.service');
const nodePaymentService = require('../services/nodePayment.service');
const nodePackageService = require('../services/nodePackage.service');
const commissionService = require('../services/commission.service');
const { calculateCommissions } = require('../utils/commission.utils');

const prisma = new PrismaClient();

class MobileMoneyCallbackController {
  async handleCallback(req, res) {
    const { status, type, trans_id } = req.body;

    logger.info('Mobile Money Callback Received', {
      trans_id,    // Transaction ID from Script Networks
      status,      // "SUCCESSFUL" or "FAILED"
      type      
    });

    try {
      const referenceId = trans_id
      // Find the original payment record
      const payment = await nodePaymentService.findByReference(referenceId);
      if (!payment) {
        logger.error('Payment not found for reference ID', { referenceId });
        return res.status(404).json({
          success: false,
          message: `Payment not found for reference ID: ${referenceId}`
        });
      }

      // Process callback in a transaction
      await prisma.$transaction(async (tx) => {
        // Update payment status
        const updatedPayment = await nodePaymentService.updateStatus(
          payment.id,
          status === 'SUCCESS' ? 'COMPLETED' : 'FAILED',
          reference=trans_id,
          tx
        );

        // If payment was successful, complete package and commissions
        if (status === 'SUCCESS') {
          // Update node package status
          const nodePackage = await nodePackageService.updateStatus(
            payment.nodePackageId,
            'ACTIVE',
            tx
          );

          // Calculate and create commissions
          const commissions = await calculateCommissions(payment.nodeId, payment.amount, tx);
          await Promise.all(commissions.map(commission =>
            commissionService.create({
              ...commission,
              packageId: payment.packageId,
              status: 'PROCESSED'
            }, tx)
          ));

          logger.info('Mobile Money Payment Processed Successfully', {
            paymentId: updatedPayment.id,
            nodePackageId: nodePackage.id,
            commissionsCreated: commissions.length
          });
        } else {
          logger.warn('Mobile Money Payment Not Successful', {
            status,
            referenceId,
            paymentId: updatedPayment.id
          });
        }
      });

      // Send success response
      res.status(200).json({
        success: true,
        message: 'Mobile Money callback processed successfully'
      });
    } catch (error) {
      logger.error('Mobile Money Callback Processing Error', {
        error: error.message,
        stack: error.stack,
        referenceId
      });

      res.status(500).json({
        success: false,
        message: 'Error processing Mobile Money callback',
        error: error.message
      });
    }
  }
}

module.exports = new MobileMoneyCallbackController();