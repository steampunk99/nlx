const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const systemRevenueController = require('../controllers/systemRevenue.controller');

// All routes require authentication and admin privileges
router.use(auth);
router.use(isAdmin);

// Get all system revenue records with pagination and filters
router.get('/', systemRevenueController.getAllRevenue);

// Get system revenue statistics
router.get('/stats', systemRevenueController.getRevenueStats);

// Get system revenue by ID
router.get('/:id', systemRevenueController.getRevenueById);

// Update system revenue status
router.patch('/:id/status', systemRevenueController.updateRevenueStatus);

// Delete system revenue record (if needed)
router.delete('/:id', systemRevenueController.deleteRevenue);

// Get revenue report for a specific period
router.get('/report', systemRevenueController.getRevenueReport);

module.exports = router; 