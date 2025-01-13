const { validationResult } = require('express-validator');
const Joi = require('joi');

// Express validator middleware
const validate = (validations) => {
    return async (req, res, next) => {
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        next();
    };
};

// Validation schemas
const registrationSchema = Joi.object({
    email: Joi.string().email().required().trim(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().required().trim(),
    lastName: Joi.string().required().trim(),
    phone: Joi.string().required().trim(),
    country: Joi.string().optional().trim(),
    referralCode: Joi.string().optional().trim(),
    position: Joi.number().valid(1, 2).optional()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().trim(),
    password: Joi.string().required()
});

const packageSchema = Joi.object({
    name: Joi.string().required().trim(),
    price: Joi.number().required().min(0),
    description: Joi.string().required(),
    features: Joi.array().items(Joi.string()),
    isActive: Joi.boolean().default(true)
});

const paymentSchema = Joi.object({
    
    phone: Joi.string().required().pattern(/^(0|\+?256)?(7[0-9]{8})$/),
    // paymentReference: Joi.string()
});

const withdrawalSchema = Joi.object({
    amount: Joi.number().required().min(0),
    currency: Joi.string().required().length(3),
    phone: Joi.string().required().trim(),
    provider: Joi.string().required().valid('mtn', 'airtel'),
    type: Joi.string().required().valid('mobile_money'),
    description: Joi.string().optional()
});

const commissionSchema = Joi.object({
    userId: Joi.number().required(),
    amount: Joi.number().required().min(0),
    type: Joi.string().required().valid('DIRECT', 'MATCHING', 'BINARY'),
    status: Joi.string().required().valid('PENDING', 'PROCESSED', 'WITHDRAWN'),
    sourceUserId: Joi.number().optional(),
    packageId: Joi.number().optional(),
    description: Joi.string().optional()
});

// Validation middleware functions
const validateSchema = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(detail => ({
                    field: detail.path[0],
                    message: detail.message
                }))
            });
        }
        next();
    };
};

// Export validation functions
module.exports = {
    validate,
    validateRegistration: validateSchema(registrationSchema),
    validateLogin: validateSchema(loginSchema),
    validatePackage: validateSchema(packageSchema),
    validatePayment: validateSchema(paymentSchema),
    validateWithdrawal: validateSchema(withdrawalSchema),
    validateCommission: validateSchema(commissionSchema)
};
