const express = require('express');
const router = express.Router();
const { isActive, isAdmin } = require('../middleware/auth');
const commissionController = require('../controllers/commission.controller');
const { validateCommission } = require('../middleware/validate');

/**
 * @swagger
 * /api/commissions/admin:
 *   get:
 *     summary: Get all commissions (admin only)
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Commission type filter
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Commission status filter
 */
router.get('/admin', isAdmin, commissionController.getAllCommissions);

/**
 * @swagger
 * /api/commissions/process-queue:
 *   post:
 *     summary: Process commission queue (admin only)
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 */
router.post('/process-queue', isAdmin, commissionController.processCommissionQueue);

/**
 * @swagger
 * /api/commissions/calculate/direct:
 *   post:
 *     summary: Calculate direct commission
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 */
router.post('/calculate/direct', isActive, commissionController.calculateDirectCommission);

/**
 * @swagger
 * /api/commissions/calculate/matching:
 *   post:
 *     summary: Calculate matching bonus
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 */
router.post('/calculate/matching', isActive, commissionController.calculateMatchingBonus);

/**
 * @swagger
 * /api/commissions/stats/{userId}:
 *   get:
 *     summary: Get user-specific commission statistics
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats/:userId', isActive, commissionController.getUserCommissionStats);

/**
 * @swagger
 * /api/commissions/stats:
 *   get:
 *     summary: Get default commission statistics
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', isActive, commissionController.getUserCommissionStats);

/**
 * @swagger
 * /api/commissions/withdraw:
 *   post:
 *     summary: Withdraw commissions
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 */
router.post('/withdraw', isActive, commissionController.withdrawCommissions);

/**
 * @swagger
 * /api/commissions/{id}:
 *   get:
 *     summary: Get commission by ID
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', isAdmin, commissionController.getCommissionById);

/**
 * @swagger
 * /api/commissions:
 *   post:
 *     summary: Create new commission (admin only)
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', 
    isAdmin, 
    validateCommission, 
    commissionController.createCommission
);

/**
 * @swagger
 * /api/commissions/{id}:
 *   put:
 *     summary: Update commission (admin only)
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', 
    isAdmin, 
    validateCommission, 
    commissionController.updateCommission
);

/**
 * @swagger
 * /api/commissions/{id}:
 *   delete:
 *     summary: Delete commission (admin only)
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', isAdmin, commissionController.deleteCommission);

/**
 * @swagger
 * /api/commissions/history:
 *   get:
 *     summary: Get user's commission history
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         enum: [All, DIRECT, MATCHING, LEVEL]
 *         description: Commission type filter
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         enum: [All, PENDING, PROCESSED, WITHDRAWN]
 *         description: Commission status filter
 */
router.get('/history', isActive, commissionController.getUserCommissions);

/**
 * @swagger
 * /api/commissions:
 *   get:
 *     summary: Get user's commission history
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Commission type filter
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Commission status filter
 */
router.get('/', isActive, commissionController.getUserCommissions);

module.exports = router;
