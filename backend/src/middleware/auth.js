const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/environment');
const prisma = require('../config/prisma');


/**
 * Middleware to verify JWT token
 */
const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'No authentication token provided'
            });
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                node: true
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if session is valid
        if (decoded.sessionId) {
            const session = await prisma.session.findUnique({
                where: { id: decoded.sessionId }
            });

            if (!session) {
                return res.status(401).json({
                    success: false,
                    message: 'Session expired'
                });
            }

            // Update last active timestamp
            await prisma.session.update({
                where: { id: decoded.sessionId },
                data: { lastActive: new Date() }
            });
        }

        req.user = user;
        req.token = token;
        req.sessionId = decoded.sessionId;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid authentication token'
        });
    }
};

/**
 * Middleware to check if user is admin
 */
const isAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        next();
    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Middleware to check if user is active
 */
const isActive = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                node: true
            }
        });

        if (!user || user.status !== 'ACTIVE') {
            return res.status(403).json({
                success: false,
                message: 'Account is not active'
            });
        }

        next();
    } catch (error) {
        console.error('Active check error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    auth,
    isAdmin,
    isActive
};
