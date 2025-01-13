const express = require('express');
const router = express.Router();
const { isAdmin, auth } = require('../middleware/auth');
const { query, body, param } = require('express-validator');
const { validate } = require('../middleware/validate');
const adminController = require('../controllers/admin.controller');
const withdrawalController = require('../controllers/withdrawal.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminStats:
 *       type: object
 *       properties:
 *         users:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             active:
 *               type: integer
 *         nodes:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             active:
 *               type: integer
 *         packages:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             active:
 *               type: integer
 *         pendingWithdrawals:
 *           type: integer
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users with pagination and filters
 *     tags: [Admin]
 */
router.get('/users', [
    auth,
   
], adminController.getUsers);

/**
 * @swagger
 * /admin/users:
 *   post:
 *     summary: Create new admin user
 *     tags: [Admin]
 */
router.post('/users', [
    auth,
   
], adminController.createUser);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get user details by ID
 *     tags: [Admin]
 */
router.get('/users/:id', [
  
], adminController.getUserDetails);
/**
 * @swagger
 * /admin/transactions:
 *   get:
 *     summary: Get all transactions with pagination and filters
 *     tags: [Admin]
 */
router.get('/transactions', [
    isAdmin,
], adminController.getTransactions);

/**
 * @swagger
 * /admin/users/{id}/status:
 *   put:
 *     summary: Update user status
 *     tags: [Admin]
 */
router.put('/users/:id/status', [
    auth,
    param('id').isString(),
    body('status').isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
    validate
], adminController.updateUserStatus);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete user (soft delete)
 *     tags: [Admin]
 */
router.delete('/users/:id', [
    isAdmin,
    param('id').isString(),
    validate
], adminController.deleteUser);

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get system statistics
 *     tags: [Admin]
 */
router.get('/stats', adminController.getSystemStats);

/**
 * @swagger
 * /admin/packages:
 *   post:
 *     summary: Create a new package
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - level
 *             properties:
 *               name:
 *                 type: string
 *                 description: Package name
 *               description:
 *                 type: string
 *                 description: Package description
 *               price:
 *                 type: number
 *                 description: Package price
 *               level:
 *                 type: integer
 *                 description: Package level
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *                 default: ACTIVE
 *               benefits:
 *                 type: object
 *                 description: Package benefits as JSON object
 *               maxNodes:
 *                 type: integer
 *                 default: 1
 *               duration:
 *                 type: integer
 *                 default: 30
 *               features:
 *                 type: string
 *                 description: Package features
 *               dailyMultiplier:
 *                 type: number
 *                 default: 1
 */
router.post('/packages', 
  [
    auth,
    
    validate([
      body('name').trim().isString().notEmpty(),
      body('description').optional().trim().isString(),
      body('price').isFloat({ gt: 0 }),
      body('level').isInt({ min: 1 }),
      body('status').optional().isIn(['ACTIVE', 'INACTIVE']),
      body('benefits').optional().custom(value => {
        try {
          JSON.parse(value);
          return true;
        } catch (e) {
          throw new Error('Benefits must be valid JSON');
        }
      }),
      body('maxNodes').optional().isInt({ min: 1 }),
      body('duration').optional().isInt({ min: 1 }),
      body('features').optional().trim().isString(),
      body('dailyMultiplier').optional().isFloat({ gt: 0 })
    ])
  ],
  adminController.createPackage
);

/**
 * @swagger
 * /admin/packages/{id}:
 *   put:
 *     summary: Update a package
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               level:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *               benefits:
 *                 type: object
 *               maxNodes:
 *                 type: integer
 *               duration:
 *                 type: integer
 *               features:
 *                 type: string
 *               dailyMultiplier:
 *                 type: number
 */
router.put('/packages/:id',
  [
    auth,
    
    validate([
      param('id').isInt({ min: 1 }),
      body('name').optional().trim().isString(),
      body('description').optional().trim().isString(),
      body('price').optional().isFloat({ gt: 0 }),
      body('level').optional().isInt({ min: 1 }),
      body('status').optional().isIn(['ACTIVE', 'INACTIVE']),
      body('benefits').optional().custom(value => {
        try {
          JSON.parse(value);
          return true;
        } catch (e) {
          throw new Error('Benefits must be valid JSON');
        }
      }),
      body('maxNodes').optional().isInt({ min: 1 }),
      body('duration').optional().isInt({ min: 1 }),
      body('features').optional().trim().isString(),
      body('dailyMultiplier').optional().isFloat({ gt: 0 })
    ])
  ],
  adminController.updatePackage
);

/**
 * @swagger
 * /admin/packages:
 *   get:
 *     summary: Get all packages with pagination and filters
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *       - in: query
 *         name: level
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 */
router.get('/packages',
  [
    auth,
    
    validate([
      query('status').optional().isIn(['ACTIVE', 'INACTIVE']),
      query('level').optional().isInt({ min: 1 }),
      query('search').optional().trim().isString(),
      query('sortBy').optional().isString(),
      query('sortOrder').optional().isIn(['asc', 'desc']),
      query('page').optional().isInt({ min: 1 }),
      query('limit').optional().isInt({ min: 1, max: 100 })
    ])
  ],
  adminController.getPackages
);

/**
 * @swagger
 * /admin/packages/stats:
 *   get:
 *     summary: Get overall package statistics
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 */
router.get('/packages/stats',
  [
    auth,
    
  ],
  adminController.getPackagesStats
);

/**
 * @swagger
 * /admin/packages/{id}/stats:
 *   get:
 *     summary: Get package statistics
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/packages/:id/stats',
  [
    auth,
    isAdmin,
    validate([
      param('id').isInt({ min: 1 })
    ])
  ],
  adminController.getPackageStats
);

/**
 * @swagger
 * /admin/transactions:
 *   get:
 *     description: Get all transactions
 *     tags: [Admin]
 */
router.get('/transactions', adminController.getTransactions);

/**
 * @swagger
 * /admin/withdrawals:
 *   get:
 *     summary: Get all withdrawals with filters and pagination
 *     tags: [Admin]
 */
router.get('/withdrawals', [
    auth,
    
    validate([
      query('status').optional().isIn(['PENDING', 'PROCESSING', 'SUCCESSFUL', 'FAILED', 'REJECTED']),
      query('startDate').optional().isISO8601(),
      query('endDate').optional().isISO8601(),
      query('page').optional().isInt({ min: 1 }),
      query('limit').optional().isInt({ min: 1, max: 100 })
    ])
], withdrawalController.getAllWithdrawals);

/**
 * @swagger
 * /admin/withdrawals/{id}/process:
 *   post:
 *     summary: Process a withdrawal request
 *     tags: [Admin]
 */
router.post('/withdrawals/:id/process', [
    auth,
    
    validate([
      param('id').isInt().toInt(),
      body('status').isIn(['SUCCESSFUL', 'FAILED', 'REJECTED']).withMessage('Invalid status'),
      body('remarks').optional().isString()
    ])
], withdrawalController.processWithdrawal);

/**
 * @swagger
 * /admin/network/stats:
 *   get:
 *     description: Get network statistics
 *     tags: [Admin]
 */
router.get('/network/stats', adminController.getNetworkStats);

// Admin Settings Routes
router.get('/config', adminController.getAdminConfig);
router.put('/config', adminController.updateAdminConfig);

module.exports = router;
