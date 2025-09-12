import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Helper function to verify admin access
const verifyAdmin = async (token: string) => {
    try {
        const decodedToken: any = jwt.verify(token, JWT_SECRET);
        const userId = parseInt(decodedToken.userId);
        
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

// GET /api/admin/reports/attendance - Fetch attendance report data
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

        const userId = authResult.userId;

        // Get query parameters
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const filterType = searchParams.get('filterType') || 'date'; // date, week, month

        // Build query based on filter type
        let query = `
            SELECT 
                ar.id,
                u.full_name,
                u.student_id,
                u.division,
                ar.clock_in_time,
                ar.check_out_time,
                ar.latitude,
                ar.longitude
            FROM attendance_records ar
            JOIN users u ON ar.user_id = u.id
            WHERE 1=1
        `;
        
        const params: any[] = [];
        let paramIndex = 1;

        // Apply date filters
        if (startDate && endDate) {
            query += ` AND ar.clock_in_time >= $${paramIndex} AND ar.clock_in_time <= $${paramIndex + 1}`;
            params.push(startDate, endDate);
            paramIndex += 2;
        } else if (startDate) {
            query += ` AND ar.clock_in_time >= $${paramIndex}`;
            params.push(startDate);
            paramIndex += 1;
        } else if (endDate) {
            query += ` AND ar.clock_in_time <= $${paramIndex}`;
            params.push(endDate);
            paramIndex += 1;
        }

        // Add ordering
        query += ' ORDER BY ar.clock_in_time DESC';

        // Execute query
        const result = await db.query(query, params);

        // Format the data for the frontend
        const attendanceData = result.rows.map(record => ({
            id: record.id,
            fullName: record.full_name,
            studentId: record.student_id,
            division: record.division,
            clockInTime: record.clock_in_time,
            clockOutTime: record.check_out_time,
            latitude: record.latitude,
            longitude: record.longitude
        }));

        return NextResponse.json({ 
            success: true,
            data: attendanceData,
            count: attendanceData.length
        }, { status: 200 });

    } catch (error: any) {
        console.error('Attendance Report API Error:', error);
        return NextResponse.json({ 
            success: false,
            message: 'Internal server error' 
        }, { status: 500 });
    }
}