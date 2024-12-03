const { PrismaClient } = require('@prisma/client');
const UgandaMobileMoneyUtil = require('../utils/ugandaMobileMoneyUtil');
const nodePaymentService = require('../services/nodePayment.service');
const nodePackageService = require('../services/nodePackage.service');
const commissionService = require('../services/commission.service');
const { calculateCommissions } = require('../utils/commission.utils');
const logger = require('../services/logger.service');

const prisma = new PrismaClient();

class MobileMoneyCallbackController {
  async handleMtnCallback(req, res) {
    const { 
      status, 
      referenceId, 
      transactionId, 
      amount 
    } = req.body;

    logger.info('MTN Mobile Money Callback Received', { 
      status, 
      referenceId, 
      transactionId, 
      amount 
    });

    try {
      // Validate incoming callback
      if (!referenceId) {
        logger.warn('Invalid MTN callback: Missing reference ID', { body: req.body });
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid callback: Missing reference ID' 
        });
      }

      // Process callback in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Find the original payment record
        const payment = await nodePaymentService.findByReferenceId(referenceId, tx);
        if (!payment) {
          logger.error('Payment not found for MTN reference ID', { referenceId });
          throw new Error(`Payment not found for reference ID: ${referenceId}`);
        }

        // Update payment status
        const updatedPayment = await nodePaymentService.updateStatus(
          payment.id, 
          status === 'SUCCESS' ? 'COMPLETED' : 'FAILED', 
          transactionId,
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
          const commissions = await calculateCommissions(payment.nodeId, payment.amount);
          const createdCommissions = await Promise.all(commissions.map(commission => 
            commissionService.create({
              ...commission,
              packageId: payment.packageId,
              status: 'PENDING'
            }, tx)
          ));

          logger.info('MTN Mobile Money Payment Processed Successfully', { 
            paymentId: updatedPayment.id,
            nodePackageId: nodePackage.id,
            commissionsCreated: createdCommissions.length
          });

          return { 
            payment: updatedPayment, 
            nodePackage,
            commissions: createdCommissions
          };
        }

        logger.warn('MTN Mobile Money Payment Not Successful', { 
          status, 
          referenceId, 
          paymentId: updatedPayment.id 
        });

        return { payment: updatedPayment };
      });

      // Send success response
      res.status(200).json({ 
        success: true, 
        message: 'MTN Mobile Money callback processed successfully',
        data: result
      });
    } catch (error) {
      logger.error('MTN Mobile Money Callback Processing Error', { 
        error: error.message, 
        stack: error.stack,
        referenceId 
      });

      res.status(500).json({ 
        success: false, 
        message: 'Error processing MTN Mobile Money callback',
        error: error.message 
      });
    }
  }

  /**
   * Get user profile from MTN Mobile Money
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserProfile(req, res) {
    try {
      logger.info('User Profile Request Received', { userId: req.user?.id });

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      });

      if (!user) {
        logger.error('User not found', { userId: req.user.id });
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Initialize MTN utility
      const mtnUtil = new UgandaMobileMoneyUtil('mtn');
      let mtnProfile = null;

      try {
        // Get MTN profile if phone number exists
        if (user.phone) {
          logger.info('Fetching MTN profile', { phone: user.phone });
          const mtnResponse = await mtnUtil.getUserInfo(user.phone);
          if (mtnResponse.success) {
            mtnProfile = mtnResponse.data;
          } else {
            logger.warn('MTN profile fetch failed', { 
              error: mtnResponse.error,
              statusCode: mtnResponse.statusCode,
              details: mtnResponse.details
            });
          }
        }
      } catch (mtnError) {
        logger.error('MTN profile fetch error', { 
          error: mtnError.message,
          stack: mtnError.stack
        });
      }

      // Return combined profile
      return res.status(200).json({
        success: true,
        data: {
          id: user.id,
          localProfile: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phone
          },
          mtnProfile
        }
      });
    } catch (error) {
      logger.error('User Profile Retrieval Error', { 
        error: error.message,
        stack: error.stack
      });
      return res.status(500).json({
        success: false,
        message: 'Internal server error during user profile retrieval',
        error: error.message
      });
    }
  }

  // mtn user profile
  async getUserProfileMtn(req, res) {
    console.log('User Profile Request Received');
    console.log('User ID from Token:', req.user); // Log the authenticated user

    const mtnUtil = new UgandaMobileMoneyUtil('mtn');
    
    try {
        console.log('Attempting to get user info');
        const userInfo = await mtnUtil.getUserInfo();
        console.log('User Info Retrieved:', userInfo);
        
        return res.status(200).json({
            success: true,
            userProfile: userInfo
        });
    } catch (error) {
        console.error('Mobile Money User Profile Retrieval Error', error);
        return res.status(500).json({
            success: false,
            message: 'User profile retrieval failed',
            error: error.toString()
        });
    }
}

  async handleAirtelCallback(req, res) {
    const { 
      status, 
      referenceId, 
      transactionId, 
      amount 
    } = req.body;

    logger.info('Airtel Money Callback Received', { 
      status, 
      referenceId, 
      transactionId, 
      amount 
    });

    try {
      // Validate incoming callback
      if (!referenceId) {
        logger.warn('Invalid Airtel callback: Missing reference ID', { body: req.body });
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid callback: Missing reference ID' 
        });
      }

      // Process callback in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Find the original payment record
        const payment = await nodePaymentService.findByReferenceId(referenceId, tx);
        if (!payment) {
          logger.error('Payment not found for Airtel reference ID', { referenceId });
          throw new Error(`Payment not found for reference ID: ${referenceId}`);
        }

        // Update payment status
        const updatedPayment = await nodePaymentService.updateStatus(
          payment.id, 
          status === 'SUCCESS' ? 'COMPLETED' : 'FAILED', 
          transactionId,
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
          const commissions = await calculateCommissions(payment.nodeId, payment.amount);
          const createdCommissions = await Promise.all(commissions.map(commission => 
            commissionService.create({
              ...commission,
              packageId: payment.packageId,
              status: 'PENDING'
            }, tx)
          ));

          logger.info('Airtel Money Payment Processed Successfully', { 
            paymentId: updatedPayment.id,
            nodePackageId: nodePackage.id,
            commissionsCreated: createdCommissions.length
          });

          return { 
            payment: updatedPayment, 
            nodePackage,
            commissions: createdCommissions
          };
        }

        logger.warn('Airtel Money Payment Not Successful', { 
          status, 
          referenceId, 
          paymentId: updatedPayment.id 
        });

        return { payment: updatedPayment };
      });

      // Send success response
      res.status(200).json({ 
        success: true, 
        message: 'Airtel Money callback processed successfully',
        data: result
      });
    } catch (error) {
      logger.error('Airtel Money Callback Processing Error', { 
        error: error.message, 
        stack: error.stack,
        referenceId 
      });

      res.status(500).json({ 
        success: false, 
        message: 'Error processing Airtel Money callback',
        error: error.message 
      });
    }
  }

  async queryPaymentStatus(req, res) {
    try {
      const { paymentId } = req.params;
      const nodeId = req.user.id; // Assuming auth middleware sets user

      // Find the payment by ID and ensure it belongs to the authenticated node
      const payment = await nodePaymentService.findById(paymentId);
      
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      // Verify the payment belongs to the authenticated node
      if (payment.nodeId !== nodeId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to payment'
        });
      }

      // Return payment status details
      res.status(200).json({
        success: true,
        data: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          createdAt: payment.createdAt,
          processedAt: payment.processedAt,
          package: payment.package,
          reason: payment.reason
        }
      });
    } catch (error) {
      logger.error('Error querying payment status', { 
        error: error.message, 
        stack: error.stack,
        paymentId: req.params.paymentId 
      });

      res.status(500).json({
        success: false,
        message: 'Error retrieving payment status',
        error: error.message
      });
    }
  }
}

module.exports = new MobileMoneyCallbackController();
