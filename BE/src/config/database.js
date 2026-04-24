const { Pool } = require('pg');

let pool;

// Lazy initialization - create pool only when first used
function getPool() {
    if (pool) return pool;

    // Parse DATABASE_URL or use individual env vars
    let config;

    if (process.env.DATABASE_URL && !process.env.DB_HOST) {
        // Use DATABASE_URL only if DB_HOST is not set
        const url = new URL(process.env.DATABASE_URL);
        config = {
            host: url.hostname,
            port: url.port,
            database: url.pathname.split('/')[1],
            user: url.username,
            password: url.password
        };
    } else {
        // Prefer individual env vars (for tests)
        config = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'cms_db',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres'
        };
    }

    console.log('Database config:', {
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user
    });

    pool = new Pool(config);

    pool.on('error', (err) => {
        console.error('Unexpected database error:', err);
    });

    // Test connection
    pool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.log('Database connection failed:', err.message);
        } else {
            console.log('Database connected successfully at', res.rows[0].now);
        }
    });

    return pool;
}

// Export a Proxy that creates pool on first property access
module.exports = new Proxy({}, {
    get(target, prop) {
        const poolInstance = getPool();
        const value = poolInstance[prop];
        return typeof value === 'function' ? value.bind(poolInstance) : value;
    }
});