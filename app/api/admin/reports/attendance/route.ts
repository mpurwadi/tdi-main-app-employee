import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

// Force dynamic rendering for this route to avoid static generation issues with cookies
export const dynamic = 'force-dynamic';

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

        // Get query parameters
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const filterType = searchParams.get('filterType') || 'date'; // date, week, month

        // Build query to fetch data from both attendance_records and remote_checkin_records
        let query = `
            SELECT 
                id,
                user_id,
                full_name,
                student_id,
                division,
                TO_CHAR(clock_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD HH24:MI:SS.MS') AS clock_in_time,
                TO_CHAR(clock_out_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD HH24:MI:SS.MS') AS clock_out_time,
                latitude,
                longitude,
                'qr' as checkin_type
            FROM (
                SELECT 
                    ar.id,
                    ar.user_id,
                    u.full_name,
                    u.student_id,
                    u.division,
                    ar.clock_in_time,
                    ar.clock_out_time,
                    ar.latitude,
                    ar.longitude
                FROM attendance_records ar
                JOIN users u ON ar.user_id = u.id
                WHERE 1=1
        `;
        
        const params: any[] = [];
        let paramIndex = 1;

        // Apply date filters for QR attendance
        if (startDate && endDate) {
            query += ` AND ar.clock_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' >= $${paramIndex}`;
            params.push(startDate);
            paramIndex++;
            query += ` AND ar.clock_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' <= $${paramIndex}`;
            params.push(endDate);
            paramIndex++;
        } else if (startDate) {
            query += ` AND ar.clock_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' >= $${paramIndex}`;
            params.push(startDate);
            paramIndex++;
        } else if (endDate) {
            query += ` AND ar.clock_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' <= $${paramIndex}`;
            params.push(endDate);
            paramIndex++;
        }

        query += `
            ) AS qr_attendance
            
            UNION ALL
            
            SELECT 
                rcr.id,
                rcr.user_id,
                u.full_name,
                u.student_id,
                u.division,
                TO_CHAR(rcr.checkin_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD HH24:MI:SS.MS') as clock_in_time,
                NULL as clock_out_time,
                rcr.latitude,
                rcr.longitude,
                'remote' as checkin_type
            FROM remote_checkin_records rcr
            JOIN users u ON rcr.user_id = u.id
            WHERE 1=1
        `;

        // Apply date filters for remote check-in
        if (startDate && endDate) {
            query += ` AND rcr.checkin_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' >= $${paramIndex}`;
            params.push(startDate);
            paramIndex++;
            query += ` AND rcr.checkin_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' <= $${paramIndex}`;
            params.push(endDate);
            paramIndex++;
        } else if (startDate) {
            query += ` AND rcr.checkin_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' >= $${paramIndex}`;
            params.push(startDate);
            paramIndex++;
        } else if (endDate) {
            query += ` AND rcr.checkin_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' <= $${paramIndex}`;
            params.push(endDate);
            paramIndex++;
        }

        // Add ordering
        query += ' ORDER BY clock_in_time DESC';

        // Execute query
        const result = await db.query(query, params);

        // Format the data for the frontend
        const attendanceData = result.rows.map(record => ({
            id: record.id,
            userId: record.user_id,
            fullName: record.full_name,
            studentId: record.student_id,
            division: record.division,
            clockInTime: record.clock_in_time,
            clockOutTime: record.clock_out_time,
            latitude: parseFloat(record.latitude),
            longitude: parseFloat(record.longitude),
            checkinType: record.checkin_type // 'qr' or 'remote'
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