import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Helper function to verify authentication
const verifyAuth = (token: string) => {
    try {
        const decodedToken: any = jwt.verify(token, JWT_SECRET);
        return { userId: decodedToken.userId };
    } catch (error) {
        throw new Error('Unauthorized');
    }
};

// GET /api/calendar - Fetch calendar events (logbook entries and attendance records)
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const auth = verifyAuth(token);
        const userId = auth.userId;

        // Get date range from query parameters
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('start');
        const endDate = searchParams.get('end');

        let events: any[] = [];

        // Fetch logbook entries
        let logbookQuery = `
            SELECT id, entry_date, activity, work_type, start_time, end_time, status 
            FROM logbook_entries 
            WHERE user_id = $1`;
        let logbookParams: any[] = [userId];

        if (startDate && endDate) {
            logbookQuery += ' AND entry_date BETWEEN $2 AND $3';
            logbookParams.push(startDate, endDate);
        }

        const logbookResult = await db.query(logbookQuery, logbookParams);

        // Format logbook entries as calendar events
        const logbookEvents = logbookResult.rows.map(entry => ({
            id: `logbook-${entry.id}`,
            title: entry.activity,
            start: entry.start_time ? `${entry.entry_date}T${entry.start_time}` : entry.entry_date,
            end: entry.end_time ? `${entry.entry_date}T${entry.end_time}` : entry.entry_date,
            className: entry.work_type === 'remote' ? 'info' : 'primary',
            description: `${entry.work_type === 'remote' ? 'Remote Work' : 'Office Work'} - ${entry.activity}`,
            type: 'logbook',
            status: entry.status,
            extendedProps: {
                workType: entry.work_type,
                status: entry.status
            }
        }));

        events = events.concat(logbookEvents);

        // Fetch attendance records (absence data)
        let attendanceQuery = `
            SELECT id, clock_in_time, clock_out_time 
            FROM attendance_records 
            WHERE user_id = $1`;
        let attendanceParams: any[] = [userId];

        if (startDate && endDate) {
            attendanceQuery += ' AND DATE(clock_in_time) BETWEEN $2 AND $3';
            attendanceParams.push(startDate, endDate);
        }

        const attendanceResult = await db.query(attendanceQuery, attendanceParams);

        // Format attendance records as calendar events
        const attendanceEvents = attendanceResult.rows.map(record => {
            const clockInDate = new Date(record.clock_in_time);
            const clockOutDate = record.clock_out_time ? new Date(record.clock_out_time) : null;
            
            return {
                id: `attendance-${record.id}`,
                title: 'Work Day',
                start: clockInDate.toISOString(),
                end: clockOutDate ? clockOutDate.toISOString() : new Date(clockInDate.getTime() + 8 * 60 * 60 * 1000).toISOString(), // Default to 8 hours
                className: 'success',
                description: 'Attendance Record',
                type: 'attendance',
                extendedProps: {
                    clockIn: record.clock_in_time,
                    clockOut: record.clock_out_time
                }
            };
        });

        events = events.concat(attendanceEvents);

        // Fetch remote check-in records
        let remoteQuery = `
            SELECT id, checkin_time 
            FROM remote_checkin_records 
            WHERE user_id = $1`;
        let remoteParams: any[] = [userId];

        if (startDate && endDate) {
            remoteQuery += ' AND DATE(checkin_time) BETWEEN $2 AND $3';
            remoteParams.push(startDate, endDate);
        }

        const remoteResult = await db.query(remoteQuery, remoteParams);

        // Format remote check-in records as calendar events
        const remoteEvents = remoteResult.rows.map(record => {
            const checkinDate = new Date(record.checkin_time);
            
            return {
                id: `remote-${record.id}`,
                title: 'Remote Work Check-in',
                start: checkinDate.toISOString(),
                end: new Date(checkinDate.getTime() + 1000).toISOString(), // 1 second duration
                className: 'info',
                description: 'Remote Work Check-in',
                type: 'remote',
                extendedProps: {
                    checkinTime: record.checkin_time
                }
            };
        });

        events = events.concat(remoteEvents);

        // Fetch holidays
        try {
            let holidayQuery = `
                SELECT id, name, date, description, is_national
                FROM holidays`;
            
            let holidayParams: any[] = [];
            
            if (startDate && endDate) {
                holidayQuery += ' WHERE date BETWEEN $1 AND $2';
                holidayParams.push(startDate, endDate);
            }
            
            holidayQuery += ' ORDER BY date ASC';
            
            const holidayResult = await db.query(holidayQuery, holidayParams);
            
            // Format holidays as calendar events
            const holidayEvents = holidayResult.rows.map(holiday => ({
                id: `holiday-${holiday.id}`,
                title: holiday.name,
                start: holiday.date,
                end: holiday.date,
                className: holiday.is_national ? 'danger' : 'warning',
                description: holiday.description || holiday.name,
                type: 'holiday',
                extendedProps: {
                    isNational: holiday.is_national,
                    description: holiday.description || ''
                }
            }));
            
            events = events.concat(holidayEvents);
        } catch (error) {
            console.error('Error fetching holidays:', error);
            // Continue without holidays if there's an error
        }

        return NextResponse.json(events, { status: 200 });

    } catch (error: any) {
        console.error('Calendar API Error:', error);
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}