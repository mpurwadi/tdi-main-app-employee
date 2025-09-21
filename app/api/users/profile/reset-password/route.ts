import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

export async function PUT(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const decodedToken: any = jwt.verify(token, JWT_SECRET);
        const userId = decodedToken.userId;

        const { currentPassword, newPassword } = await req.json();

        // Validate input
        if (!currentPassword || !newPassword) {
            return NextResponse.json({ message: 'Current password and new password are required' }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ message: 'New password must be at least 6 characters' }, { status: 400 });
        }

        // Get current user's password hash
        const userResult = await db.query(
            'SELECT password_hash FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const user = userResult.rows[0];

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isPasswordValid) {
            return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
        }

        // Hash new password
        const saltRounds = 10;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await db.query(
            'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [newPasswordHash, userId]
        );

        return NextResponse.json({ message: 'Password updated successfully' });
    } catch (error: any) {
        console.error('Error updating password:', error);
        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}