
const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

// Database connection pool
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '456456',
    database: process.env.DB_NAME || 'opsapps',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

const initialDivisions = ['DevOps', 'Big Data', 'Produk', 'Operasional', 'Finance', 'Executive', 'Unassigned'];

async function runMigration() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Create divisions table if it doesn't exist
        console.log('Creating divisions table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS divisions (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Divisions table created or already exists.');

        // 2. Add columns to users table if they don't exist
        console.log('Altering users table...');
        const usersColumns = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name IN ('division_id', 'roles');
        `);

        if (!usersColumns.rows.find(c => c.column_name === 'division_id')) {
            await client.query('ALTER TABLE users ADD COLUMN division_id INTEGER REFERENCES divisions(id);');
            console.log('Column "division_id" added to users table.');
        } else {
            console.log('Column "division_id" already exists.');
        }

        if (!usersColumns.rows.find(c => c.column_name === 'roles')) {
            await client.query("ALTER TABLE users ADD COLUMN roles TEXT[] DEFAULT ARRAY[]::TEXT[];");
            console.log('Column "roles" added to users table.');
        } else {
            console.log('Column "roles" already exists.');
        }
        console.log('Users table altered successfully.');

        // 3. Populate divisions table
        console.log('Populating divisions table with initial data...');
        for (const divisionName of initialDivisions) {
            const res = await client.query('SELECT id FROM divisions WHERE name = $1', [divisionName]);
            if (res.rowCount === 0) {
                await client.query('INSERT INTO divisions (name) VALUES ($1)', [divisionName]);
                console.log(`- Division "${divisionName}" inserted.`);
            } else {
                console.log(`- Division "${divisionName}" already exists.`);
            }
        }
        console.log('Divisions table populated.');
        
        // 4. Set a default division for users without one
        console.log('Updating users with no division to "Unassigned"...');
        const unassignedDiv = await client.query('SELECT id FROM divisions WHERE name = $1', ['Unassigned']);
        const unassignedDivId = unassignedDiv.rows[0].id;
        await client.query('UPDATE users SET division_id = $1 WHERE division_id IS NULL', [unassignedDivId]);
        console.log('Default division set for existing users.');


        await client.query('COMMIT');
        console.log('\nMigration completed successfully!');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error during migration:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
