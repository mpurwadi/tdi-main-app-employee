import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/lib/db';

// Force dynamic rendering for this route to avoid static generation issues with cookies
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // NOTE: This is a temporary debug endpoint - remove in production
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
        
        const result = await db.query(query, params);
        
        // Add debug information
        const debugInfo = {
            rowCount: result.rowCount,
            columns: result.fields?.map((field: any) => field.name),
            sampleRows: result.rows.slice(0, 3),
            nullStatusEntries: result.rows.filter((row: any) => row.status === null).length
        };
        
        return NextResponse.json({
            entries: result.rows,
            debugInfo
        }, { status: 200 });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error fetching logbook entries:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}