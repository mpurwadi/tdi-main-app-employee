import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

export interface AuthPayload {
    userId: string;
    email: string;
    role: 'user' | 'admin' | 'superadmin' | 'service_catalog_manager' | 'service_provider' | 'service_requester' | 'approver' | 'billing_coordinator' | 'billing_admin' | 'change_requester' | 'change_manager' | 'cab_member' | 'implementer';
    division?: string;
    roles: string[]; // Array of additional roles
}

export async function verifyAuth() {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error('Unauthorized: No token provided');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
        
        // Fetch user from database to get latest roles and permissions
        const userResult = await db.query(
            'SELECT id, email, role, division, roles, is_service_catalog_manager, is_service_provider, is_service_requester, is_approver, is_billing_coordinator, is_change_requester, is_change_manager, is_cab_member, is_implementer FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (userResult.rows.length === 0) {
            throw new Error('Unauthorized: User not found');
        }

        const user = userResult.rows[0];
        
        // Build roles array
        const roles: string[] = [];
        if (user.roles && Array.isArray(user.roles)) {
            roles.push(...user.roles);
        }
        
        // Add role flags as roles
        if (user.is_service_catalog_manager) roles.push('service_catalog_manager');
        if (user.is_service_provider) roles.push('service_provider');
        if (user.is_service_requester) roles.push('service_requester');
        if (user.is_approver) roles.push('approver');
        if (user.is_billing_coordinator) roles.push('billing_coordinator');
        if (user.is_change_requester) roles.push('change_requester');
        if (user.is_change_manager) roles.push('change_manager');
        if (user.is_cab_member) roles.push('cab_member');
        if (user.is_implementer) roles.push('implementer');
        
        return {
            userId: user.id.toString(),
            email: user.email,
            role: user.role,
            division: user.division,
            roles: roles
        };
    } catch (error) {
        throw new Error('Unauthorized: Invalid token');
    }
}

export function isAdmin(payload: AuthPayload) {
    return payload.role === 'admin' || payload.role === 'superadmin';
}

// Function to check if user has specific role
export function hasRole(payload: AuthPayload, role: string) {
    return payload.role === role || payload.roles.includes(role);
}

// Function to check if user has any of the specified roles
export function hasAnyRole(payload: AuthPayload, roles: string[]) {
    return roles.includes(payload.role) || roles.some(role => payload.roles.includes(role));
}

// Function to check if user belongs to specific division
export function isInDivision(payload: AuthPayload, division: string) {
    return payload.division === division;
}