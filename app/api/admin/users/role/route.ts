import { Pool } from 'pg';
import { NextResponse } from 'next/server';
import { verifyAuth, isAdmin } from '@/lib/auth';

// Database connection pool
const pool = new Pool({
    user: 'mpurwadi',
    host: 'localhost',
    database: 'opsapps',
    password: 'pratista17',
    port: 5432,
});

// Update user role
export async function PUT(request: Request) {
    try {
        const auth = verifyAuth();
        if (!isAdmin(auth)) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { userId, role } = body;

        // Validate inputs
        if (!userId || !role) {
            return NextResponse.json({ message: 'User ID and role are required' }, { status: 400 });
        }

        // Validate role values
        const validRoles = ['user', 'admin', 'superadmin'];
        if (!validRoles.includes(role)) {
            return NextResponse.json({ message: 'Invalid role. Must be one of: user, admin, superadmin' }, { status: 400 });
        }

        // Update user role
        const result = await pool.query(
            'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
            [role, userId]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User role updated successfully' }, { status: 200 });

    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error updating user role:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}