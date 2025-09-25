export interface AuthPayload {
    userId: string;
    email: string;
    role: 'user' | 'admin' | 'superadmin';
    divisionId?: number;
    divisionName?: string;
    roles: string[]; // Array of division-specific roles like 'admin divisi', 'manager divisi'
}

/**
 * @deprecated Use isSuperadmin or isDivisionAdmin for more granular checks.
 */
export function isAdmin(payload: AuthPayload) {
    return payload.role === 'admin' || payload.role === 'superadmin';
}

export function isSuperadmin(payload: AuthPayload): boolean {
    return payload.role === 'superadmin';
}

export function isDivisionAdmin(payload: AuthPayload): boolean {
    return payload.roles.includes('admin divisi');
}

export function isDivisionManager(payload: AuthPayload): boolean {
    return payload.roles.includes('manager divisi');
}

// Function to check if user has a specific role (either top-level or in the roles array)
export function hasRole(payload: AuthPayload, role: string): boolean {
    return payload.role === role || payload.roles.includes(role);
}

// Function to check if user has any of the specified roles
export function hasAnyRole(payload: AuthPayload, roles: string[]): boolean {
    return roles.includes(payload.role) || roles.some(role => payload.roles.includes(role));
}

// Function to check if user belongs to a specific division by ID
export function isInDivision(payload: AuthPayload, divisionId: number): boolean {
    return payload.divisionId === divisionId;
}