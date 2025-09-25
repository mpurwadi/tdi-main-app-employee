import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthServer } from "@/lib/auth";
import { 
  serviceRequestService,
  serviceRequestActivityService
} from '@/services/enhancedItsmService';

// POST /api/itsm/service-requests/[id]/manager-approve - Approve a service request with cost and points
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuthServer();
    
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
    
    // Check if user has appropriate role (manager, division head, admin, superadmin)
    const allowedRoles = ['approver', 'admin', 'superadmin', 'itsm_manager', 'itsm_division_admin'];
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
    
    // Parse request body
    const body = await request.json();
    const { cost, points, comments } = body;
    
    // Validate required fields
    if (cost === undefined || points === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cost and points are required' 
        },
        { status: 400 }
      );
    }
    
    // Validate cost and points
    if (typeof cost !== 'number' || cost < 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cost must be a non-negative number' 
        },
        { status: 400 }
      );
    }
    
    if (typeof points !== 'number' || points < 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Points must be a non-negative number' 
        },
        { status: 400 }
      );
    }
    
    // First update the service request with cost and points
    const updatedRequest = await serviceRequestService.updateServiceRequest(requestId, {
      cost: cost,
      metadata: {
        ...((await serviceRequestService.getServiceRequestById(requestId))?.metadata || {}),
        points: points,
        manager_comments: comments
      }
    });
    
    // Then approve the service request
    const approvedRequest = await serviceRequestService.approveServiceRequest(requestId, parseInt(auth.userId));
    
    // Log activity
    await serviceRequestActivityService.createActivity({
      service_request_id: approvedRequest.id,
      user_id: parseInt(auth.userId),
      action: 'manager_approved',
      description: `Manager approved service request: ${approvedRequest.title} with cost: ${cost} and points: ${points}`
    });
    
    return NextResponse.json({ 
      success: true, 
      data: approvedRequest,
      message: 'Service request approved successfully with cost and points'
    });
  } catch (error: any) {
    console.error('Error approving service request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to approve service request' 
      },
      { status: 500 }
    );
  }
}