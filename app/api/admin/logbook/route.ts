import { Pool } from 'pg';

export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { isAdmin } from "@/lib/auth";
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

// Get all pending logbook entries for admin approval
export async function GET(request: Request) {
    try {
        const auth = await verifyAuthServer();
        if (!isAdmin(auth)) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }
        
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'pending';
        
        const query = `
            SELECT le.id, le.user_id, le.entry_date, le.activity, le.work_type, le.start_time, le.end_time, le.status, le.created_at, le.updated_at, u.full_name, u.student_id, u.division
            FROM logbook_entries le
            JOIN users u ON le.user_id = u.id
            WHERE le.status = $1
            ORDER BY le.created_at DESC
        `;
        
        const result = await pool.query(query, [status]);
        
        return NextResponse.json(result.rows, { status: 200 });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error fetching logbook entries for approval:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

// Update logbook entry status (approve/reject)
export async function PUT(request: Request) {
    try {
        const auth = await verifyAuthServer();
        if (!isAdmin(auth)) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }
        
        const body = await request.json();
        const { entryId, status } = body; // status: 'approved' or 'rejected'
        
        // Validate required fields
        if (!entryId || !status) {
            return NextResponse.json({ message: 'Entry ID and status are required' }, { status: 400 });
        }
        
        // Validate status values
        const validStatuses = ['approved', 'rejected'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ message: 'Invalid status. Must be approved or rejected' }, { status: 400 });
        }
        
        // Update logbook entry status
        const result = await pool.query(
            'UPDATE logbook_entries SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, status',
            [status, entryId]
        );
        
        if (result.rowCount === 0) {
            return NextResponse.json({ message: 'Logbook entry not found' }, { status: 404 });
        }
        
        return NextResponse.json(result.rows[0], { status: 200 });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error updating logbook entry status:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}