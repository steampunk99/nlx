const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/environment');
const { prisma } = require('../config/prisma');

/**
 * Middleware to verify JWT token
 */
const auth = async (req, res, next) => {
    try {
        console.log(' Auth Middleware - Start');
        const authHeader = req.header('Authorization');
        console.log(' Auth Header:', authHeader);
        
        if (!authHeader) {
            console.log(' No auth header provided');
            return res.status(401).json({
                success: false,
                message: 'No authentication token provided'
            });
        }

        const token = authHeader.replace('Bearer ', '');
        console.log(' Token:', token.substring(0, 20) + '...');
        
        console.log(' JWT_SECRET from env:', process.env.JWT_SECRET ? ' Present' : ' Missing');
        console.log(' JWT_SECRET from config:', JWT_SECRET ? ' Present' : ' Missing');
        
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
            console.log(' Decoded token:', { ...decoded, iat: undefined, exp: undefined });
        } catch (error) {
            console.log(' Token verification failed:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        
        if (!decoded.userId) {
            console.log(' No userId in token');
            return res.status(401).json({
                success: false,
                message: 'Invalid token format'
            });
        }

        const userId = parseInt(decoded.userId, 10);
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                node: true
            }
        });
        console.log(' User found:', user ? ' Yes' : ' No');

        if (!user) {
            console.log(' User not found in database');
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if session is valid
        if (decoded.sessionId) {
            console.log(' Checking session:', decoded.sessionId);
            const session = await prisma.session.findUnique({
                where: { id: decoded.sessionId }
            });

            if (!session) {
                console.log(' Session not found');
                return res.status(401).json({
                    success: false,
                    message: 'Invalid session'
                });
            }
        }

        req.user = user;
        req.token = token;
        req.sessionId = decoded.sessionId;
        
        next();
    } catch (error) {
        console.log(' Auth Middleware Error:', error);
        return res.status(401).json({
            success: false,
            message: 'Authentication failed'
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
