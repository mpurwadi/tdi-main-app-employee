
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || '192.168.100.115',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '456456',
    database: process.env.DB_NAME || 'opsapps',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    ssl: process.env.DB_SSLMODE === 'disable' || !process.env.DB_SSLMODE ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
});

const userEmail = 'purwadi@tabeldata.com';

console.log(`Fetching user data for: ${userEmail}...`);

pool.query('SELECT id, email, full_name, role, roles FROM users WHERE email = $1', [userEmail], (err, res) => {
    if (err) {
        console.error('\nError fetching user data:', err.message);
        pool.end();
        process.exit(1);
    } else {
        if (res.rows.length > 0) {
            console.log('\nUser data found:');
            console.table(res.rows);
        } else {
            console.error(`\nUser not found with email: ${userEmail}`);
        }
        pool.end();
        process.exit(0);
    }
});

