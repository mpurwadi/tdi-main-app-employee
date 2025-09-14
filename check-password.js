const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    user: 'mpurwadi',
    host: 'localhost',
    database: 'opsapps',
    password: 'pratista17',
    port: 5432,
});

async function checkPassword() {
    try {
        const users = await pool.query('SELECT id, email, password_hash FROM users WHERE email = $1', ['admin@tdi.com']);
        
        if (users.rows.length > 0) {
            const user = users.rows[0];
            console.log('User found:');
            console.log(`Email: ${user.email}`);
            console.log(`Password hash: ${user.password_hash}`);
            
            // Test password
            const isPasswordValid = await bcrypt.compare('admin123', user.password_hash);
            console.log(`Password valid: ${isPasswordValid}`);
        } else {
            console.log('User not found');
        }
        
    } catch (error) {
        console.error('Error checking password:', error);
    } finally {
        await pool.end();
    }
}

checkPassword();