const express = require('express');
const router = express.Router();
const { isActive, isAdmin } = require('../middleware/auth');
const commissionController = require('../controllers/commission.controller');
const { validateCommission } = require('../middleware/validate');

/**
 * @swagger
 * /api/commissions:
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
router.get('/', isAdmin, commissionController.getAllCommissions);

/**
 * @swagger
 * /api/commissions/{id}:
 *   get:
 *     summary: Get commission by ID
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', isActive, commissionController.getCommissionById);

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
 * /api/commissions/stats/{userId}:
 *   get:
 *     summary: Get user commission statistics
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats/:userId?', isActive, commissionController.getUserCommissionStats);

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
router.post('/calculate/direct', 
    isActive, 
    commissionController.calculateDirectCommission
);

/**
 * @swagger
 * /api/commissions/calculate/matching:
 *   post:
 *     summary: Calculate matching bonus
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 */
router.post('/calculate/matching', 
    isActive, 
    commissionController.calculateMatchingBonus
);

module.exports = router;
