const { Pool } = require('pg');

const pool = new Pool({
    user: 'mpurwadi',
    host: 'localhost',
    database: 'opsapps',
    password: 'pratista17',
    port: 5432,
});

async function checkUsers() {
    try {
        const users = await pool.query('SELECT id, email, role, status FROM users LIMIT 10');
        
        console.log('Users in database:');
        console.log('----------------------------------------');
        if (users.rows.length > 0) {
            users.rows.forEach(user => {
                console.log(`ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Status: ${user.status}`);
            });
        } else {
            console.log('No users found');
        }
        
    } catch (error) {
        console.error('Error checking users:', error);
    } finally {
        await pool.end();
    }
}

checkUsers();