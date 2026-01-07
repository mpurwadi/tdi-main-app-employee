import { NextRequest, NextResponse } from 'next/server';
import { isAdmin, verifyAuthServer } from "@/lib/auth";
import { userManagementService } from '@/services/enhancedItsmService';

// GET /api/itsm/users - Get users with specific roles or divisions
export async function GET(request: NextRequest) {
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
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const division = searchParams.get('division');
    
    let users;
    if (role) {
      users = await userManagementService.getUsersByRole(role);
    } else if (division) {
      users = await userManagementService.getUsersByDivision(division);
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Role or division parameter is required' 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: users 
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch users' 
      },
      { status: 500 }
    );
  }
}