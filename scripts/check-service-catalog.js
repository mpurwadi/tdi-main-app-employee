// check-service-catalog.js
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || '192.168.100.115',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '456456',
    database: process.env.DB_NAME || 'opsapps',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function checkServiceCatalog() {
    const client = await pool.connect();
    try {
        console.log('Checking service catalog items...');
        
        // Check existing service catalog items
        const result = await client.query(`
            SELECT id, name, division, unit_price, unit_type 
            FROM service_catalog
            ORDER BY id;
        `);
        
        console.log('Existing service_catalog items:');
        result.rows.forEach(row => {
            console.log(`  ${row.id}: ${row.name} (${row.division}) - Rp ${row.unit_price} per ${row.unit_type}`);
        });
        
        // If no items exist, insert our sample data
        if (result.rows.length === 0) {
            console.log('\nInserting sample service catalog items...');
            
            const services = [
                ['Server Maintenance', 'Monthly server maintenance and monitoring services', 'IT Operations', 'IT', 5000000, 'month'],
                ['Database Administration', 'Database administration and optimization services', 'IT Operations', 'IT', 7500000, 'month'],
                ['Network Support', 'Network infrastructure support and troubleshooting', 'IT Operations', 'IT', 4000000, 'month'],
                ['Software Development', 'Custom software development services', 'Development', 'IT', 150000, 'hour'],
                ['System Integration', 'System integration and API development', 'Development', 'IT', 200000, 'hour'],
                ['IT Consulting', 'IT strategy and consulting services', 'Consulting', 'IT', 300000, 'hour'],
                ['Cloud Services', 'Cloud infrastructure and management', 'Cloud', 'IT', 10000000, 'month'],
                ['Security Audit', 'Comprehensive security audit and assessment', 'Security', 'IT', 15000000, 'project'],
                ['Training Services', 'Technical training and workshops', 'Training', 'HR', 500000, 'session'],
                ['Helpdesk Support', 'Level 1 and Level 2 technical support', 'Support', 'IT', 3000000, 'month']
            ];
            
            for (const service of services) {
                await client.query(`
                    INSERT INTO service_catalog (name, description, category, division, unit_price, unit_type)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, service);
            }
            
            console.log('Sample service catalog items inserted successfully!');
            
            // Check again
            const newResult = await client.query(`
                SELECT id, name, division, unit_price, unit_type 
                FROM service_catalog
                ORDER BY id;
            `);
            
            console.log('\nUpdated service_catalog items:');
            newResult.rows.forEach(row => {
                console.log(`  ${row.id}: ${row.name} (${row.division}) - Rp ${row.unit_price} per ${row.unit_type}`);
            });
        } else {
            console.log(`\nFound ${result.rows.length} existing service catalog items.`);
        }
        
    } catch (err) {
        console.error('Error checking service catalog:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkServiceCatalog();