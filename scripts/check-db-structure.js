// check-db-structure.js
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || '192.168.100.115',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '456456',
    database: process.env.DB_NAME || 'opsapps',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function checkTableStructure() {
    const client = await pool.connect();
    try {
        // Check if service_catalog table exists and its columns
        const result = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'service_catalog'
            ORDER BY ordinal_position;
        `);
        
        console.log('service_catalog table columns:');
        result.rows.forEach(row => {
            console.log(`  ${row.column_name}: ${row.data_type}`);
        });
        
        // If table exists, let's check if we need to modify it
        const hasUnitPrice = result.rows.some(row => row.column_name === 'unit_price');
        if (!hasUnitPrice) {
            console.log('\nAdding unit_price column to service_catalog table...');
            await client.query(`
                ALTER TABLE service_catalog 
                ADD COLUMN IF NOT EXISTS unit_price DECIMAL(15,2) NOT NULL DEFAULT 0;
            `);
            console.log('unit_price column added successfully!');
        }
        
        const hasUnitType = result.rows.some(row => row.column_name === 'unit_type');
        if (!hasUnitType) {
            console.log('\nAdding unit_type column to service_catalog table...');
            await client.query(`
                ALTER TABLE service_catalog 
                ADD COLUMN IF NOT EXISTS unit_type VARCHAR(50) NOT NULL DEFAULT 'unit';
            `);
            console.log('unit_type column added successfully!');
        }
        
    } catch (err) {
        console.error('Error checking table structure:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkTableStructure();
