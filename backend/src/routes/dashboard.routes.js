const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { auth } = require('../middleware/auth');

router.get('/stats', auth, dashboardController.getDashboardStats);
router.get('/activities', auth, dashboardController.getRecentActivities);
router.get('/network', auth, dashboardController.getNetworkStats);
router.get('/earnings', auth, dashboardController.getEarnings);
router.get('/reward', auth, dashboardController.getDailyReward);

module.exports = router;
