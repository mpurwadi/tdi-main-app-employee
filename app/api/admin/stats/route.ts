import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Helper function to verify admin access
const verifyAdmin = async (token: string) => {
    try {
        const decodedToken: any = jwt.verify(token, JWT_SECRET);
        const userId = decodedToken.userId;
        
        // Check if user is admin or superadmin
        const result = await db.query(
            'SELECT role FROM users WHERE id = $1',
            [userId]
        );
        
        if (result.rowCount === 0) {
            return { authorized: false, message: 'User not found' };
        }
        
        const userRole = result.rows[0].role;
        if (userRole !== 'admin' && userRole !== 'superadmin') {
            return { authorized: false, message: 'Insufficient permissions' };
        }
        
        return { authorized: true, userId, userRole };
    } catch (error) {
        return { authorized: false, message: 'Invalid token' };
    }
};

// GET /api/admin/stats - Fetch system statistics
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const authResult = await verifyAdmin(token);
        if (!authResult.authorized) {
            return NextResponse.json({ message: authResult.message }, { status: 401 });
        }

        // Fetch various statistics
        const stats: any = {};

        // Total users
        const usersResult = await db.query('SELECT COUNT(*) as count FROM users');
        stats.totalUsers = parseInt(usersResult.rows[0].count);

        // Users by division
        const usersByDivisionResult = await db.query(
            "SELECT division, COUNT(*) as count FROM users WHERE division IS NOT NULL AND division != '' GROUP BY division ORDER BY count DESC"
        );
        stats.usersByDivision = usersByDivisionResult.rows;

        // Total logbook entries
        const logbookResult = await db.query('SELECT COUNT(*) as count FROM logbook_entries');
        stats.totalLogbookEntries = parseInt(logbookResult.rows[0].count);

        // Total attendance records
        const attendanceResult = await db.query('SELECT COUNT(*) as count FROM attendance_records');
        stats.totalAttendanceRecords = parseInt(attendanceResult.rows[0].count);

        // Total remote check-ins
        const remoteResult = await db.query('SELECT COUNT(*) as count FROM remote_checkin_records');
        stats.totalRemoteCheckins = parseInt(remoteResult.rows[0].count);

        // Total news/announcements
        const newsResult = await db.query('SELECT COUNT(*) as count FROM news_announcements');
        stats.totalNewsAnnouncements = parseInt(newsResult.rows[0].count);

        // Recently joined users (last 7 days)
        const recentUsersResult = await db.query(
            "SELECT COUNT(*) as count FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'"
        );
        stats.recentUsers = parseInt(recentUsersResult.rows[0].count);

        return NextResponse.json({ 
            success: true,
            data: stats
        }, { status: 200 });

    } catch (error: any) {
        console.error('Admin Stats API Error:', error);
        return NextResponse.json({ 
            success: false,
            message: 'Internal server error' 
        }, { status: 500 });
    }
}