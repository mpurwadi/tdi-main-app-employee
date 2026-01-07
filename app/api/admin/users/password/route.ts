import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, isSuperadmin } from '@/lib/auth';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';

config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '456456',
    database: process.env.DB_NAME || 'opsapps',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

export async function PUT(request: NextRequest) {
    try {
        const auth = await verifyAuth(request);
        if (!isSuperadmin(auth)) {
            return NextResponse.json({ message: 'Forbidden: Only superadmins can reset user passwords.' }, { status: 403 });
        }

        const body = await request.json();
        const { userId, newPassword } = body;

        if (!userId || !newPassword) {
            return NextResponse.json({ message: 'User ID and new password are required' }, { status: 400 });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        const result = await pool.query(
            'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
            [hashedPassword, userId]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });

    } catch (error: any) {
        console.error('Error resetting password:', error);
        return NextResponse.json({ message: error.message || 'An internal server error occurred' }, { status: 500 });
    }
}
