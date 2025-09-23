import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { 
  serviceRequestService,
  serviceRequestActivityService
} from '@/services/enhancedItsmService';

// GET /api/itsm/service-requests/[id] - Get service request by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = verifyAuth();
    
    const requestId = parseInt(params.id);
    if (isNaN(requestId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid service request ID' 
        },
        { status: 400 }
      );
    }
    
    const serviceRequest = await serviceRequestService.getServiceRequestById(requestId);
    
    if (!serviceRequest) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Service request not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: serviceRequest 
    });
  } catch (error: any) {
    console.error('Error fetching service request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch service request' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/itsm/service-requests/[id] - Update service request
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = verifyAuth();
    
    const requestId = parseInt(params.id);
    if (isNaN(requestId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid service request ID' 
        },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Check permissions - only requester, provider, or admins can update
    const serviceRequest = await serviceRequestService.getServiceRequestById(requestId);
    if (!serviceRequest) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Service request not found' 
        },
        { status: 404 }
      );
    }
    
    const allowedRoles = ['admin', 'superadmin'];
    const userRoles = [auth.role, ...(auth.roles || [])];
    const isOwner = serviceRequest.requester_id === parseInt(auth.userId);
    const isProvider = serviceRequest.provider_id === parseInt(auth.userId);
    const hasPermission = allowedRoles.some(role => userRoles.includes(role)) || isOwner || isProvider;
    
    if (!hasPermission) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized: Insufficient permissions' 
        },
        { status: 403 }
      );
    }
    
    const updatedRequest = await serviceRequestService.updateServiceRequest(requestId, body);
    
    // Log activity
    await serviceRequestActivityService.createActivity({
      service_request_id: requestId,
      user_id: parseInt(auth.userId),
      action: 'updated',
      description: `Updated service request: ${updatedRequest.title}`
    });
    
    return NextResponse.json({ 
      success: true, 
      data: updatedRequest 
    });
  } catch (error: any) {
    console.error('Error updating service request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update service request' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/itsm/service-requests/[id] - Delete service request
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = verifyAuth();
    
    const requestId = parseInt(params.id);
    if (isNaN(requestId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid service request ID' 
        },
        { status: 400 }
      );
    }
    
    // Check permissions - only requester or admins can delete
    const serviceRequest = await serviceRequestService.getServiceRequestById(requestId);
    if (!serviceRequest) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Service request not found' 
        },
        { status: 404 }
      );
    }
    
    const allowedRoles = ['admin', 'superadmin'];
    const userRoles = [auth.role, ...(auth.roles || [])];
    const isOwner = serviceRequest.requester_id === parseInt(auth.userId);
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
    
    await serviceRequestService.deleteServiceRequest(requestId);
    
    // Log activity
    await serviceRequestActivityService.createActivity({
      service_request_id: requestId,
      user_id: parseInt(auth.userId),
      action: 'deleted',
      description: `Deleted service request ID: ${requestId}`
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Service request deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting service request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete service request' 
      },
      { status: 500 }
    );
  }
}