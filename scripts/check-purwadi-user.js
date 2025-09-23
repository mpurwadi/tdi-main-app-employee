// check-purwadi-user.js
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || '192.168.100.115',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '456456',
    database: process.env.DB_NAME || 'opsapps',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function checkPurwadiUser() {
    const client = await pool.connect();
    try {
        console.log('Checking Purwadi user details...');
        
        // Check Purwadi user
        const result = await client.query(`
            SELECT id, email, full_name, role, status, 
                   LENGTH(password_hash) as password_length,
                   SUBSTRING(password_hash, 1, 20) as password_prefix,
                   created_at, updated_at
            FROM users 
            WHERE email = 'purwadi@tabeldata.com'
        `);
        
        if (result.rows.length === 0) {
            console.log('❌ Purwadi user not found in database');
            return;
        }
        
        const user = result.rows[0];
        console.log('✅ Purwadi user found:');
        console.log('  ID:', user.id);
        console.log('  Name:', user.full_name);
        console.log('  Email:', user.email);
        console.log('  Role:', user.role);
        console.log('  Status:', user.status);
        console.log('  Password hash length:', user.password_length);
        console.log('  Password hash prefix:', user.password_prefix);
        console.log('  Created:', user.created_at);
        console.log('  Updated:', user.updated_at);
        
    } catch (err) {
        console.error('Error checking Purwadi user:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkPurwadiUser();