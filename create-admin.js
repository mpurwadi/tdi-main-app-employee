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

// Admin user details
const adminUser = {
    full_name: 'Purwadi',
    email: 'purwadi@tabeldata.com',
    password: 'AdminPassword123!!',
    student_id: null,
    campus: null,
    division: null,
    role: 'superadmin',
    status: 'approved'
};

async function createAdminUser() {
    try {
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(adminUser.password, saltRounds);
        
        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1', 
            [adminUser.email]
        );
        
        if (existingUser.rowCount > 0) {
            console.log('Admin user already exists, updating password and details...');
            
            // Update the existing user's password and details
            const result = await pool.query(
                `UPDATE users SET password_hash = $1, full_name = $2, role = $3, status = $4, 
                 student_id = $5, campus = $6, division = $7, updated_at = CURRENT_TIMESTAMP
                 WHERE email = $8 RETURNING id, full_name, email`,
                [
                    hashedPassword,
                    adminUser.full_name,
                    adminUser.role,
                    adminUser.status,
                    adminUser.student_id,
                    adminUser.campus,
                    adminUser.division,
                    adminUser.email
                ]
            );
            
            console.log('Admin user updated successfully:');
            console.log('ID:', result.rows[0].id);
            console.log('Name:', result.rows[0].full_name);
            console.log('Email:', result.rows[0].email);
            console.log('Role:', adminUser.role);
            console.log('Status:', adminUser.status);
            return;
        }
        
        // Insert new admin user
        const result = await pool.query(
            `INSERT INTO users (full_name, email, password_hash, student_id, campus, division, role, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, full_name, email`,
            [
                adminUser.full_name,
                adminUser.email,
                hashedPassword,
                adminUser.student_id,
                adminUser.campus,
                adminUser.division,
                adminUser.role,
                adminUser.status
            ]
        );
        
        console.log('Admin user created successfully:');
        console.log('ID:', result.rows[0].id);
        console.log('Name:', result.rows[0].full_name);
        console.log('Email:', result.rows[0].email);
        console.log('Role:', adminUser.role);
        console.log('Status:', adminUser.status);
        
        // Verify the user was created
        const verifyUser = await pool.query(
            'SELECT id, full_name, email, role, status FROM users WHERE email = $1',
            [adminUser.email]
        );
        
        console.log('Verification:', verifyUser.rows[0]);
        
    } catch (error) {
        console.error('Error creating admin user:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        await pool.end();
    }
}

createAdminUser();