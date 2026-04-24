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

describe('Sites API Tests', () => {
    let authToken;
    let userId;

    beforeAll(async () => {
        await pool.query(`
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role VARCHAR(20) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
            CREATE TABLE IF NOT EXISTS sites (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(50) UNIQUE NOT NULL,
                template VARCHAR(30) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
        `);
        await pool.query('TRUNCATE TABLE users CASCADE');

        const email = `sitetest${Date.now()}@example.com`;
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'sitetester',
                email: email,
                password: 'pass123',
                role: 'author'
            });

        authToken = response.body.token;
        userId = response.body.user.id;
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('POST /api/sites', () => {
        it('should create a new site', async () => {
            const response = await request(app)
                .post('/api/sites')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Test Site',
                    slug: `test-site-${Date.now()}`,
                    template: 'blog'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('name', 'Test Site');
            expect(response.body).toHaveProperty('owner_id', userId);
        });

        it('should return 401 without auth token', async () => {
            const response = await request(app)
                .post('/api/sites')
                .send({
                    name: 'Unauthorized Site',
                    slug: 'unauth-site',
                    template: 'blog'
                });

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/sites', () => {
        it('should return list of sites', async () => {
            const response = await request(app)
                .get('/api/sites');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('DELETE /api/sites/:id', () => {
        it('should delete own site', async () => {
            const createRes = await request(app)
                .post('/api/sites')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Site to Delete',
                    slug: `delete-site-${Date.now()}`,
                    template: 'blog'
                });

            const siteId = createRes.body.id;

            const response = await request(app)
                .delete(`/api/sites/${siteId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Site deleted successfully');
        });
    });
});