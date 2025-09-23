import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { 
  changeRequestService,
  changeRequestActivityService
} from '@/services/enhancedItsmService';

// GET /api/itsm/change-requests/[id] - Get change request by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    const changeRequest = await changeRequestService.getChangeRequestById(requestId);
    
    if (!changeRequest) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Change request not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: changeRequest 
    });
  } catch (error: any) {
    console.error('Error fetching change request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch change request' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/itsm/change-requests/[id] - Update change request
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    const body = await request.json();
    
    // Check permissions - only requester, change manager, implementer, or admins can update
    const changeRequest = await changeRequestService.getChangeRequestById(requestId);
    if (!changeRequest) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Change request not found' 
        },
        { status: 404 }
      );
    }
    
    const allowedRoles = ['admin', 'superadmin'];
    const userRoles = [auth.role, ...(auth.roles || [])];
    const isOwner = changeRequest.requester_id === parseInt(auth.userId);
    const isChangeManager = changeRequest.change_manager_id === parseInt(auth.userId);
    const isImplementer = changeRequest.implementer_id === parseInt(auth.userId);
    const hasPermission = allowedRoles.some(role => userRoles.includes(role)) || isOwner || isChangeManager || isImplementer;
    
    if (!hasPermission) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized: Insufficient permissions' 
        },
        { status: 403 }
      );
    }
    
    const updatedRequest = await changeRequestService.updateChangeRequest(requestId, body);
    
    // Log activity
    await changeRequestActivityService.createActivity({
      change_request_id: requestId,
      user_id: parseInt(auth.userId),
      action: 'updated',
      description: `Updated change request: ${updatedRequest.title}`
    });
    
    return NextResponse.json({ 
      success: true, 
      data: updatedRequest 
    });
  } catch (error: any) {
    console.error('Error updating change request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update change request' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/itsm/change-requests/[id] - Delete change request
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    // Check permissions - only requester or admins can delete
    const changeRequest = await changeRequestService.getChangeRequestById(requestId);
    if (!changeRequest) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Change request not found' 
        },
        { status: 404 }
      );
    }
    
    const allowedRoles = ['admin', 'superadmin'];
    const userRoles = [auth.role, ...(auth.roles || [])];
    const isOwner = changeRequest.requester_id === parseInt(auth.userId);
    const hasPermission = allowedRoles.some(role => userRoles.includes(role)) || isOwner;
    
    if (!hasPermission) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized: Insufficient permissions' 
        },
        { status: 403 }
      );
    }
    
    await changeRequestService.deleteChangeRequest(requestId);
    
    // Log activity
    await changeRequestActivityService.createActivity({
      change_request_id: requestId,
      user_id: parseInt(auth.userId),
      action: 'deleted',
      description: `Deleted change request ID: ${requestId}`
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Change request deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting change request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete change request' 
      },
      { status: 500 }
    );
  }
}