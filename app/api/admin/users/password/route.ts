// app/api/admin/users/password/route.ts
import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, isAdmin } from '@/lib/auth';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Database connection pool using environment variables
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '456456',
    database: process.env.DB_NAME || 'opsapps',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Helper function to extract token from request
async function getTokenFromRequest(request: NextRequest) {
    // Check for token in Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    
    // Check for token in cookies
    const token = request.cookies.get('token')?.value;
    if (token) {
        return token;
    }
    
    return null;
}

// Helper function to verify auth with token
async function verifyAuthWithToken(token: string) {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        
        // Fetch user from database to get latest roles and permissions
        const userResult = await pool.query(
            'SELECT id, email, role FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (userResult.rows.length === 0) {
            throw new Error('User not found');
        }

        const user = userResult.rows[0];
        
        return {
            userId: user.id.toString(),
            email: user.email,
            role: user.role,
        };
    } catch (error) {
        throw new Error('Invalid token');
    }
}

// PUT /api/admin/users/password - Reset a user's password
export async function PUT(request: NextRequest) {
    try {
        // Get token from request
        const token = await getTokenFromRequest(request);
        
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
        }
        
        // Verify admin authentication
        let auth;
        try {
            auth = await verifyAuthWithToken(token);
        } catch (error) {
            return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
        }
        
        // Check if user is admin or superadmin
        if (auth.role !== 'admin' && auth.role !== 'superadmin') {
            return NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 });
        }

        const body = await request.json();
        const { userId, newPassword } = body;

        // Validate required fields
        if (!userId || !newPassword) {
            return NextResponse.json({ message: 'User ID and new password are required' }, { status: 400 });
        }

        // Validate password strength (at least 8 characters)
        if (newPassword.length < 8) {
            return NextResponse.json({ message: 'Password must be at least 8 characters long' }, { status: 400 });
        }

        // Check if user exists
        const userResult = await pool.query('SELECT id, email, full_name FROM users WHERE id = $1', [userId]);
        if (userResult.rowCount === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const user = userResult.rows[0];

        // Hash the new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update user's password
        await pool.query(
            'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [hashedPassword, userId]
        );

        return NextResponse.json({ 
            message: `Password successfully reset for user ${user.full_name} (${user.email})`,
            userId: user.id
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error resetting user password:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}