import { NextRequest, NextResponse } from 'next/server';
import { isAdmin, verifyAuthServer } from "@/lib/auth";
import { userManagementService } from '@/services/enhancedItsmService';
import { db } from '@/lib/db';

// GET /api/itsm/users/[id] - Get user by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuthServer();
    
    // Only admins can access this endpoint
    if (!isAdmin(auth) && auth.role !== 'superadmin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized: Insufficient permissions' 
        },
        { status: 403 }
      );
    }
    
    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid user ID' 
        },
        { status: 400 }
      );
    }
    
    const result = await db.query(
      `SELECT id, full_name, email, division, role, roles,
              is_service_catalog_manager, is_service_provider, is_service_requester,
              is_approver, is_billing_coordinator, is_change_requester,
              is_change_manager, is_cab_member, is_implementer
       FROM users 
       WHERE id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows[0] 
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch user' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/itsm/users/[id] - Update user roles and permissions
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuthServer();
    
    // Only admins can access this endpoint
    if (!isAdmin(auth) && auth.role !== 'superadmin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized: Insufficient permissions' 
        },
        { status: 403 }
      );
    }
    
    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid user ID' 
        },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Validate roles array
    if (!Array.isArray(body.roles)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Roles must be an array' 
        },
        { status: 400 }
      );
    }
    
    // Validate role flags
    const validRoleFlags = [
      'is_service_catalog_manager', 'is_service_provider', 'is_service_requester',
      'is_approver', 'is_billing_coordinator', 'is_change_requester',
      'is_change_manager', 'is_cab_member', 'is_implementer'
    ];
    
    for (const flag of Object.keys(body.roleFlags || {})) {
      if (!validRoleFlags.includes(flag)) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Invalid role flag: ${flag}` 
          },
          { status: 400 }
        );
      }
    }
    
    const user = await userManagementService.updateUserRoles(
      userId, 
      body.roles, 
      body.roleFlags || {}
    );
    
    return NextResponse.json({ 
      success: true, 
      data: user 
    });
  } catch (error: any) {
    console.error('Error updating user roles:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update user roles' 
      },
      { status: 500 }
    );
  }
}