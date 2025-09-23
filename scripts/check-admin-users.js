// check-admin-users.js
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || '192.168.100.115',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '456456',
    database: process.env.DB_NAME || 'opsapps',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function checkAdminUsers() {
    const client = await pool.connect();
    try {
        console.log('Checking admin users in database...');
        
        // Check for admin users
        const result = await client.query(`
            SELECT id, email, role, status, full_name
            FROM users 
            WHERE role IN ('admin', 'superadmin')
            ORDER BY id;
        `);
        
        console.log('Admin users found:', result.rows.length);
        result.rows.forEach(row => {
            console.log(`  ${row.id}: ${row.full_name} (${row.email}) - Role: ${row.role}, Status: ${row.status}`);
        });
        
        if (result.rows.length === 0) {
            console.log('No admin users found. Checking all users...');
            const allUsers = await client.query(`
                SELECT id, email, role, status, full_name
                FROM users 
                ORDER BY id
                LIMIT 10;
            `);
            
            console.log('First 10 users:');
            allUsers.rows.forEach(row => {
                console.log(`  ${row.id}: ${row.full_name} (${row.email}) - Role: ${row.role}, Status: ${row.status}`);
            });
        }
        
    } catch (err) {
        console.error('Error checking admin users:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkAdminUsers();