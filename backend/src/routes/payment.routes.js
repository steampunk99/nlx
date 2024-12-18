const express = require('express');
const router = express.Router();
const { auth,isActive, isAdmin } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validate');
const paymentController = require('../controllers/payment.controller');
const mobileMoneyController = require('../controllers/mobileMoney.controller')

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
router.post('/package',auth, [
   
    body('trans_id'),
    body('amount'),
    body('phoneNumber')
    
], paymentController.processPackagePayment);

router.post('/')

/**
 * @swagger
 * /payments/upgrade:
 *   post:
 *     summary: Process package upgrade payment
 *     tags: [Payments]
 */
router.post('/upgrade', [
   
    body('newPackageId').isInt(),
    body('paymentMethod').isIn(['MTN_MOBILE', 'AIRTEL_MONEY']),
    body('phoneNumber').matches(/^(0|\+?256)?(7[0-9]{8})$/),
    validate
], paymentController.processUpgradePayment);




module.exports = router;
