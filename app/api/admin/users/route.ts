import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, AuthPayload, isSuperadmin, isDivisionAdmin, isDivisionManager } from '@/lib/auth';
import { config } from 'dotenv';
import bcrypt from 'bcrypt';

config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '456456',
    database: process.env.DB_NAME || 'opsapps',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

// GET users based on role
export async function GET(request: NextRequest) {
    try {
        const auth = await verifyAuth(request);

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const offset = (page - 1) * limit;

        const emailFilter = searchParams.get('emailFilter');
        const fullNameFilter = searchParams.get('fullNameFilter');
        const divisionNameFilter = searchParams.get('divisionNameFilter');
        const roleFilter = searchParams.get('roleFilter');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        let filterConditions: string[] = [];
        let filterParams: any[] = [];
        let paramIndex = 1;

        if (emailFilter) {
            filterConditions.push(`u.email ILIKE $${paramIndex++}`);
            filterParams.push(`%${emailFilter}%`);
        }
        if (fullNameFilter) {
            filterConditions.push(`u.full_name ILIKE $${paramIndex++}`);
            filterParams.push(`%${fullNameFilter}%`);
        }
        if (divisionNameFilter) {
            filterConditions.push(`d.name ILIKE $${paramIndex++}`);
            filterParams.push(`%${divisionNameFilter}%`);
        }
        if (roleFilter) {
            filterConditions.push(`(u.role ILIKE $${paramIndex} OR $${paramIndex} = ANY(u.roles))`);
            filterParams.push(`%${roleFilter}%`);
            paramIndex++;
        }
        if (status) {
            filterConditions.push(`u.status = $${paramIndex++}`);
            filterParams.push(status);
        }
        if (search) {
            filterConditions.push(`(u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR u.student_id ILIKE $${paramIndex})`);
            filterParams.push(`%${search}%`);
            paramIndex++;
        }

        // Add division filter for non-superadmins
        if (!isSuperadmin(auth)) {
            if (!auth.divisionId) {
                return NextResponse.json({ message: 'Admin is not assigned to a division' }, { status: 400 });
            }
            filterConditions.push(`u.division_id = $${paramIndex++}`);
            filterParams.push(auth.divisionId);
        }

        const whereClause = filterConditions.length > 0 ? ` WHERE ${filterConditions.join(' AND ')}` : '';

        // Count total users
        const countQuery = `
            SELECT COUNT(u.id)
            FROM users u
            LEFT JOIN divisions d ON u.division_id = d.id
            ${whereClause}
        `;
        const countResult = await pool.query(countQuery, filterParams);
        const totalCount = parseInt(countResult.rows[0].count, 10);

        // Determine the starting parameter index for LIMIT and OFFSET
        const limitOffsetParamIndex = filterParams.length + 1;

        // Fetch paginated users
        const limitParamIndex = filterParams.length + 1;
        const offsetParamIndex = filterParams.length + 2;
        const userQuery = 
            "SELECT u.id, u.full_name, u.email, u.student_id, u.campus, u.status, u.role, u.roles, u.created_at, u.updated_at, u.division_id, d.name as division_name, u.job_role_id, jr.name as job_role_name " +
            "FROM users u " +
            "LEFT JOIN divisions d ON u.division_id = d.id " +
            "LEFT JOIN job_roles jr ON u.job_role_id = jr.id " +
            (whereClause ? whereClause + " " : "") +
            "ORDER BY u.full_name " +
            "LIMIT $" + limitParamIndex + " OFFSET $" + offsetParamIndex;
        const userQueryParams = [...filterParams, limit, offset];
        console.log('User query:', userQuery);
        console.log('User query params:', userQueryParams);
        const usersResult = await pool.query(userQuery, userQueryParams);

        const formattedUsers = usersResult.rows.map(user => ({
            ...user,
            roles: user.roles || [] // Ensure roles is always an array
        }));

        return NextResponse.json({ users: formattedUsers, totalCount }, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ message: error.message || 'An internal server error occurred' }, { status: 500 });
    }
}

// PUT - Update user division or roles
export async function PUT(request: NextRequest) {
    try {
        const auth = await verifyAuth(request);
        const body = await request.json();
        const { userId, action, payload } = body;

        if (!userId || !action) {
            return NextResponse.json({ message: 'User ID and action are required' }, { status: 400 });
        }

        const targetUserResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (targetUserResult.rowCount === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        const targetUser = targetUserResult.rows[0];

        switch (action) {
            case 'update_user':
                if (!isSuperadmin(auth)) {
                    return NextResponse.json({ message: 'Forbidden: Only superadmins can update user information.' }, { status: 403 });
                }
                const { full_name, email, student_id, campus, division_id, job_role_id } = payload;
                
                await pool.query(
                    'UPDATE users SET full_name = $1, email = $2, student_id = $3, campus = $4, division_id = $5, job_role_id = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7',
                    [full_name, email, student_id, campus, division_id, job_role_id || null, userId]
                );
                return NextResponse.json({ message: 'User information updated successfully.' }, { status: 200 });

            case 'assign_division':
                if (!isSuperadmin(auth)) {
                    return NextResponse.json({ message: 'Forbidden: Only superadmins can assign divisions.' }, { status: 403 });
                }
                const { divisionId } = payload;
                await pool.query('UPDATE users SET division_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [divisionId, userId]);
                return NextResponse.json({ message: 'User division assigned successfully.' }, { status: 200 });

            case 'update_global_role':
                if (!isSuperadmin(auth)) {
                    return NextResponse.json({ message: 'Forbidden: Only superadmins can update global roles.' }, { status: 403 });
                }
                const { role } = payload;
                if (!['user', 'superadmin'].includes(role)) {
                    return NextResponse.json({ message: 'Invalid global role provided.' }, { status: 400 });
                }
                await pool.query('UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [role, userId]);
                return NextResponse.json({ message: 'User global role updated successfully.' }, { status: 200 });

            case 'update_roles':
                const { roles } = payload;
                if (!Array.isArray(roles)) {
                    return NextResponse.json({ message: 'Payload "roles" must be an array.' }, { status: 400 });
                }

                if (isSuperadmin(auth)) {
                    // Superadmin can assign any role, including 'admin divisi'
                    await pool.query('UPDATE users SET roles = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [roles, userId]);
                    return NextResponse.json({ message: 'User roles updated successfully by superadmin.' }, { status: 200 });
                }

                if (isDivisionAdmin(auth)) {
                    if (auth.divisionId !== targetUser.division_id) {
                        return NextResponse.json({ message: 'Forbidden: Division admins can only manage users in their own division.' }, { status: 403 });
                    }
                    // Allowed roles for a division admin to assign
                    const allowedRoles = ['admin divisi', 'manager divisi', 'head divisi'];
                    const isValidRoles = roles.every(r => allowedRoles.includes(r));
                    if (!isValidRoles) {
                        return NextResponse.json({ message: `Forbidden: Division admins can only assign: ${allowedRoles.join(', ')}` }, { status: 403 });
                    }
                    await pool.query('UPDATE users SET roles = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [roles, userId]);
                    return NextResponse.json({ message: 'User roles updated successfully by division admin.' }, { status: 200 });
                }

                if (isDivisionManager(auth)) {
                    if (auth.divisionId !== targetUser.division_id) {
                        return NextResponse.json({ message: 'Forbidden: Division managers can only manage users in their own division.' }, { status: 403 });
                    }
                    if (roles.length === 1 && roles[0] === 'implementor') {
                        await pool.query('UPDATE users SET roles = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [roles, userId]);
                        return NextResponse.json({ message: 'Implementor role assigned successfully.' }, { status: 200 });
                    }
                    return NextResponse.json({ message: 'Forbidden: Division managers can only assign the "implementor" role.' }, { status: 403 });
                }

                return NextResponse.json({ message: 'Forbidden: You do not have permission to update roles.' }, { status: 403 });

            default:
                return NextResponse.json({ message: 'Invalid action specified.' }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Error updating user:', error);
        return NextResponse.json({ message: error.message || 'An internal server error occurred' }, { status: 500 });
    }
}

// POST - Create a new user (Superadmin only)
export async function POST(request: NextRequest) {
    try {
        const auth = await verifyAuth(request);
        if (!isSuperadmin(auth)) {
            return NextResponse.json({ message: 'Forbidden: Only superadmins can create users.' }, { status: 403 });
        }

        const body = await request.json();
        const { full_name, email, student_id, campus, division_id, password, role, roles } = body;

        if (!full_name || !email || !password) {
            return NextResponse.json({ message: 'Full name, email, and password are required' }, { status: 400 });
        }

        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rowCount !== null && existingUser.rowCount !== undefined && existingUser.rowCount > 0) {
            return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await pool.query(
            'INSERT INTO users (full_name, email, student_id, campus, division_id, password_hash, role, roles, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
            [full_name, email, student_id || null, campus || null, division_id || null, hashedPassword, role || 'user', roles || '{}', 'approved']
        );

        return NextResponse.json({ message: 'User created successfully', userId: result.rows[0].id }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating user:', error);
        return NextResponse.json({ message: error.message || 'An internal server error occurred' }, { status: 500 });
    }
}

// DELETE a user (Superadmin only)
export async function DELETE(request: NextRequest) {
    try {
        const auth = await verifyAuth(request);
        if (!isSuperadmin(auth)) {
            return NextResponse.json({ message: 'Forbidden: Only superadmins can delete users.' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }

        // Fetch user details to check for deletion restrictions
        const userToDeleteResult = await pool.query('SELECT email, role FROM users WHERE id = $1', [userId]);
        if (userToDeleteResult.rowCount === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        const userToDelete = userToDeleteResult.rows[0];

        // Prevent deletion of specific users
        if (userToDelete.email === 'purwadi@tabeldata.com') {
            return NextResponse.json({ message: 'Forbidden: Cannot delete the primary admin user.' }, { status: 403 });
        }
        if (userToDelete.role === 'superadmin') {
            return NextResponse.json({ message: 'Forbidden: Cannot delete a superadmin user.' }, { status: 403 });
        }

        // Delete user
        const result = await pool.query('DELETE FROM users WHERE id = $1', [userId]);

        if (result.rowCount === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });

    } catch (error: any) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ message: error.message || 'An internal server error occurred' }, { status: 500 });
    }
}