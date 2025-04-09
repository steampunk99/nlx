const express = require('express');
const router = express.Router();
const { contactController, validateContactForm } = require('../controllers/contact.controller');

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Submit the contact form
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 description: Sender's name
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Sender's email address
 *                 example: john.doe@example.com
 *               message:
 *                 type: string
 *                 description: Message content
 *                 example: I have a question about your services.
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Message sent successfully!
 *       400:
 *         description: Validation error (e.g., missing fields, invalid email)
 *       500:
 *         description: Internal server error (e.g., email sending failed)
 */
router.post('/', validateContactForm, contactController.handleSubmission);

module.exports = router; 