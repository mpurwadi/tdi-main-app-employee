
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

export interface AuthPayload {
    userId: string;
    email: string;
    role: 'user' | 'admin' | 'superadmin' | 'service_catalog_manager' | 'service_provider' | 'service_requester' | 'approver' | 'billing_coordinator' | 'billing_admin' | 'change_requester' | 'change_manager' | 'cab_member' | 'implementer';
    division?: string;
}

export function verifyAuth() {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error('Unauthorized: No token provided');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
        return decoded;
    } catch (error) {
        throw new Error('Unauthorized: Invalid token');
    }
}

export function isAdmin(payload: AuthPayload) {
    return payload.role === 'admin' || payload.role === 'superadmin';
}
