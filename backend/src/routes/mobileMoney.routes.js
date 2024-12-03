const express = require('express');
const router = express.Router();
const mobileMoneyCallbackController = require('../controllers/mobileMoney.controller');
const { auth } = require('../middleware/auth');

// Callback endpoints for mobile money providers (no auth required)
router.post('/callback/mtn',    mobileMoneyCallbackController.handleMtnCallback);
router.post('/callback/airtel', mobileMoneyCallbackController.handleAirtelCallback);

// user
router.get('/user-profile', auth, mobileMoneyCallbackController.getUserProfile);

// Test route for MTN user info
router.get('/test-mtn-user-info', async (req, res) => {
    const UgandaMobileMoneyUtil = require('../utils/ugandaMobileMoneyUtil');
    const logger = require('../services/logger.service');
    const config = require('../config/ugandaMobileMoneyConfig');

    try {
        const testPhone = '+256782443845'; // Test phone number
        const mtnUtil = new UgandaMobileMoneyUtil('mtn');

        // Log out environment variables for debugging
        logger.info('MTN Configuration Details', {
            baseUrl: config.mtn.baseUrl,
            targetEnvironment: config.mtn.collection.targetEnvironment,
            userId: process.env.MTN_COLLECTION_USER_ID || 'MISSING',
            apiKey: process.env.MTN_COLLECTION_API_KEY ? 'PRESENT' : 'MISSING',
            primaryKey: process.env.MTN_COLLECTION_PRIMARY_KEY ? 'PRESENT' : 'MISSING',
            secondaryKey: process.env.MTN_COLLECTION_SECONDARY_KEY ? 'PRESENT' : 'MISSING'
        });

        logger.info('Testing MTN getUserInfo', { testPhone });

        // Get OAuth token first
        const token = await mtnUtil.getOAuth2Token();
        logger.info('OAuth Token Status', { 
            obtained: !!token,
            length: token ? token.length : 0 
        });

        // Get user info
        const userInfo = await mtnUtil.getUserInfo(testPhone);
        logger.info('MTN User Info Response', {
            success: userInfo.success,
            data: userInfo.data,
            error: userInfo.error,
            statusCode: userInfo.statusCode
        });

        res.json(userInfo);
    } catch (error) {
        logger.error('MTN Test Error', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            error: error.message,
            details: {
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
            },
            stack: error.stack
        });
    }
});

// Protected routes
router.get('/status/:paymentId', auth, mobileMoneyCallbackController.queryPaymentStatus);

module.exports = router;
