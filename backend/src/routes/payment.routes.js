const express = require('express');
const router = express.Router();
const { auth, isActive, isAdmin } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validate');
const paymentController = require('../controllers/payment.controller');
const mobileMoneyController = require('../controllers/mobileMoney.controller');
const ugandaMobileMoneyUtil = require('../utils/ugandaMobileMoneyUtil');
const packageController = require('../controllers/package.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       required:
 *         - amount
 *         - paymentMethod
 *         - phoneNumber
 *       properties:
 *         amount:
 *           type: number
 *         paymentMethod:
 *           type: string
 *           enum: [MTN_MOBILE, AIRTEL_MONEY]
 *         phoneNumber:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED]
 */

/**
 * @swagger
 * /payments/package:
 *   post:
 *     summary: Process package purchase payment
 *     tags: [Payments]
 */
router.post('/package', auth, [
    body('trans_id'),
    body('amount'),
    body('phoneNumber')
], paymentController.processPackagePayment);

/**
 * @swagger
 * /payments/status/check:
 *   post:
 *     summary: Check payment status (frontend polling)
 *     tags: [Payments]
 */
router.post('/status/check', auth, packageController.getPaymentStatus);

router.post("/status/callback", mobileMoneyController.handleCallback )

/**
 * @swagger
 * /payments/upgrade:
 *   post:
 *     summary: Process package upgrade payment
 *     tags: [Payments]
 */
router.post('/upgrade', auth, [
    body('trans_id'),
    body('currentPackageId'),
    body('newPackageId'),
    body('amount'),
    body('phone'),
    validate
], paymentController.processUpgradePayment);



module.exports = router;
