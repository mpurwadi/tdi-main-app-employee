import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        // Get table schema information
        const schemaResult = await db.query(`
            SELECT 
                column_name, 
                data_type, 
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'logbook_entries'
            ORDER BY ordinal_position;
        `);
        
        // Get sample data to check status values
        const sampleData = await db.query(`
            SELECT id, entry_date, activity, status 
            FROM logbook_entries 
            LIMIT 5;
        `);
        
        // Check if there are any entries with NULL status
        const nullStatusCount = await db.query(`
            SELECT COUNT(*) as count 
            FROM logbook_entries 
            WHERE status IS NULL;
        `);
        
        return NextResponse.json({
            schema: schemaResult.rows,
            sampleData: sampleData.rows,
            nullStatusCount: nullStatusCount.rows[0].count
        });
    } catch (error: any) {
        console.error('Error checking logbook schema:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}