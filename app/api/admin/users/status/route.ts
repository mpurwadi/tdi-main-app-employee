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

export async function PUT(request: Request) {
    try {
        const auth = await verifyAuth();
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