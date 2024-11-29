const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

class UserService {
    async findById(id) {
        return prisma.user.findUnique({
            where: { id },
            include: {
                node: true,
                notifications: true,
                withdrawals: true,
                reports: true,
                commissions: true
            }
        });
    }

    /**
     * Find user by email
     * @param {string} email 
     * @returns {Promise<User>}
     */
    async findByEmail(email) {
        return prisma.user.findUnique({
            where: { email }
        });
    }

    async findByUsername(username) {
        return prisma.user.findUnique({
            where: { username }
        });
    }

    async create(userData) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        return prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword
            }
        });
    }

    async update(id, userData) {
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }
        return prisma.user.update({
            where: { id },
            data: userData
        });
    }

    async delete(id) {
        return prisma.user.delete({
            where: { id }
        });
    }

    async checkPassword(user, password) {
        return bcrypt.compare(password, user.password);
    }

    /**
     * Create a new session
     * @param {Object} sessionData
     * @returns {Promise<Session>}
     */
    async createSession(sessionData) {
        return prisma.session.create({
            data: {
                id: sessionData.sessionId,
                userId: parseInt(sessionData.userId),
                userAgent: sessionData.userAgent,
                ipAddress: sessionData.ipAddress,
                lastActive: sessionData.lastActive
            }
        });
    }

    /**
     * Remove a specific session
     * @param {number} userId
     * @param {string} sessionId
     * @returns {Promise<void>}
     */
    async removeSession(userId, sessionId) {
        await prisma.session.delete({
            where: {
                id: sessionId,
                userId: parseInt(userId)
            }
        });
    }

    /**
     * Get all active sessions for a user
     * @param {number} userId
     * @returns {Promise<Session[]>}
     */
    async getUserSessions(userId) {
        return prisma.session.findMany({
            where: {
                userId: parseInt(userId),
            },
            orderBy: {
                lastActive: 'desc'
            }
        });
    }

    /**
     * Update session last active timestamp
     * @param {string} sessionId
     * @returns {Promise<Session>}
     */
    async updateSessionActivity(sessionId) {
        return prisma.session.update({
            where: { id: sessionId },
            data: { lastActive: new Date() }
        });
    }

    /**
     * Remove all sessions for a user except the current one
     * @param {number} userId
     * @param {string} currentSessionId
     * @returns {Promise<void>}
     */
    async removeOtherSessions(userId, currentSessionId) {
        await prisma.session.deleteMany({
            where: {
                userId: parseInt(userId),
                NOT: {
                    id: currentSessionId
                }
            }
        });
    }
}

// add password reset


module.exports = new UserService();
