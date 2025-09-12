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

// GET /api/admin/roles - Fetch all roles
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const authResult = await verifyAdmin(token);
        if (!authResult.authorized) {
            return NextResponse.json({ message: authResult.message }, { status: 401 });
        }

        // Fetch all distinct roles from the users table
        const result = await db.query(
            'SELECT DISTINCT role FROM users ORDER BY role'
        );

        const roles = result.rows.map(row => row.role);

        return NextResponse.json({ 
            success: true,
            data: roles
        }, { status: 200 });

    } catch (error: any) {
        console.error('Admin Roles API Error (GET):', error);
        return NextResponse.json({ 
            success: false,
            message: 'Internal server error' 
        }, { status: 500 });
    }
}

// POST /api/admin/roles - Create a new role (not implemented as roles are predefined)
export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const authResult = await verifyAdmin(token);
        if (!authResult.authorized) {
            return NextResponse.json({ message: authResult.message }, { status: 401 });
        }

        return NextResponse.json({ 
            success: false,
            message: 'Role creation is not supported. Roles are predefined in the system.' 
        }, { status: 400 });

    } catch (error: any) {
        console.error('Admin Roles API Error (POST):', error);
        return NextResponse.json({ 
            success: false,
            message: 'Internal server error' 
        }, { status: 500 });
    }
}