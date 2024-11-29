const request = require('supertest');
const app = require('../../app'); // Ensure this is the path to your Express app
const { generateUser } = require('../helpers/generators');

beforeAll(async () => {
    // Connect to the database or any setup needed
});

afterAll(async () => {
    // Disconnect from the database or any teardown needed
});

describe('Authentication Tests', () => {
    test('should register a new user with all required fields', async () => {
        const newUser = generateUser();
        const response = await request(app)
            .post('/api/auth/register')
            .send(newUser);
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('token');
        expect(response.body.user).toHaveProperty('email', newUser.email);
    });

    test('should not register user with existing email', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'testuser@example.com', // Assuming this user already exists
                password: 'password123'
            });
        expect(response.statusCode).toBe(400);
    });

    test('should login with valid credentials', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testuser@example.com',
                password: 'password123'
            });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    test('should not login with invalid credentials', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testuser@example.com',
                password: 'wrongpassword'
            });
        expect(response.statusCode).toBe(401);
    });
});
