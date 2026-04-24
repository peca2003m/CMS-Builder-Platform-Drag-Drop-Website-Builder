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

describe('Pages API Tests', () => {
    let authToken;
    let siteId;

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
            CREATE TABLE IF NOT EXISTS pages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
                created_by UUID REFERENCES users(id),
                title VARCHAR(200) NOT NULL,
                slug VARCHAR(100) NOT NULL,
                content TEXT,
                draft_data TEXT,
                status VARCHAR(20),
                page_type VARCHAR(30),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
        `);
        await pool.query('TRUNCATE TABLE users CASCADE');

        const authRes = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'pagetester',
                email: `pagetest${Date.now()}@example.com`,
                password: 'pass123',
                role: 'author'
            });

        authToken = authRes.body.token;

        const siteRes = await request(app)
            .post('/api/sites')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                name: 'Test Site for Pages',
                slug: `page-test-site-${Date.now()}`,
                template: 'blog'
            });

        siteId = siteRes.body.id;
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('POST /api/pages', () => {
        it('should create a new page', async () => {
            const response = await request(app)
                .post('/api/pages')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    site_id: siteId,
                    title: 'Test Page',
                    slug: `test-page-${Date.now()}`,
                    page_type: 'post',
                    content: '<h1>Test Content</h1>',
                    status: 'draft'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('title', 'Test Page');
            expect(response.body).toHaveProperty('status', 'draft');
        });
    });

    describe('GET /api/pages/site/:siteId', () => {
        it('should return pages for a site', async () => {
            const response = await request(app)
                .get(`/api/pages/site/${siteId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('POST /api/pages/:id/publish', () => {
        it('should publish a draft page', async () => {
            const createRes = await request(app)
                .post('/api/pages')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    site_id: siteId,
                    title: 'Page to Publish',
                    slug: `publish-page-${Date.now()}`,
                    page_type: 'post',
                    content: '<p>Content</p>',
                    status: 'draft'
                });

            const pageId = createRes.body.id;

            const response = await request(app)
                .post(`/api/pages/${pageId}/publish`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'published');
        });
    });
});