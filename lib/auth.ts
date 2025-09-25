import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { AuthPayload, isAdmin, isSuperadmin, isDivisionAdmin, isDivisionManager, hasRole, hasAnyRole, isInDivision } from '@/lib/auth-helpers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Separate function for server components using cookies header
export async function verifyAuthServer(): Promise<AuthPayload> {
    const { cookies } = await import('next/headers');
    const token = cookies().get('token')?.value;

    if (!token) {
        throw new Error('Unauthorized: No token provided');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        
        const userResult = await db.query(
            `SELECT 
                u.id, 
                u.email, 
                u.role, 
                u.roles, 
                u.division_id,
                d.name as division_name
             FROM users u
             LEFT JOIN divisions d ON u.division_id = d.id
             WHERE u.id = $1`,
            [decoded.userId]
        );

        if (userResult.rows.length === 0) {
            throw new Error('Unauthorized: User not found');
        }

        const user = userResult.rows[0];
        
        const roles: string[] = Array.isArray(user.roles) ? user.roles : [];
        
        return {
            userId: user.id.toString(),
            email: user.email,
            role: user.role,
            divisionId: user.division_id,
            divisionName: user.division_name,
            roles: roles
        };
    } catch (error) {
        console.error('Token verification error:', error);
        throw new Error('Unauthorized: Invalid token');
    }
}

// Original function for middleware and API routes
export async function verifyAuth(request: NextRequest): Promise<AuthPayload> {
    const token = request.cookies.get('token')?.value;

    if (!token) {
        throw new Error('Unauthorized: No token provided');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        
        const userResult = await db.query(
            `SELECT 
                u.id, 
                u.email, 
                u.role, 
                u.roles, 
                u.division_id,
                d.name as division_name
             FROM users u
             LEFT JOIN divisions d ON u.division_id = d.id
             WHERE u.id = $1`,
            [decoded.userId]
        );

        if (userResult.rows.length === 0) {
            throw new Error('Unauthorized: User not found');
        }

        const user = userResult.rows[0];
        
        const roles: string[] = Array.isArray(user.roles) ? user.roles : [];
        
        return {
            userId: user.id.toString(),
            email: user.email,
            role: user.role,
            divisionId: user.division_id,
            divisionName: user.division_name,
            roles: roles
        };
    } catch (error) {
        console.error('Token verification error:', error);
        throw new Error('Unauthorized: Invalid token');
    }
}

export type { AuthPayload };
export { isAdmin, isSuperadmin, isDivisionAdmin, isDivisionManager, hasRole, hasAnyRole, isInDivision };