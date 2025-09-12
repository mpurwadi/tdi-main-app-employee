import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Helper function to verify admin access
const verifyAdmin = async (token: string) => {
    try {
        const decodedToken: any = jwt.verify(token, JWT_SECRET);
        const userId = decodedToken.userId;
        
        // Check if user is superadmin (only superadmins can manage roles)
        const result = await db.query(
            'SELECT role FROM users WHERE id = $1',
            [userId]
        );
        
        if (result.rowCount === 0) {
            return { authorized: false, message: 'User not found' };
        }
        
        const userRole = result.rows[0].role;
        if (userRole !== 'superadmin') {
            return { authorized: false, message: 'Insufficient permissions. Only superadmins can manage roles.' };
        }
        
        return { authorized: true, userId, userRole };
    } catch (error) {
        return { authorized: false, message: 'Invalid token' };
    }
};

// PUT /api/admin/roles/assign - Assign a role to a user
export async function PUT(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const authResult = await verifyAdmin(token);
        if (!authResult.authorized) {
            return NextResponse.json({ message: authResult.message }, { status: 401 });
        }

        const { userId, role } = await req.json();

        // Validate input
        if (!userId || !role) {
            return NextResponse.json({ 
                success: false,
                message: 'User ID and role are required' 
            }, { status: 400 });
        }

        // Check if user exists
        const userResult = await db.query(
            'SELECT id, role FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rowCount === 0) {
            return NextResponse.json({ 
                success: false,
                message: 'User not found' 
            }, { status: 404 });
        }

        // Prevent changing superadmin role (security measure)
        const currentUserRole = userResult.rows[0].role;
        if (currentUserRole === 'superadmin') {
            return NextResponse.json({ 
                success: false,
                message: 'Cannot change superadmin role' 
            }, { status: 400 });
        }

        // Validate role
        const validRoles = ['user', 'admin'];
        if (!validRoles.includes(role)) {
            return NextResponse.json({ 
                success: false,
                message: `Invalid role. Valid roles are: ${validRoles.join(', ')}` 
            }, { status: 400 });
        }

        // Update user role
        await db.query(
            'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [role, userId]
        );

        return NextResponse.json({ 
            success: true,
            message: `User role updated to ${role}` 
        }, { status: 200 });

    } catch (error: any) {
        console.error('Admin Roles API Error (PUT):', error);
        return NextResponse.json({ 
            success: false,
            message: 'Internal server error' 
        }, { status: 500 });
    }
}