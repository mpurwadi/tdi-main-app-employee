// test-db-connection.js
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || '192.168.100.115',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '456456',
    database: process.env.DB_NAME || 'opsapps',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function testConnection() {
    const client = await pool.connect();
    try {
        console.log('Connected to database successfully!');
        
        // Test a simple query
        const result = await client.query('SELECT NOW() as now');
        console.log('Database time:', result.rows[0].now);
        
        // Test if billing_records table exists
        const tableResult = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'billing_records'
            );
        `);
        console.log('Billing records table exists:', tableResult.rows[0].exists);
        
        // Test if we can query billing records
        if (tableResult.rows[0].exists) {
            const billingResult = await client.query('SELECT COUNT(*) as count FROM billing_records');
            console.log('Billing records count:', billingResult.rows[0].count);
        }
        
    } catch (err) {
        console.error('Database connection error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

testConnection();