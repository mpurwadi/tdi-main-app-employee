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

        // Fetch the last 10 remote check-in records for the user
        const result = await db.query(
            `SELECT id, latitude, longitude, work_location, checkin_time 
             FROM remote_checkin_records 
             WHERE user_id = $1 
             ORDER BY checkin_time DESC 
             LIMIT 10`,
            [userId]
        );

        // Format the records for the frontend
        const records = result.rows.map(record => ({
            id: record.id,
            latitude: record.latitude,
            longitude: record.longitude,
            workLocation: record.work_location,
            checkinTime: record.checkin_time
        }));

        return NextResponse.json({ records }, { status: 200 });

    } catch (error: any) {
        console.error('Remote Check-in History Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}