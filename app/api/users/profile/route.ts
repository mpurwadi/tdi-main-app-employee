import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db'; // Assuming a db utility exists

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key'; // Ensure this matches the secret used for signing tokens

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const decodedToken: any = jwt.verify(token, JWT_SECRET);
        const userId = decodedToken.userId;

        const user = await db.query(
            'SELECT u.id, u.full_name, u.email, u.student_id, u.campus, u.status, u.role, u.division_id, d.name as division_name FROM users u LEFT JOIN divisions d ON u.division_id = d.id WHERE u.id = $1',
            [userId]
        );

        if (user.rows.length === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user.rows[0]);
    } catch (error: any) {
        console.error('Error fetching user profile:', error);
        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const decodedToken: any = jwt.verify(token, JWT_SECRET);
        const userId = decodedToken.userId;

        const { full_name, student_id, campus, division_id } = await req.json();

        // Basic validation
        if (!full_name || !student_id || !campus || division_id === undefined || division_id === null) {
            return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
        }

        const updatedUser = await db.query(
            'UPDATE users SET full_name = $1, student_id = $2, campus = $3, division_id = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, full_name, email, student_id, campus, division_id, status, role',
            [full_name, student_id, campus, division_id, userId]
        );

        if (updatedUser.rows.length === 0) {
            return NextResponse.json({ message: 'User not found or no changes made' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser.rows[0] });
    } catch (error: any) {
        console.error('Error updating user profile:', error);
        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
