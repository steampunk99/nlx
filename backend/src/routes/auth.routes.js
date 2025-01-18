const express = require('express');
const router = express.Router();
const { validateRegistration, validateLogin } = require('../middleware/validate');
const { isActive, auth } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');
const adminController = require('../controllers/admin.controller')

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
 * /auth/config:
 *   get:
 *     summary: Get public config
 *     tags: [Authentication]
 */
router.get('/config', adminController.getAdminConfig);

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
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 */
router.post('/forgot-password', authController.requestPasswordReset);

module.exports = router;
