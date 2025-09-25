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

        const { userId, role, division } = await req.json();



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
        const validRoles = [
            'user', 'admin', 'superadmin',
            'itsm_division_admin', 'itsm_manager',
            'service_catalog_manager', 'service_provider', 'service_requester',
            'approver', 'billing_coordinator', 'billing_admin',
            'change_requester', 'change_manager', 'cab_member', 'implementer'
        ];
        if (!validRoles.includes(role)) {
            return NextResponse.json({ 
                success: false,
                message: `Invalid role. Valid roles are: ${validRoles.join(', ')}` 
            }, { status: 400 });
        }

        // Determine boolean role flags based on the assigned role
        const roleFlags: Record<string, boolean> = {
            is_service_catalog_manager: false,
            is_service_provider: false,
            is_service_requester: false,
            is_approver: false,
            is_billing_coordinator: false,
            is_billing_admin: false,
            is_change_requester: false,
            is_change_manager: false,
            is_cab_member: false,
            is_implementer: false,
        };

        switch (role) {
            case 'service_catalog_manager':
                roleFlags.is_service_catalog_manager = true;
                break;
            case 'service_provider':
                roleFlags.is_service_provider = true;
                break;
            case 'service_requester':
                roleFlags.is_service_requester = true;
                break;
            case 'approver':
                roleFlags.is_approver = true;
                break;
            case 'billing_coordinator':
                roleFlags.is_billing_coordinator = true;
                break;
            case 'billing_admin':
                roleFlags.is_billing_admin = true;
                break;
            case 'change_requester':
                roleFlags.is_change_requester = true;
                break;
            case 'change_manager':
                roleFlags.is_change_manager = true;
                break;
            case 'cab_member':
                roleFlags.is_cab_member = true;
                break;
            case 'implementer':
                roleFlags.is_implementer = true;
                break;
            // For admin and superadmin, all ITSM flags might be true, or handled separately
            case 'admin':
            case 'superadmin':
                // Decide if admin/superadmin automatically get all ITSM roles
                // For now, let's assume they don't automatically get all specific ITSM flags
                // unless explicitly assigned. The main 'role' field will grant broad access.
                break;
            case 'itsm_division_admin':
            case 'itsm_manager':
                // These roles will require division to be set
                break;
            default:
                // 'user' role or any other default
                break;
        }

        const updateFields = ['role = $1', 'updated_at = CURRENT_TIMESTAMP'];
        const updateValues = [role];
        let paramIndex = 2;

        // Conditionally add division update
        if (division) {
            updateFields.push(`division = ${paramIndex}`);
            updateValues.push(division);
            paramIndex++;
        } else {
            // If no division is provided, set it to NULL for non-division-specific roles
            // This prevents a user from retaining a division if their role changes
            if (!['itsm_division_admin', 'itsm_manager'].includes(role)) {
                updateFields.push(`division = NULL`);
            }
        }

        // Add boolean role flags to update fields
        for (const flag in roleFlags) {
            updateFields.push(`${flag} = ${paramIndex}`);
            updateValues.push(roleFlags[flag]);
            paramIndex++;
        }

        updateValues.push(userId); // userId is the last parameter for WHERE clause

        await db.query(
            `UPDATE users SET ${updateFields.join(', ')} WHERE id = ${paramIndex}`,
            updateValues
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