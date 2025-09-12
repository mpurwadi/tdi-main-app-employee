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

export async function PUT(request: Request) {
    try {
        const auth = verifyAuth();
        if (!isAdmin(auth)) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { userId, status } = body;

        // Validate status
        if (!userId || !status) {
            return NextResponse.json({ message: 'User ID and status are required' }, { status: 400 });
        }

        // Validate status values
        const validStatuses = ['pending', 'approved', 'rejected', 'suspended'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ message: 'Invalid status. Must be one of: pending, approved, rejected, suspended' }, { status: 400 });
        }

        const result = await pool.query('UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id', [status, userId]);

        if (result.rowCount === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: `User status updated to ${status}` }, { status: 200 });

    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error updating user status:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}