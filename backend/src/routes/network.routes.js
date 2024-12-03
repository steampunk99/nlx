const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { query, param } = require('express-validator');
const { validate } = require('../middleware/validate');
const networkController = require('../controllers/network.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     NetworkNode:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         sponsorId:
 *           type: string
 *         placementId:
 *           type: string
 *         position:
 *           type: integer
 *           enum: [1, 2]
 *         level:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         user:
 *           $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /network/referrals:
 *   get:
 *     summary: Get direct referrals
 *     tags: [Network]
 */
router.get('/referrals', auth, networkController.getDirectReferrals);

/**
 * @swagger
 * /network/children:
 *   get:
 *     summary: Get direct children in binary tree
 *     tags: [Network]
 */
router.get('/children', auth, networkController.getDirectChildren);

/**
 * @swagger
 * /network/binary-tree:
 *   get:
 *     summary: Get binary tree structure
 *     tags: [Network]
 */
router.get('/binary-tree', [
    auth,
    query('maxLevel').optional().isInt({ min: 1, max: 10 }).default(3),
    validate
], networkController.getBinaryTree);

/**
 * @swagger
 * /network/genealogy:
 *   get:
 *     summary: Get genealogy tree with ternary structure
 *     tags: [Network]
 */
router.get('/genealogy', [
    auth,
    query('depth').optional().isInt({ min: 1, max: 10 }).default(5),
    validate
], networkController.getGenealogyTree);

/**
 * @swagger
 * /network/stats:
 *   get:
 *     summary: Get network statistics
 *     tags: [Network]
 */
router.get('/stats', auth, networkController.getNetworkStats);

/**
 * @swagger
 * /network/team-performance:
 *   get:
 *     summary: Get team performance metrics
 *     tags: [Network]
 */
router.get('/team-performance', [
    auth,
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    validate
], networkController.getTeamPerformance);

/**
 * @swagger
 * /network/business-volume:
 *   get:
 *     summary: Get business volume statistics
 *     tags: [Network]
 */
router.get('/business-volume', [
    auth,
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    validate
], networkController.getBusinessVolume);

/**
 * @swagger
 * /network/rank-qualification:
 *   get:
 *     summary: Get rank qualification status
 *     tags: [Network]
 */
router.get('/rank-qualification', auth, networkController.getRankQualification);

/**
 * @swagger
 * /network/team-structure:
 *   get:
 *     summary: Get team structure view
 *     tags: [Network]
 */
router.get('/team-structure', [
    auth,
    query('view').optional().isIn(['binary', 'unilevel', 'matrix']).default('binary'),
    validate
], networkController.getTeamStructure);

/**
 * @swagger
 * /network/search:
 *   get:
 *     summary: Search network members
 *     tags: [Network]
 */
router.get('/search', [
    auth,
    query('query').notEmpty(),
    query('type').optional().isIn(['username', 'name', 'email']).default('username'),
    validate
], networkController.searchNetwork);

/**
 * @swagger
 * /network/network-stats:
 *   get:
 *     summary: Get network stats
 *     tags: [Network]
 */
router.get('/network-stats', auth, networkController.getNetworkStats);

/**
 * @swagger
 * /network/referral-link:
 *   get:
 *     summary: Generate unique referral link
 *     tags: [Network]
 *     security:
 *       - bearerAuth: []
 */
router.get('/referral-link', auth, networkController.generateReferralLink);

/**
 * @swagger
 * /network/referral/{code}/track:
 *   get:
 *     summary: Track referral link click
 *     tags: [Network]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Referral code to track
 */
router.get('/referral/:code/track', networkController.trackReferralClick);

/**
 * @swagger
 * /network/fix-relationships:
 *   post:
 *     summary: Fix relationships
 *     tags: [Network]
 */
router.post('/fix-relationships', auth, networkController.fixRelationships);

/**
 * @swagger
 * /network/fix-all-relationships:
 *   post:
 *     summary: Fix all relationships
 *     tags: [Network]
 */
router.post('/fix-all-relationships', auth, networkController.fixAllRelationships);

/**
 * @swagger
 * /network/levels:
 *   get:
 *     summary: Get network levels
 *     tags: [Network]
 */
router.get('/levels', auth, networkController.getNetworkLevels);

module.exports = router;
