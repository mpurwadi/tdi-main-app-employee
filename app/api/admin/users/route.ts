import { Pool } from 'pg';
import { NextResponse } from 'next/server';
import { verifyAuth, isAdmin } from '@/lib/auth';
import { config } from 'dotenv';

// Load environment variables
config();

// Database connection pool using environment variables
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '456456',
    database: process.env.DB_NAME || 'opsapps',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Get all users or users with specific status/role
export async function GET(request: Request) {
    try {
        const auth = await verifyAuth();
        if (!isAdmin(auth)) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const role = searchParams.get('role');
        const search = searchParams.get('search');

        let query = "SELECT id, full_name, email, student_id, campus, division, status, role, created_at, updated_at FROM users";
        let params: any[] = [];
        let conditions: string[] = [];
        let paramIndex = 1;
        
        if (status) {
            conditions.push(`status = $${paramIndex}`);
            params.push(status);
            paramIndex++;
        }
        
        if (role) {
            conditions.push(`role = ${paramIndex}`);
            params.push(role);
            paramIndex++;
        }
        
        if (search) {
            conditions.push(`(full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR student_id ILIKE $${paramIndex})`);
            params.push(`%${search}%`);
            paramIndex++;
        }
        
        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }
        
        query += " ORDER BY full_name";

        const result = await pool.query(query, params);

        return NextResponse.json(result.rows, { status: 200 });

    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error fetching users:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

// Create a new user
export async function POST(request: Request) {
    try {
        const auth = await verifyAuth();
        if (!isAdmin(auth)) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { full_name, email, student_id, campus, division, password, role } = body;

        // Validate required fields
        if (!full_name || !email || !student_id || !password) {
            return NextResponse.json({ message: 'Full name, email, student ID, and password are required' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1 OR student_id = $2', [email, student_id]);
        if (existingUser.rowCount && existingUser.rowCount > 0) {
            return NextResponse.json({ message: 'User with this email or student ID already exists' }, { status: 409 });
        }

        // Insert new user (password should be hashed in a real implementation)
        const result = await pool.query(
            'INSERT INTO users (full_name, email, student_id, campus, division, password, role, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
            [full_name, email, student_id, campus || '', division || '', password, role || 'user', 'approved']
        );

        return NextResponse.json({ message: 'User created successfully', userId: result.rows[0].id }, { status: 201 });

    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error creating user:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

// Update a user
export async function PUT(request: Request) {
    try {
        const auth = await verifyAuth();
        if (!isAdmin(auth)) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { userId, full_name, email, student_id, campus, division, role } = body;

        // Validate required fields
        if (!userId) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }

        // Update user
        const result = await pool.query(
            'UPDATE users SET full_name = $1, email = $2, student_id = $3, campus = $4, division = $5, role = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING id',
            [full_name, email, student_id, campus || '', division || '', role || 'user', userId]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User updated successfully' }, { status: 200 });

    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error updating user:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

// Delete a user
export async function DELETE(request: Request) {
    try {
        const auth = await verifyAuth();
        if (!isAdmin(auth)) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }

        // Delete user
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);

        if (result.rowCount === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });

    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error deleting user:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}