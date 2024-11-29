const request = require('supertest');
const app = require('../../../app');
const { hash } = require('../../../utils/hash');

describe('User Registration', () => {
    it('should successfully register a new user', async () => {
        const userData = generateUser({
            username: 'testuser123',
            country: 'United States',
            sponsorUsername: 'admin',
            placementUsername: 'admin',
            position: 'LEFT'
        });
        
        const response = await request(app)
            .post('/api/auth/register')
            .send(userData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('token');
        expect(response.body.user).toMatchObject({
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName
        });

        // Verify user was created in database
        const createdUser = await prisma.user.findUnique({
            where: { email: userData.email }
        });
        expect(createdUser).toBeTruthy();
        expect(createdUser.email).toBe(userData.email);
    });

    it('should not register user with existing email', async () => {
        const userData = generateUser({
            username: 'testuser124',
            country: 'United States',
            sponsorUsername: 'admin',
            placementUsername: 'admin',
            position: 'LEFT'
        });
        
        // First registration
        await request(app)
            .post('/api/auth/register')
            .send(userData);

        // Attempt duplicate registration
        const response = await request(app)
            .post('/api/auth/register')
            .send(userData);

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/already exists/i);
    });

    it('should validate required fields', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('error');
        expect(response.body).toHaveProperty('errors');
    });

    it('should create a corresponding node for the new user', async () => {
        const userData = generateUser({
            username: 'testuser125',
            country: 'United States',
            sponsorUsername: 'admin',
            placementUsername: 'admin',
            position: 'LEFT'
        });
        
        const response = await request(app)
            .post('/api/auth/register')
            .send(userData);

        expect(response.status).toBe(201);
        
        // Verify node was created
        const user = await prisma.user.findUnique({
            where: { email: userData.email },
            include: { node: true }
        });
        
        expect(user.node).toBeTruthy();
        expect(user.node.position).toBe(userData.position);
        expect(user.node.level).toBe(1);
    });
});
