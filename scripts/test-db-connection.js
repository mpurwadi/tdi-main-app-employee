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

async function testDbConnection() {
    try {
        console.log('Testing database connection...');
        
        const client = await pool.connect();
        console.log('✅ Connected to database successfully');
        
        // Test a simple query
        const result = await client.query('SELECT NOW() as now');
        console.log('✅ Database query successful:', result.rows[0].now);
        
        // Check if Purwadi user exists
        console.log('\nChecking Purwadi user...');
        const userResult = await client.query(
            "SELECT id, email, full_name, role, status, password_hash FROM users WHERE email = 'purwadi@tabeldata.com'"
        );
        
        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            console.log('✅ User found:');
            console.log('   ID:', user.id);
            console.log('   Name:', user.full_name);
            console.log('   Email:', user.email);
            console.log('   Role:', user.role);
            console.log('   Status:', user.status);
            console.log('   Password hash length:', user.password_hash.length);
        } else {
            console.log('❌ Purwadi user not found in database');
        }
        
        client.release();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await pool.end();
    }
}

testDbConnection();