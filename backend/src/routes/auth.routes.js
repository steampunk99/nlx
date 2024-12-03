const express = require('express');
const router = express.Router();
const { validateRegistration, validateLogin } = require('../middleware/validate');
const { isActive, auth } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - username
 *         - firstName
 *         - lastName
 *         - phone
 *         - country
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *         username:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         phone:
 *           type: string
 *         country:
 *           type: string
 *   responses:
 *     UnauthorizedError:
 *       description: Authentication information is missing or invalid
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - phone
 *               - country
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               country:
 *                 type: string
 *               sponsorUsername:
 *                 type: string
 *               placementUsername:
 *                 type: string
 *               position:
 *                 type: number
 *                 enum: [1, 2]
 */
router.post('/register', validateRegistration, authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 */
router.post('/login', validateLogin, authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 */
router.post('/logout', isActive, authController.logout);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 */
router.post('/refresh', authController.refreshToken);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 */
router.post('/forgot-password', authController.requestPasswordReset);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Authentication]
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change password while logged in
 *     tags: [Authentication]
 */
router.post('/change-password', [
    isActive,
    authController.changePassword
]);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Profile]
 */
router.get('/profile', [auth, isActive], authController.getProfile);

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Profile]
 */
router.put('/profile', [
    isActive,
    authController.updateProfile
]);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify email address
 *     tags: [Authentication]
 */
router.post('/verify-email', authController.verifyEmail);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     tags: [Authentication]
 */
router.post('/resend-verification', [
    isActive,
    authController.resendVerification
]);

// /**
//  * @swagger
//  * /auth/2fa/enable:
//  *   post:
//  *     summary: Enable two-factor authentication
//  *     tags: [Authentication]
//  */
// router.post('/2fa/enable', isActive, authController.enable2FA);

// /**
//  * @swagger
//  * /auth/2fa/disable:
//  *   post:
//  *     summary: Disable two-factor authentication
//  *     tags: [Authentication]
//  */
// // router.post('/2fa/disable', isActive, authController.disable2FA);

// /**
//  * @swagger
//  * /auth/2fa/verify:
//  *   post:
//  *     summary: Verify 2FA token
//  *     tags: [Authentication]
//  */
// router.post('/2fa/verify', authController.verifyTwoFactor);

/**
 * @swagger
 * /auth/sessions:
 *   get:
 *     summary: Get all active sessions
 *     tags: [Authentication]
 */
router.get('/sessions', isActive, authController.getSessions);

/**
 * @swagger
 * /auth/sessions/{sessionId}:
 *   delete:
 *     summary: Terminate specific session
 *     tags: [Authentication]
 */
router.delete('/sessions/:sessionId', isActive, authController.terminateSession);

/**
 * @swagger
 * /auth/sessions:
 *   delete:
 *     summary: Terminate all sessions except current
 *     tags: [Authentication]
 */
router.delete('/sessions', isActive, authController.terminateAllSessions);

module.exports = router;
