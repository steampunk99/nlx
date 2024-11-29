const express = require('express');
const router = express.Router();
const mobileMoneyCallbackController = require('../controllers/mobileMoneyCallback.controller');
const { authenticate } = require('../middleware/auth');

// Callback endpoints for mobile money providers (no auth required)
router.post('/callback/mtn', mobileMoneyCallbackController.handleMtnCallback);
router.post('/callback/airtel', mobileMoneyCallbackController.handleAirtelCallback);

// Protected routes
router.get('/status/:paymentId',  mobileMoneyCallbackController.queryPaymentStatus);

module.exports = router;
