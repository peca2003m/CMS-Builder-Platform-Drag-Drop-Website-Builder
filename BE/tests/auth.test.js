process.env.NODE_ENV = 'test';
process.env.DB_HOST = '127.0.0.1';
process.env.DB_PORT = '5433';
process.env.DB_NAME = 'cms_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.JWT_SECRET = 'test_secret_key';
delete process.env.DATABASE_URL;

const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/database');

describe('Auth API Tests', () => {

    beforeAll(async () => {
        await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role VARCHAR(20) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
        `);
        await pool.query('TRUNCATE TABLE users CASCADE');
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const suffix = Date.now();
            const randomEmail = `test${suffix}@example.com`;
            const randomUser = `user_${suffix}`;

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: randomUser,
                    email: randomEmail,
                    password: 'password123',
                    role: 'author'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('email', randomEmail);
        });

        it('should return 400 if email already exists', async () => {
            const suffix = Date.now();
            const email = `duplicate${suffix}@example.com`;

            // Prva registracija
            await request(app)
                .post('/api/auth/register')
                .send({
                    username: `user1_${suffix}`,
                    email: email,
                    password: 'pass123',
                    role: 'author'
                });

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: `user2_${suffix}`,
                    email: email,
                    password: 'pass456',
                    role: 'author'
                });

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const suffix = Date.now();
            const email = `login${suffix}@example.com`;
            const password = 'testpass123';

            await request(app)
                .post('/api/auth/register')
                .send({
                    username: `loginuser_${suffix}`,
                    email: email,
                    password: password,
                    role: 'author'
                });

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: email,
                    password: password
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('email', email);
        });

        it('should return 401 with invalid password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/auth/me', () => {
        it('should return user info with valid token', async () => {
            const suffix = Date.now();
            const email = `me${suffix}@example.com`;

            const registerRes = await request(app)
                .post('/api/auth/register')
                .send({
                    username: `meuser_${suffix}`,
                    email: email,
                    password: 'pass123',
                    role: 'author'
                });

            const token = registerRes.body.token;

            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('email', email);
        });

        it('should return 401 without token', async () => {
            const response = await request(app)
                .get('/api/auth/me');

            expect(response.status).toBe(401);
        });
    });
});