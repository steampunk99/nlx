const express = require('express');
const router = express.Router();
const { isActive, isAdmin } = require('../middleware/auth');
const reportController = require('../controllers/report.controller');
const { query, body } = require('express-validator');
const { validate } = require('../middleware/validate');

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get all reports (admin only)
 *     tags: [Reports]
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
 *         description: Report type filter
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Report status filter
 */
router.get('/', isAdmin, reportController.getAllReports);

/**
 * @swagger
 * /api/reports/{id}:
 *   get:
 *     summary: Get report by ID
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', isActive, reportController.getReportById);

/**
 * @swagger
 * /api/reports/user:
 *   get:
 *     summary: Get user's reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/user', isActive, reportController.getUserReports);

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Create new report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', 
    isActive, 
    validateReport, 
    reportController.createReport
);

/**
 * @swagger
 * /api/reports/{id}:
 *   put:
 *     summary: Update report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', 
    isActive, 
    validateReport, 
    reportController.updateReport
);

/**
 * @swagger
 * /api/reports/{id}:
 *   delete:
 *     summary: Delete report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', isActive, reportController.deleteReport);

/**
 * @swagger
 * /api/reports/stats:
 *   get:
 *     summary: Get report statistics (admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', isAdmin, reportController.getReportStats);

// Specialized report endpoints
router.get('/network-growth', 
    isActive, 
    reportController.getNetworkGrowth
);

router.get('/commissions', 
    isActive, 
    reportController.getCommissionReport
);

router.get('/team-performance', 
    isActive, 
    reportController.getTeamPerformanceReport
);

router.get('/rank-advancement', 
    isActive, 
    reportController.getRankAdvancementReport
);

router.get('/package-distribution', 
    isActive, 
    reportController.getPackageDistributionReport
);

router.get('/activity', 
    isActive, 
    reportController.getActivityReport
);

// Custom report generation
router.post('/custom', 
    isActive, 
    reportController.generateCustomReport
);

// Export report
router.get('/export/:reportId', 
    isActive, 
    reportController.exportReport
);

// Schedule report
router.post('/schedule', 
    isActive, 
    reportController.scheduleReport
);

// MLM analytics endpoints
router.get('/network-metrics',
    isActive,
    [
        query('period').optional().matches(/^\d+[d|w|m|y]$/),
        query('depth').optional().isInt({ min: 1, max: 10 }),
        validate
    ],
    reportController.getNetworkMetrics
);

router.get('/commission-analytics',
    isActive,
    [
        query('startDate').optional().isISO8601(),
        query('endDate').optional().isISO8601(),
        query('groupBy').optional().isIn(['day', 'week', 'month']),
        validate
    ],
    reportController.getCommissionAnalytics
);

router.get('/team-performance',
    isActive,
    [
        query('period').optional().matches(/^\d+[d|w|m|y]$/),
        query('metrics').optional().isArray(),
        validate
    ],
    reportController.getTeamPerformance
);

router.get('/rank-analytics',
    isActive,
    [
        query('period').optional().matches(/^\d+[d|w|m|y]$/),
        validate
    ],
    reportController.getRankAnalytics
);

router.get('/genealogy',
    isActive,
    [
        query('depth').optional().isInt({ min: 1, max: 10 }),
        query('includeMetrics').optional().isBoolean(),
        validate
    ],
    reportController.getGenealogyReport
);

router.get('/financial',
    isActive,
    [
        query('startDate').optional().isISO8601(),
        query('endDate').optional().isISO8601(),
        query('metrics').optional().isArray(),
        validate
    ],
    reportController.getFinancialReport
);

router.get('/activity',
    isActive,
    [
        query('startDate').optional().isISO8601(),
        query('endDate').optional().isISO8601(),
        query('type').optional().isString(),
        validate
    ],
    reportController.getActivityReport
);

router.post('/export',
    isActive,
    [
        body('type').isString(),
        body('format').optional().isIn(['csv', 'pdf', 'excel']),
        validate
    ],
    reportController.exportReport
);

router.get('/admin/dashboard',
    isAdmin,
    [
        query('period').optional().matches(/^\d+[d|w|m|y]$/),
        validate
    ],
    reportController.getAdminDashboard
);

module.exports = router;
