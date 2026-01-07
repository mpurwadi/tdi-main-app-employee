
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fullName, email, password, studentId, campus, division, jobRoleId } = body;

        // Basic validation
        if (!fullName || !email || !password || !studentId || !campus || !division || !jobRoleId) {
            return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert new user with job_role_id
        const query = `
            INSERT INTO users (full_name, email, password_hash, student_id, campus, division_id, job_role_id, status, role)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', 'user')
            RETURNING id;
        `;
        const values = [fullName, email, passwordHash, studentId, campus, division, jobRoleId];

        const newUser = await db.query(query, values);

        return NextResponse.json(
            {
                message: 'User registered successfully. Please wait for admin approval.',
                userId: newUser.rows[0].id,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
