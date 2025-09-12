
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

// Database connection pool
const pool = new Pool({
    user: 'mpurwadi',
    host: 'localhost',
    database: 'opsapps',
    password: 'pratista17',
    port: 5432,
});

// It's crucial to use an environment variable for the JWT secret in a real application
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
        }

        // Find the user by email
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const user = userResult.rows[0];

        // Check user status
        if (user.status !== 'approved') {
            if (user.status === 'pending') {
                return NextResponse.json({ message: 'Your account is pending approval from an administrator.' }, { status: 403 });
            }
            if (user.status === 'rejected') {
                return NextResponse.json({ message: 'Your account has been rejected. Please contact support.' }, { status: 403 });
            }
            return NextResponse.json({ message: 'Account not active. Please contact support.' }, { status: 403 });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        const response = NextResponse.json(
            {
                message: 'Login successful',
                token,
                role: user.role,
            },
            { status: 200 }
        );

        // Set token in an HTTP-only cookie for security
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60, // 1 hour
        });

        return response;

    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
