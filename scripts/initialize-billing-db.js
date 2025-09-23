// initialize-billing-db.js
const { Pool } = require('pg');
const fs = require('fs').promises;

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || '192.168.100.115',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '456456',
    database: process.env.DB_NAME || 'opsapps',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Read SQL file
async function readSQLFile(filepath) {
    try {
        const data = await fs.readFile(filepath, 'utf8');
        return data;
    } catch (err) {
        console.error('Error reading SQL file:', err);
        throw err;
    }
}

// Execute SQL statements
async function executeSQL(sql) {
    const client = await pool.connect();
    try {
        // Split by semicolon to execute multiple statements
        const statements = sql.split(';').filter(stmt => stmt.trim() !== '');
        
        for (const statement of statements) {
            if (statement.trim() !== '') {
                console.log('Executing:', statement.trim().substring(0, 50) + '...');
                await client.query(statement);
            }
        }
        
        console.log('SQL executed successfully');
    } catch (err) {
        console.error('Error executing SQL:', err);
        throw err;
    } finally {
        client.release();
    }
}

// Main function
async function main() {
    try {
        console.log('Creating ITSM Billing database schema...');
        
        // Read and execute schema
        const schemaSQL = await readSQLFile('./database/migrations/itsm_billing_schema.sql');
        await executeSQL(schemaSQL);
        console.log('Schema created successfully!');
        
        console.log('Seeding initial data...');
        
        // Read and execute seed data
        const seedSQL = await readSQLFile('./database/seeds/itsm_billing_seed.sql');
        await executeSQL(seedSQL);
        console.log('Data seeded successfully!');
        
        console.log('ITSM Billing database initialization completed!');
        
        // Close the pool
        await pool.end();
    } catch (err) {
        console.error('Failed to initialize database:', err);
        await pool.end();
        process.exit(1);
    }
}

// Run the script
main();