import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

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

        // Fetch the last 10 attendance records for the user
        const result = await db.query(
            `SELECT id, clock_in_time, check_out_time, latitude, longitude 
             FROM attendance_records 
             WHERE user_id = $1 
             ORDER BY clock_in_time DESC 
             LIMIT 10`,
            [userId]
        );

        // Format the records for the frontend
        const records = result.rows.map(record => ({
            id: record.id,
            clockInTime: record.clock_in_time,
            clockOutTime: record.check_out_time,
            latitude: parseFloat(record.latitude),
            longitude: parseFloat(record.longitude)
        }));

        return NextResponse.json({ records }, { status: 200 });

    } catch (error: any) {
        console.error('Attendance History Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}