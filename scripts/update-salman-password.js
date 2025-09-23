// update-salman-password.js
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || '192.168.100.115',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '456456',
    database: process.env.DB_NAME || 'opsapps',
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function updateSalmanPassword() {
    try {
        // Hash the default password
        const saltRounds = 10;
        const defaultPassword = 'AdminPassword123!!';
        const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
        
        console.log('Updating Salman\'s password to default...');
        
        // Update Salman's password
        const result = await pool.query(
            `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
             WHERE email = $2 RETURNING id, full_name, email`,
            [
                hashedPassword,
                'mochsalmanr.work@gmail.com'
            ]
        );
        
        if (result.rowCount > 0) {
            console.log('Password updated successfully for:');
            console.log('ID:', result.rows[0].id);
            console.log('Name:', result.rows[0].full_name);
            console.log('Email:', result.rows[0].email);
        } else {
            console.log('User not found');
        }
        
    } catch (error) {
        console.error('Error updating password:', error.message);
    } finally {
        await pool.end();
    }
}

updateSalmanPassword();
