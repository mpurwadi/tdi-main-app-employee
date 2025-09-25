import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

// Force dynamic rendering for this route to avoid static generation issues with cookies
export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        let userId: number;
        try {
            const decodedToken: any = jwt.verify(token, JWT_SECRET);
            userId = decodedToken.userId;
        } catch (error: any) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        // Get query parameters for month and year filtering
        const url = new URL(req.url);
        const monthParam = url.searchParams.get('month');
        const yearParam = url.searchParams.get('year');
        
        let query = '';
        let params: any[] = [];
        
        if (monthParam && yearParam) {
            // Filter by specific month and year
            query = `SELECT id, 
                            TO_CHAR(clock_in_time AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD HH24:MI:SS.MS') AS clock_in_time, 
                            TO_CHAR(clock_out_time AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD HH24:MI:SS.MS') AS clock_out_time, 
                            latitude, longitude, manual_checkin_reason, manual_checkout_reason
                     FROM attendance_records 
                     WHERE user_id = $1 
                     AND EXTRACT(MONTH FROM clock_in_time AT TIME ZONE 'Asia/Jakarta') = $2
                     AND EXTRACT(YEAR FROM clock_in_time AT TIME ZONE 'Asia/Jakarta') = $3
                     ORDER BY clock_in_time DESC`;
            params = [userId, parseInt(monthParam), parseInt(yearParam)];
        } else {
            // Get records for current month by default
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
            const currentYear = currentDate.getFullYear();
            
            query = `SELECT id, 
                            TO_CHAR(clock_in_time AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD HH24:MI:SS.MS') AS clock_in_time, 
                            TO_CHAR(clock_out_time AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD HH24:MI:SS.MS') AS clock_out_time, 
                            latitude, longitude, manual_checkin_reason, manual_checkout_reason
                     FROM attendance_records 
                     WHERE user_id = $1 
                     AND EXTRACT(MONTH FROM clock_in_time AT TIME ZONE 'Asia/Jakarta') = $2
                     AND EXTRACT(YEAR FROM clock_in_time AT TIME ZONE 'Asia/Jakarta') = $3
                     ORDER BY clock_in_time DESC`;
            params = [userId, currentMonth, currentYear];
        }

        const result = await db.query(query, params);

        // Format the records for the frontend - use the server-formatted times directly
        const records = result.rows.map(record => ({
            id: record.id,
            clockInTime: record.clock_in_time,
            clockOutTime: record.clock_out_time,
            latitude: parseFloat(record.latitude),
            longitude: parseFloat(record.longitude),
            manualCheckinReason: record.manual_checkin_reason,
            manualCheckoutReason: record.manual_checkout_reason
        }));

        return NextResponse.json({ records }, { status: 200 });

    } catch (error: any) {
        console.error('Attendance History Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}