import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Office coordinates for geofencing (must match frontend for consistency)
const OFFICE_LATITUDE = -6.200000; // Example: Jakarta
const OFFICE_LONGITUDE = 106.816666; // Example: Jakarta
const GEOFENCE_RADIUS_METERS = 100; // 100 meters

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

        const { qrData, latitude, longitude } = await req.json();

        if (!qrData || !latitude || !longitude) {
            return NextResponse.json({ message: 'Missing QR data or location' }, { status: 400 });
        }

        // Geofencing validation
        const distance = calculateDistance(latitude, longitude, OFFICE_LATITUDE, OFFICE_LONGITUDE);
        if (distance > GEOFENCE_RADIUS_METERS) {
            return NextResponse.json({ message: `You are ${distance.toFixed(2)} meters away from the office. Must be within ${GEOFENCE_RADIUS_METERS} meters.` }, { status: 400 });
        }

        // TODO: Add QR data validation (e.g., check if qrData matches expected office QR)
        // For now, any QR data is accepted if location is valid.

        // Record attendance
        await db.query(
            'INSERT INTO attendance_records (user_id, qr_data, latitude, longitude) VALUES ($1, $2, $3, $4)',
            [userId, qrData, latitude, longitude]
        );

        return NextResponse.json({ message: 'Check-in successful!' }, { status: 200 });

    } catch (error: any) {
        console.error('Attendance Check-in Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
