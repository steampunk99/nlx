const request = require('supertest');
const app = require('../../../app');
const { hash } = require('../../../utils/hash');

describe('User Login', () => {
    it('should successfully login an existing user', async () => {
        // Create a test user
        const password = 'TestPassword123!';
        const userData = generateUser({
            username: 'testuser123',
            password,
            country: 'United States',
            sponsorUsername: 'admin',
            placementUsername: 'admin',
            position: 'LEFT'
        });
        
        // Create user directly in database
        const hashedPassword = await hash(password);
        const user = await prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword
            }
        });

        // Create corresponding node
        await prisma.node.create({
            data: generateNode(user.id)
        });

        // Attempt login
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: userData.email,
                password: password
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body.user).toMatchObject({
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName
        });
    });

    it('should not allow login with incorrect password', async () => {
        // Create a test user
        const userData = generateUser({
            username: 'testuser124',
            country: 'United States',
            sponsorUsername: 'admin',
            placementUsername: 'admin',
            position: 'LEFT'
        });
        const hashedPassword = await hash(userData.password);
        
        const user = await prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword
            }
        });

        // Create corresponding node
        await prisma.node.create({
            data: generateNode(user.id)
        });

        // Attempt login with wrong password
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: userData.email,
                password: 'wrongpassword'
            });

        expect(response.status).toBe(401);
        expect(response.body.message).toMatch(/invalid.*credentials/i);
    });

    it('should not allow login for non-existent user', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'nonexistent@example.com',
                password: 'anypassword'
            });

        expect(response.status).toBe(401);
        expect(response.body.message).toMatch(/invalid.*credentials/i);
    });

    it('should validate required fields', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('error');
        expect(response.body).toHaveProperty('errors');
    });
});
