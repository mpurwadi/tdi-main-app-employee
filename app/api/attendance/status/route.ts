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

        // Check if user has already checked in today but not checked out
        const today = new Date().toISOString().split('T')[0];
        const existingRecord = await db.query(
            `SELECT id, 
                    TO_CHAR(clock_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD HH24:MI:SS.MS') AS clock_in_time, 
                    TO_CHAR(clock_out_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD HH24:MI:SS.MS') AS clock_out_time
             FROM attendance_records 
             WHERE user_id = $1 
             AND DATE(clock_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') = $2 
             ORDER BY clock_in_time DESC 
             LIMIT 1`,
            [userId, today]
        );

        const isCheckedIn = existingRecord.rows.length > 0 && !existingRecord.rows[0].clock_out_time;
        const checkInTime = isCheckedIn ? existingRecord.rows[0].clock_in_time : null;

        return NextResponse.json({ 
            isCheckedIn,
            checkInTime
        }, { status: 200 });

    } catch (error: any) {
        console.error('Attendance Status Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}