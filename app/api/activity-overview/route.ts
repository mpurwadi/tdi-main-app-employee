import { NextResponse } from 'next/server';
import { verifyAuthServer } from '@/lib/auth';
import { db } from '@/lib/db';

// Force dynamic rendering for this route to avoid static generation issues with cookies
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const auth = await verifyAuthServer();
        
        // Get user ID from auth
        const userId = auth.userId;
        
        // Fetch attendance summary (last 30 days)
        // Note: attendance_records table doesn't have status column, so we'll count records instead
        const attendanceResult = await db.query(
            `SELECT 
                COUNT(*) as total_days,
                COUNT(CASE WHEN DATE(clock_in_time) = CURRENT_DATE THEN 1 END) as today_attendance
            FROM attendance_records 
            WHERE user_id = $1 AND clock_in_time >= CURRENT_DATE - INTERVAL '30 days'`,
            [userId]
        );
        
        const attendanceSummary = attendanceResult.rows[0];
        
        // Fetch logbook summary (last 30 days)
        const logbookResult = await db.query(
            `SELECT 
                COUNT(*) as total_entries,
                COUNT(CASE WHEN DATE(entry_date) = CURRENT_DATE THEN 1 END) as today_entries,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_entries,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_entries
            FROM logbook_entries 
            WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '30 days'`,
            [userId]
        );
        
        const logbookSummary = logbookResult.rows[0];
        
        // Check if todo_list table exists before querying
        const todoTableExists = await db.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'todo_list'
            );`
        );
        
        let todoSummary = {
            total_todos: 0,
            completed_todos: 0,
            in_progress_todos: 0,
            pending_todos: 0
        };
        
        if (todoTableExists.rows[0].exists) {
            const todoResult = await db.query(
                `SELECT 
                    COUNT(*) as total_todos,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_todos,
                    COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress_todos,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_todos
                FROM todo_list 
                WHERE user_id = $1`,
                [userId]
            );
            
            todoSummary = {
                total_todos: parseInt(todoResult.rows[0].total_todos) || 0,
                completed_todos: parseInt(todoResult.rows[0].completed_todos) || 0,
                in_progress_todos: parseInt(todoResult.rows[0].in_progress_todos) || 0,
                pending_todos: parseInt(todoResult.rows[0].pending_todos) || 0
            };
        }
        
        // Get recent activities (last 5 logbook entries)
        const recentActivities = await db.query(
            `SELECT id, entry_date, activity, status 
            FROM logbook_entries 
            WHERE user_id = $1 
            ORDER BY entry_date DESC 
            LIMIT 5`,
            [userId]
        );
        
        return NextResponse.json({
            attendance: {
                totalDays: parseInt(attendanceSummary.total_days) || 0,
                todayAttendance: parseInt(attendanceSummary.today_attendance) || 0,
                presentDays: parseInt(attendanceSummary.today_attendance) || 0, // Using today's attendance as present
                lateDays: 0 // Not available in current schema
            },
            logbook: {
                totalEntries: parseInt(logbookSummary.total_entries) || 0,
                todayEntries: parseInt(logbookSummary.today_entries) || 0,
                approvedEntries: parseInt(logbookSummary.approved_entries) || 0,
                pendingEntries: parseInt(logbookSummary.pending_entries) || 0
            },
            todos: todoSummary,
            recentActivities: recentActivities.rows
        });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error fetching activity overview:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}