const request = require('supertest');
const jwt = require('jsonwebtoken');
const { app } = require('../../../app');
const prisma = require('../../../config/prisma');
const { JWT_SECRET } = require('../../../config/environment');
const { generateUser } = require('../../helpers/generators');

describe('Auth Middleware', () => {
    let user;
    let token;

    beforeEach(async () => {
        // Create test user
        const userData = generateUser();
        user = await prisma.user.create({
            data: {
                ...userData,
                node: {
                    create: {
                        position: 'LEFT',
                        level: 1
                    }
                }
            },
            include: {
                node: true
            }
        });

        token = jwt.sign({ id: user.id }, JWT_SECRET);
    });

    afterEach(async () => {
        await prisma.node.deleteMany();
        await prisma.user.deleteMany();
    });

    describe('auth middleware', () => {
        it('should authenticate valid token', async () => {
            const response = await request(app)
                .get('/api/user/profile')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).not.toBe(401);
        });

        it('should reject request without token', async () => {
            const response = await request(app)
                .get('/api/user/profile');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('No authentication token provided');
        });

        it('should reject invalid token', async () => {
            const response = await request(app)
                .get('/api/user/profile')
                .set('Authorization', 'Bearer invalid_token');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Invalid authentication token');
        });

        it('should reject non-existent user', async () => {
            const nonExistentToken = jwt.sign({ id: 999999 }, JWT_SECRET);
            const response = await request(app)
                .get('/api/user/profile')
                .set('Authorization', `Bearer ${nonExistentToken}`);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('User not found');
        });
    });

    describe('admin middleware', () => {
        it('should allow admin access', async () => {
            // Update user to admin
            await prisma.user.update({
                where: { id: user.id },
                data: { role: 'ADMIN' }
            });

            const response = await request(app)
                .get('/api/admin/dashboard')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).not.toBe(403);
        });

        it('should reject non-admin access', async () => {
            const response = await request(app)
                .get('/api/admin/dashboard')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Access denied. Admin privileges required.');
        });
    });

    describe('active middleware', () => {
        it('should allow active user access', async () => {
            await prisma.user.update({
                where: { id: user.id },
                data: { status: 'ACTIVE' }
            });

            const response = await request(app)
                .get('/api/user/dashboard')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).not.toBe(403);
        });

        it('should reject inactive user access', async () => {
            await prisma.user.update({
                where: { id: user.id },
                data: { status: 'INACTIVE' }
            });

            const response = await request(app)
                .get('/api/user/dashboard')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Account is not active');
        });
    });
});
