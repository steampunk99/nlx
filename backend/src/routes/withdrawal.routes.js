const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validate');
const withdrawalController = require('../controllers/withdrawal.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Withdrawal:
 *       type: object
 *       required:
 *         - amount
 *         - withdrawal_method
 *       properties:
 *         amount:
 *           type: number
 *         withdrawal_method:
 *           type: string
 *           enum: [MPESA, BANK, CRYPTO]
 *         paymentDetails:
 *           type: object
 *         status:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED, CANCELLED]
 *         remarks:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         processedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /withdrawals:
 *   post:
 *     summary: Request a new withdrawal
 *     tags: [Withdrawals]
 */
router.post('/', [
    auth,
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    
], withdrawalController.requestWithdrawal);

/**
 * @swagger
 * /withdrawals:
 *   get:
 *     summary: Get user's withdrawal history
 *     tags: [Withdrawals]
 */
router.get('/', [
    auth,
], withdrawalController.getWithdrawalHistory);

/**
 * @swagger
 * /withdrawals/{id}/cancel:
 *   post:
 *     summary: Cancel a pending withdrawal request
 *     tags: [Withdrawals]
 */
router.post('/:id/cancel', [
    auth,
    param('id').isString(),
    validate
], withdrawalController.cancelWithdrawal);

/**
 * @swagger
 * /withdrawals/status/{transactionId}:
 *   get:
 *     summary: Check withdrawal status by transactionId
 *     tags: [Withdrawals]
 */
router.get('/status/:transactionId', [
    auth,
    param('transactionId').isString(),
    validate
], withdrawalController.checkWithdrawalStatus);

module.exports = router;
