const express = require('express');
const cors = require('cors');
require('dotenv').config();
const helmet = require('helmet');

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    }
}));

app.get('/', (req, res) => {
    res.json({
        message: 'CMS Backend API is running!',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            sites: '/api/sites',
            pages: '/api/pages',
            media: '/api/media',
            comments: '/api/comments',
            admin: '/api/admin',
            stats: '/api/stats',
            docs: '/api-docs'
        }
    });
});
//rute
const { specs, swaggerUi } = require('./config/swagger');
const authRoutes = require('./routes/auth');
const siteRoutes = require('./routes/sites');
const pageRoutes = require('./routes/pages');
const mediaRoutes = require('./routes/media');
const commentRoutes = require('./routes/comments');
const adminRoutes = require('./routes/admin');
const statsRoutes = require('./routes/stats');

app.use('/api/auth', authRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Simple CMS API Docs'
}));

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;