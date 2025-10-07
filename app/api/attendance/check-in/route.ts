import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Office coordinates for geofencing (must match frontend for consistency)
const OFFICE_LATITUDE = -6.9248406; // Updated coordinates
const OFFICE_LONGITUDE = 107.6586951; // Updated coordinates
const GEOFENCE_RADIUS_METERS = 400; // 400 meters

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

        const { latitude, longitude, action, manual, reason, late, lateReason } = await req.json();

        // Validate required fields
        if (!latitude || !longitude) {
            return NextResponse.json({ message: 'Location data is required' }, { status: 400 });
        }

        // For manual check-ins, we skip geofencing validation
        if (!manual) {
            // Geofencing validation for regular check-ins
            const distance = calculateDistance(latitude, longitude, OFFICE_LATITUDE, OFFICE_LONGITUDE);
            if (distance > GEOFENCE_RADIUS_METERS) {
                return NextResponse.json({ 
                    message: `You are ${distance.toFixed(2)} meters away from the office. Must be within ${GEOFENCE_RADIUS_METERS} meters.` 
                }, { status: 400 });
            }
        }

        if (action === 'check-out') {
            // For check-out, specifically look for active (not checked out) records
            const today = new Date().toISOString().split('T')[0];
            const activeCheckInRecord = await db.query(
                `SELECT id, clock_in_time, clock_out_time 
                 FROM attendance_records 
                 WHERE user_id = $1 
                 AND DATE(clock_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') = $2
                 AND clock_out_time IS NULL
                 ORDER BY clock_in_time DESC 
                 LIMIT 1`,
                [userId, today]
            );
            
            // Handle check-out
            if (activeCheckInRecord.rows.length === 0) {
                return NextResponse.json({ 
                    message: 'No active check-in found for today' 
                }, { status: 400 });
            }

            // Update the existing record with check-out time
            const updateQuery = manual 
                ? 'UPDATE attendance_records SET clock_out_time = NOW(), manual_checkout_reason = $1 WHERE id = $2'
                : 'UPDATE attendance_records SET clock_out_time = NOW() WHERE id = $1';
            
            const updateParams = manual 
                ? [reason, activeCheckInRecord.rows[0].id]
                : [activeCheckInRecord.rows[0].id];

            await db.query(updateQuery, updateParams);

            return NextResponse.json({ 
                message: manual ? 'Manual check-out successful!' : 'Check-out successful!' 
            }, { status: 200 });
        } else {
            // For check-in, check if user has any record today
            const today = new Date().toISOString().split('T')[0];
            const existingRecord = await db.query(
                `SELECT id, clock_in_time, clock_out_time 
                 FROM attendance_records 
                 WHERE user_id = $1 
                 AND DATE(clock_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') = $2 
                 ORDER BY clock_in_time DESC 
                 LIMIT 1`,
                [userId, today]
            );
            
            // Handle check-in
            if (existingRecord.rows.length > 0 && !existingRecord.rows[0].clock_out_time) {
                return NextResponse.json({ 
                    message: 'You have already checked in today. Please check out first.' 
                }, { status: 400 });
            }

            // If it's a late check-in, validate that the late reason is provided
            if (late) {
                if (!lateReason || !lateReason.trim()) {
                    return NextResponse.json({ 
                        message: 'Keterangan (reason) is required for late check-in' 
                    }, { status: 400 });
                }
            }

            // Record attendance with location - ensure using server timezone
            let insertQuery: string;
            let insertParams: any[];
            
            if (manual) {
                insertQuery = 'INSERT INTO attendance_records (user_id, qr_data, latitude, longitude, clock_in_time, manual_checkin_reason) VALUES ($1, $2, $3, $4, NOW(), $5)';
                insertParams = [userId, 'MANUAL_CHECK_IN', latitude, longitude, reason];
            } else if (late) {
                insertQuery = 'INSERT INTO attendance_records (user_id, qr_data, latitude, longitude, clock_in_time, late_checkin_reason) VALUES ($1, $2, $3, $4, NOW(), $5)';
                insertParams = [userId, 'LATE_CHECK_IN', latitude, longitude, lateReason];
            } else {
                insertQuery = 'INSERT INTO attendance_records (user_id, qr_data, latitude, longitude, clock_in_time) VALUES ($1, $2, $3, $4, NOW())';
                insertParams = [userId, 'GEOFENCE_CHECK_IN', latitude, longitude];
            }

            await db.query(insertQuery, insertParams);

            return NextResponse.json({ 
                message: late ? 'Late check-in recorded successfully!' : (manual ? 'Manual check-in successful!' : 'Check-in successful!') 
            }, { status: 200 });
        }

    } catch (error: any) {
        console.error('Attendance Check-in Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}