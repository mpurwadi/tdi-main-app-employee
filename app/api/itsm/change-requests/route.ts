import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { 
  changeRequestService,
  changeRequestActivityService
} from '@/services/enhancedItsmService';

// GET /api/itsm/change-requests - Get all change requests
export async function GET(request: NextRequest) {
  try {
    const auth = verifyAuth();
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const requesterId = searchParams.get('requesterId');
    const changeManagerId = searchParams.get('changeManagerId');
    const implementerId = searchParams.get('implementerId');
    
    let requests;
    if (status) {
      requests = await changeRequestService.getChangeRequestsByStatus(status);
    } else if (requesterId) {
      requests = await changeRequestService.getChangeRequestsByRequester(parseInt(requesterId));
    } else if (changeManagerId) {
      requests = await changeRequestService.getChangeRequestsByChangeManager(parseInt(changeManagerId));
    } else if (implementerId) {
      requests = await changeRequestService.getChangeRequestsByImplementer(parseInt(implementerId));
    } else {
      requests = await changeRequestService.getAllChangeRequests();
    }
    
    return NextResponse.json({ 
      success: true, 
      data: requests 
    });
  } catch (error: any) {
    console.error('Error fetching change requests:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch change requests' 
      },
      { status: 500 }
    );
  }
}

// POST /api/itsm/change-requests - Create a new change request
export async function POST(request: NextRequest) {
  try {
    const auth = verifyAuth();
    
    // Check if user has appropriate role
    const allowedRoles = ['change_requester', 'admin', 'superadmin'];
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
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.description) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Title and description are required' 
        },
        { status: 400 }
      );
    }
    
    const changeRequest = await changeRequestService.createChangeRequest({
      ...body,
      requester_id: parseInt(auth.userId),
      status: 'submitted', // Default status
      change_manager_id: null,
      implementer_id: null,
      priority: body.priority || 'medium',
      risk_level: body.risk_level || 'medium',
      metadata: body.metadata || {}
    });
    
    // Log activity
    await changeRequestActivityService.createActivity({
      change_request_id: changeRequest.id,
      user_id: parseInt(auth.userId),
      action: 'created',
      description: `Created change request: ${changeRequest.title}`
    });
    
    return NextResponse.json({ 
      success: true, 
      data: changeRequest 
    });
  } catch (error: any) {
    console.error('Error creating change request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create change request' 
      },
      { status: 500 }
    );
  }
}