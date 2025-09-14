import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        // Check attendance_records table
        const attendanceSchema = await db.query(`
            SELECT 
                column_name, 
                data_type, 
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'attendance_records'
            ORDER BY ordinal_position;
        `);
        
        // Check todo_list table
        const todoSchema = await db.query(`
            SELECT 
                column_name, 
                data_type, 
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'todo_list'
            ORDER BY ordinal_position;
        `);
        
        // Check logbook_entries table
        const logbookSchema = await db.query(`
            SELECT 
                column_name, 
                data_type, 
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'logbook_entries'
            ORDER BY ordinal_position;
        `);
        
        return NextResponse.json({
            attendance_records: attendanceSchema.rows,
            todo_list: todoSchema.rows,
            logbook_entries: logbookSchema.rows
        });
    } catch (error: any) {
        console.error('Error checking table schemas:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}