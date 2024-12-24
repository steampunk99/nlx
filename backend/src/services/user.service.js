const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

class UserService {
    async findById(id) {
        if (!id) throw new Error('User ID is required');
        
        return prisma.user.findUnique({
            where: { 
                id: Number(id)
            },
            include: {
                node: {
                    include: {
                        package: {
                            include: {
                                package: true
                            }
                        }
                    }
                },
                withdrawals: {
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                        createdAt: true,
                        updatedAt: true
                    }
                }
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

    async findAll() {
        return prisma.user.findMany({
            include: {
                node: {
                    include: {
                        package: {
                            include: {
                                package: true
                            }
                        }
                    }
                }
            }
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

    async updateStatus(id, status) {
        if (!id) throw new Error('User ID is required');
        if (!status) throw new Error('Status is required');

        return prisma.user.update({
            where: { id: Number(id) },
            data: { status }
        });
    }

    async softDelete(id) {
        if (!id) throw new Error('User ID is required');

        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
            select: {
                email: true,
                username: true
            }
        });

        return prisma.user.update({
            where: { id: Number(id) },
            data: { 
                status: 'DELETED',
                email: `deleted_${Date.now()}_${user.email}`,
                username: `deleted_${Date.now()}_${user.username}`
            }
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
