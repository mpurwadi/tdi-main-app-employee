import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { 
  changeRequestService,
  changeRequestActivityService
} from '@/services/enhancedItsmService';

// POST /api/itsm/change-requests/[id]/complete - Complete a change request
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = verifyAuth();
    
    const requestId = parseInt(params.id);
    if (isNaN(requestId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid change request ID' 
        },
        { status: 400 }
      );
    }
    
    // Check if user has appropriate role
    const allowedRoles = ['implementer', 'admin', 'superadmin'];
    const userRoles = [auth.role, ...(auth.roles || [])];
    const hasPermission = allowedRoles.some(role => userRoles.includes(role));
    
    if (!hasPermission) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized: Insufficient permissions' 
        },
        { status: 403 }
      );
    }
    
    const changeRequest = await changeRequestService.completeChangeRequest(requestId);
    
    // Log activity
    await changeRequestActivityService.createActivity({
      change_request_id: changeRequest.id,
      user_id: parseInt(auth.userId),
      action: 'completed',
      description: `Completed change request: ${changeRequest.title}`
    });
    
    return NextResponse.json({ 
      success: true, 
      data: changeRequest,
      message: 'Change request completed successfully'
    });
  } catch (error: any) {
    console.error('Error completing change request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to complete change request' 
      },
      { status: 500 }
    );
  }
}