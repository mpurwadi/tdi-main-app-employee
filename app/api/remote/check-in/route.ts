import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Remote work coordinates for geofencing (must match frontend for consistency)
// For remote work, we'll allow a larger radius
const DEFAULT_LATITUDE = parseFloat(process.env.REMOTE_DEFAULT_LATITUDE || '-6.200000'); // Example: Jakarta
const DEFAULT_LONGITUDE = parseFloat(process.env.REMOTE_DEFAULT_LONGITUDE || '106.816666'); // Example: Jakarta
const REMOTE_GEOFENCE_RADIUS_METERS = parseInt(process.env.REMOTE_GEOFENCE_RADIUS_METERS || '50000'); // 50km radius for remote work

// Haversine formula to calculate distance between two lat/lon points
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // in metres
    return distance;
};

export async function POST(req: NextRequest) {
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

        const { latitude, longitude, workLocation } = await req.json();

        if (!latitude || !longitude) {
            return NextResponse.json({ message: 'Missing location data' }, { status: 400 });
        }

        // Geofencing validation for remote work
        // For remote work, we'll allow a larger radius but still validate location
        // In a real implementation, you might want to check against approved remote work locations
        if (isNaN(latitude) || isNaN(longitude)) {
            return NextResponse.json({ message: 'Invalid location data' }, { status: 400 });
        }

        // Check if user has already checked in today for remote work
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existingRecord = await db.query(
            `SELECT id FROM remote_checkin_records 
             WHERE user_id = $1 
             AND checkin_time >= $2
             ORDER BY checkin_time DESC 
             LIMIT 1`,
            [userId, today]
        );

        if (existingRecord && existingRecord.rowCount && existingRecord.rowCount > 0) {
            return NextResponse.json({ message: 'You have already checked in for remote work today.' }, { status: 400 });
        }

        // Record remote check-in
        const result = await db.query(
            'INSERT INTO remote_checkin_records (user_id, latitude, longitude, work_location, checkin_time) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING id, checkin_time',
            [userId, latitude, longitude, workLocation || 'Remote Location']
        );

        return NextResponse.json({ 
            message: 'Remote check-in successful!',
            recordId: result.rows[0].id,
            checkinTime: result.rows[0].checkin_time
        }, { status: 200 });

    } catch (error: any) {
        console.error('Remote Check-in Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}