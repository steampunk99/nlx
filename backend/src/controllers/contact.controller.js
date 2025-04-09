const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const emailService = require('../services/email.service');
const logger = require('../services/logger.service');

class ContactController {
  async handleSubmission(req, res) {
    const { name, email, message } = req.body;

    try {
      const success = await emailService.sendContactFormSubmission(name, email, message);

      if (success) {
        res.status(200).json({ 
          success: true, 
          message: 'Message sent successfully!' 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Failed to send message. Please try again later.' 
        });
      }
    } catch (error) {
      logger.error('Contact form submission error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'An internal server error occurred.' 
      });
    }
  }
}

// Validation rules for the contact form
const validateContactForm = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }).withMessage('Name must be less than 100 characters.'),
  body('email').trim().isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
  body('message').trim().notEmpty().withMessage('Message is required.').isLength({ max: 5000 }).withMessage('Message must be less than 5000 characters.'),
  validate // Middleware to handle validation results
];

module.exports = {
    contactController: new ContactController(),
    validateContactForm
}; 