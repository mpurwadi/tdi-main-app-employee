// check-user-passwords.js
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || '192.168.100.115',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '456456',
    database: process.env.DB_NAME || 'opsapps',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function checkUserPasswords() {
    const client = await pool.connect();
    try {
        console.log('Checking user password information...');
        
        // Check for admin users and their password info
        const result = await client.query(`
            SELECT id, email, role, status, full_name, 
                   LENGTH(password_hash) as password_length,
                   SUBSTRING(password_hash, 1, 20) as password_prefix
            FROM users 
            WHERE role IN ('admin', 'superadmin')
            ORDER BY id;
        `);
        
        console.log('Admin users password info:');
        result.rows.forEach(row => {
            console.log(`  ${row.id}: ${row.full_name} (${row.email})`);
            console.log(`     Role: ${row.role}, Status: ${row.status}`);
            console.log(`     Password hash length: ${row.password_length}`);
            console.log(`     Password hash prefix: ${row.password_prefix}`);
        });
        
        // Check a few regular users as well
        const regularUsers = await client.query(`
            SELECT id, email, role, status, full_name, 
                   LENGTH(password_hash) as password_length,
                   SUBSTRING(password_hash, 1, 20) as password_prefix
            FROM users 
            WHERE role = 'user'
            ORDER BY id
            LIMIT 3;
        `);
        
        console.log('\nRegular users password info:');
        regularUsers.rows.forEach(row => {
            console.log(`  ${row.id}: ${row.full_name} (${row.email})`);
            console.log(`     Role: ${row.role}, Status: ${row.status}`);
            console.log(`     Password hash length: ${row.password_length}`);
            console.log(`     Password hash prefix: ${row.password_prefix}`);
        });
        
    } catch (err) {
        console.error('Error checking user passwords:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkUserPasswords();