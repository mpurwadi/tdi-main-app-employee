import { Pool } from 'pg';
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

// Database connection pool
const pool = new Pool({
    user: 'mpurwadi',
    host: 'localhost',
    database: 'opsapps',
    password: 'pratista17',
    port: 5432,
});

// Get logbook entries for a user
export async function GET(request: Request) {
    try {
        const auth = verifyAuth();
        
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        
        let query = 'SELECT id, user_id, entry_date, activity, work_type, start_time, end_time, status, created_at, updated_at FROM logbook_entries WHERE user_id = $1';
        let params: any[] = [auth.userId];
        
        if (startDate && endDate) {
            query += ' AND entry_date BETWEEN $2 AND $3';
            params.push(startDate, endDate);
        }
        
        query += ' ORDER BY entry_date DESC';
        
        const result = await pool.query(query, params);
        
        return NextResponse.json(result.rows, { status: 200 });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error fetching logbook entries:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

// Create a new logbook entry
export async function POST(request: Request) {
    try {
        const auth = verifyAuth();
        
        const body = await request.json();
        const { entryDate, activity, workType, startTime, endTime } = body;
        
        // Validate required fields
        if (!entryDate || !activity) {
            return NextResponse.json({ message: 'Entry date and activity are required' }, { status: 400 });
        }
        
        // Check if an entry already exists for this date
        const existingEntry = await pool.query(
            'SELECT id FROM logbook_entries WHERE user_id = $1 AND entry_date = $2',
            [auth.userId, entryDate]
        );
        
        if (existingEntry.rowCount && existingEntry.rowCount > 0) {
            return NextResponse.json({ message: 'A logbook entry already exists for this date' }, { status: 409 });
        }
        
        // Insert new logbook entry
        const result = await pool.query(
            'INSERT INTO logbook_entries (user_id, entry_date, activity, work_type, start_time, end_time, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, entry_date, activity, work_type, start_time, end_time, status',
            [auth.userId, entryDate, activity, workType || null, startTime || null, endTime || null, 'pending']
        );
        
        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error creating logbook entry:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

// Update a logbook entry
export async function PUT(request: Request) {
    try {
        const auth = verifyAuth();
        
        const body = await request.json();
        const { entryId, activity, workType, startTime, endTime } = body;
        
        // Validate required fields
        if (!entryId || !activity) {
            return NextResponse.json({ message: 'Entry ID and activity are required' }, { status: 400 });
        }
        
        // Check if entry exists and belongs to user
        const existingEntry = await pool.query(
            'SELECT id, status FROM logbook_entries WHERE id = $1 AND user_id = $2',
            [entryId, auth.userId]
        );
        
        if (existingEntry.rowCount === 0) {
            return NextResponse.json({ message: 'Logbook entry not found' }, { status: 404 });
        }
        
        // Prevent editing approved entries
        if (existingEntry.rows[0].status === 'approved') {
            return NextResponse.json({ message: 'Cannot edit approved logbook entries' }, { status: 400 });
        }
        
        // Update logbook entry
        const result = await pool.query(
            'UPDATE logbook_entries SET activity = $1, work_type = $2, start_time = $3, end_time = $4, status = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 AND user_id = $7 RETURNING id, entry_date, activity, work_type, start_time, end_time, status',
            [activity, workType || null, startTime || null, endTime || null, 'pending', entryId, auth.userId]
        );
        
        if (result.rowCount === 0) {
            return NextResponse.json({ message: 'Failed to update logbook entry' }, { status: 500 });
        }
        
        return NextResponse.json(result.rows[0], { status: 200 });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error updating logbook entry:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

// Delete a logbook entry
export async function DELETE(request: Request) {
    try {
        const auth = verifyAuth();
        
        const { searchParams } = new URL(request.url);
        const entryId = searchParams.get('entryId');
        
        if (!entryId) {
            return NextResponse.json({ message: 'Entry ID is required' }, { status: 400 });
        }
        
        // Check if entry exists and belongs to user
        const existingEntry = await pool.query(
            'SELECT id, status FROM logbook_entries WHERE id = $1 AND user_id = $2',
            [entryId, auth.userId]
        );
        
        if (existingEntry.rowCount === 0) {
            return NextResponse.json({ message: 'Logbook entry not found' }, { status: 404 });
        }
        
        // Prevent deleting approved entries
        if (existingEntry.rows[0].status === 'approved') {
            return NextResponse.json({ message: 'Cannot delete approved logbook entries' }, { status: 400 });
        }
        
        // Delete logbook entry
        const result = await pool.query(
            'DELETE FROM logbook_entries WHERE id = $1 AND user_id = $2 RETURNING id',
            [entryId, auth.userId]
        );
        
        if (result.rowCount === 0) {
            return NextResponse.json({ message: 'Failed to delete logbook entry' }, { status: 500 });
        }
        
        return NextResponse.json({ message: 'Logbook entry deleted successfully' }, { status: 200 });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error deleting logbook entry:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}