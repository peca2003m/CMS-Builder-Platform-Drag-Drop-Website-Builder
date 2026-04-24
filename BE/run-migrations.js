const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function runMigration(filename) {
    const migrationPath = path.join(__dirname, 'migrations', filename);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    try {
        await pool.query(sql);
        console.log('Izvrsen fajl: ' + filename);
    } catch (error) {
        console.error('Greska u fajlu ' + filename + ': ' + error.message);
        // Ne prekidamo skriptu da bi ostali fajlovi mogli da se probaju
    }
}

async function migrate() {
    try {
        console.log('Pokretanje migracija...');

        const migrationFiles = [
            '001_add_demo_column.sql',
            '002_alter_demo_column.sql',
            '003_drop_demo_column.sql'
        ];

        for (const file of migrationFiles) {
            await runMigration(file);
        }

        console.log('Gotovo!');
    } catch (error) {
        console.error('Migracija nije uspela:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    migrate();
}

module.exports = { migrate };