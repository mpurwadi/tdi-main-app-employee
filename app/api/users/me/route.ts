
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { verifyAuthServer } from "@/lib/auth";
import { db } from '@/lib/db';

// GET current user's profile
export async function GET(request: Request) {
    try {
        const auth = await verifyAuthServer(); // Ensures user is authenticated

        const userResult = await db.query('SELECT id, full_name, email, student_id, campus, division, role FROM users WHERE id = $1', [auth.userId]);

        if (userResult.rows.length === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(userResult.rows[0], { status: 200 });

    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error fetching user profile:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

// UPDATE current user's profile
export async function PUT(request: Request) {
    try {
        const auth = await verifyAuthServer(); // Ensures user is authenticated
        const body = await request.json();
        const { fullName, studentId, campus, division } = body;

        // Users can only update their own profile.
        const query = `
            UPDATE users 
            SET full_name = $1, student_id = $2, campus = $3, division = $4, updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            RETURNING id, full_name, email, student_id, campus, division, role;
        `;
        const values = [fullName, studentId, campus, auth.userId, division];

        const updatedUser = await db.query(query, values);

        if (updatedUser.rowCount === 0) {
            return NextResponse.json({ message: 'User not found or update failed' }, { status: 404 });
        }

        return NextResponse.json(updatedUser.rows[0], { status: 200 });

    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error updating user profile:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
