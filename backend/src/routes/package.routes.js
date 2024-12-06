const express = require('express');
const router = express.Router();
const { auth, isActive, isAdmin } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validate');
const packageController = require('../controllers/package.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Package:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - level
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         level:
 *           type: integer
 *         features:
 *           type: array
 *           items:
 *             type: string
 *         isActive:
 *           type: boolean
 *         maxNodes:
 *           type: integer
 *         duration:
 *           type: integer
 *         imageUrl:
 *           type: string
 */

/**
 * @swagger
 * /packages:
 *   get:
 *     summary: Get all available packages
 *     tags: [Packages]
 */
router.get('/', [auth, ], packageController.getAllPackages);

/**
 * @swagger
 * /packages/user:
 *   get:
 *     summary: Get user's purchased packages
 *     tags: [Packages]
 */
router.get('/user', [auth, isActive], packageController.getUserPackages);

/**
 * @swagger
 * /packages/admin:
 *   post:
 *     summary: Create a new package (Admin only)
 *     tags: [Packages]
 */
router.post('/admin', [
    auth,
    isAdmin,
    body('name').notEmpty().withMessage('Package name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('level').isInt().withMessage('Level must be an integer'),
    body('features').isArray().withMessage('Features must be an array'),
    body('maxNodes').optional().isInt().withMessage('Max nodes must be an integer'),
    body('duration').optional().isInt().withMessage('Duration must be an integer'),
    validate
], packageController.createPackage);

/**
 * @swagger
 * /packages/admin/{id}:
 *   put:
 *     summary: Update package details (Admin only)
 *     tags: [Packages]
 */
router.put('/admin/:id', [
    auth,
    isAdmin,
    param('id').notEmpty().withMessage('Package ID is required'),
    body('name').optional().notEmpty().withMessage('Package name cannot be empty'),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
    body('level').optional().isInt().withMessage('Level must be an integer'),
    validate
], packageController.updatePackage);

/**
 * @swagger
 * /packages/admin/{id}/toggle:
 *   patch:
 *     summary: Toggle package status (Admin only)
 *     tags: [Packages]
 */
router.patch('/admin/:id/toggle', [
    auth,
    isAdmin,
    param('id').notEmpty().withMessage('Package ID is required'),
    validate
], packageController.togglePackageStatus);

/**
 * @swagger
 * /packages/admin/stats:
 *   get:
 *     summary: Get package stats (Admin only)
 *     tags: [Packages]
 */
router.get('/admin/stats', [auth, isAdmin], packageController.getPackageStats);

/**
 * @swagger
 * /packages:
 *   post:
 *     summary: Create a new package (Admin only)
 *     tags: [Packages]
 */
router.post('/', [
    auth,
    isActive
    ,
    isAdmin,
    body('name').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('price').isFloat({ min: 0 }),
    body('level').isInt({ min: 1 }),
    body('features').optional().isArray(),
    body('isActive').optional().isBoolean(),
    validate
], packageController.createPackage);

/**
 * @swagger
 * /packages/{id}:
 *   put:
 *     summary: Update package details (Admin only)
 *     tags: [Packages]
 */
router.put('/:id', [
    auth,
    isActive,
    isAdmin,
    param('id').isString(),
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('price').optional().isFloat({ min: 0 }),
    body('level').optional().isInt({ min: 1 }),
    body('features').optional().isArray(),
    body('isActive').optional().isBoolean(),
    validate
], packageController.updatePackage);

/**
 * @swagger
 * /packages/{id}:
 *   delete:
 *     summary: Delete package (Admin only)
 *     tags: [Packages]
 */
router.delete('/:id', [
    auth,
    isActive,
    isAdmin,
    param('id').isString(),
    validate
], packageController.deletePackage);

/**
 * @swagger
 * /packages/upgrade:
 *   post:
 *     summary: Upgrade existing package
 *     tags: [Packages]
 */
router.post('/upgrade', [
    auth,
    isActive,
    body('currentPackageId').isString(),
    body('newPackageId').isString(),
    body('paymentMethod').isIn(['MPESA', 'BANK', 'CRYPTO']),
    body('phoneNumber').optional().matches(/^\+?[1-9]\d{1,14}$/),
    validate
], packageController.upgradePackage);

/**
 * @swagger
 * /packages/upgrade/history:
 *   get:
 *     summary: Get package upgrade history
 *     tags: [Packages]
 */
router.get('/upgrade/history', [
    auth,
    isActive,
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    validate
], packageController.getUpgradeHistory);

module.exports = router;
