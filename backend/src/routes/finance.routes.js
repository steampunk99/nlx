const express = require('express');
const router = express.Router();
const { isActive, isAdmin } = require('../middleware/auth');
const { query, body } = require('express-validator');
const { validate } = require('../middleware/validate');
const financeController = require('../controllers/finance.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Balance:
 *       type: object
 *       properties:
 *         currentBalance:
 *           type: number
 *         totalCredits:
 *           type: number
 *         totalDebits:
 *           type: number
 *         balanceHistory:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *               balanceAfter:
 *                 type: number
 *         withdrawalLimits:
 *           type: object
 *           properties:
 *             daily:
 *               type: object
 *               properties:
 *                 limit: 
 *                   type: number
 *                 used:
 *                   type: number
 *                 remaining:
 *                   type: number
 *             weekly:
 *               type: object
 *               properties:
 *                 limit:
 *                   type: number
 *                 used:
 *                   type: number
 *                 remaining:
 *                   type: number
 *             monthly:
 *               type: object
 *               properties:
 *                 limit:
 *                   type: number
 *                 used:
 *                   type: number
 *                 remaining:
 *                   type: number
 *             minimum:
 *               type: number
 *     Statement:
 *       type: object
 *       properties:
 *         amount:
 *           type: number
 *         type:
 *           type: string
 *           enum: [CREDIT, DEBIT]
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED, SCHEDULED]
 *         balanceAfter:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         scheduledFor:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /finance/balance:
 *   get:
 *     summary: Get user's current balance with history and limits
 *     tags: [Finance]
 */
router.get('/balance', isActive, financeController.getBalance);

/**
 * @swagger
 * /finance/statement:
 *   get:
 *     summary: Get user's statement/transactions with pagination
 *     tags: [Finance]
 */
router.get('/statement', [
    isActive,
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('type').optional().isIn(['CREDIT', 'DEBIT']),
    query('status').optional().isIn(['PENDING', 'COMPLETED', 'FAILED', 'SCHEDULED']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate
], financeController.getStatement);

/**
 * @swagger
 * /finance/withdrawals:
 *   get:
 *     summary: Get user's withdrawal history with pagination
 *     tags: [Finance]
 */
router.get('/withdrawals', [
    isActive,
    query('status').optional().isIn(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    validate
], financeController.getWithdrawals);

/**
 * @swagger
 * /finance/withdrawal/request:
 *   post:
 *     summary: Request a withdrawal with limits check
 *     tags: [Finance]
 */
router.post('/withdrawal/request', [
    isActive,
    body('amount').isFloat({ min: 0 }),
    body('paymentMethod').isIn(['bank_transfer', 'mobile_money']),
    body('phoneNumber').optional().isString(),
    validate
], financeController.requestWithdrawal);

/**
 * @swagger
 * /finance/payouts/schedule:
 *   post:
 *     summary: Schedule payouts for multiple users (admin only)
 *     tags: [Finance]
 */
router.post('/payouts/schedule', [
    isAdmin,
    body('payouts').isArray(),
    body('payouts.*.nodeId').isInt(),
    body('payouts.*.amount').isFloat({ min: 0 }),
    body('payouts.*.type').isIn(['CREDIT', 'DEBIT']),
    body('payouts.*.description').isString(),
    body('payouts.*.scheduledFor').isISO8601(),
    validate
], financeController.schedulePayouts);

/**
 * @swagger
 * /finance/payouts/process:
 *   post:
 *     summary: Process scheduled payouts (admin only)
 *     tags: [Finance]
 */
router.post('/payouts/process', isAdmin, financeController.processScheduledPayouts);

/**
 * @swagger
 * /finance/statements/bulk:
 *   post:
 *     summary: Create multiple statements in bulk (admin only)
 *     tags: [Finance]
 */
router.post('/statements/bulk', [
    isAdmin,
    body('statements').isArray(),
    body('statements.*.nodeId').isInt(),
    body('statements.*.amount').isFloat({ min: 0 }),
    body('statements.*.type').isIn(['CREDIT', 'DEBIT']),
    body('statements.*.description').isString(),
    validate
], financeController.createBulkStatements);

/**
 * @swagger
 * /finance/commissions:
 *   post:
 *     summary: Calculate and distribute commissions
 *     tags: [Finance]
 */
router.post('/commissions', [isActive], financeController.distributeCommissions);

module.exports = router;
