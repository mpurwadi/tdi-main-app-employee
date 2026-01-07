import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthServer } from "@/lib/auth";
import { 
  serviceRequestService,
  serviceRequestActivityService
} from '@/services/enhancedItsmService';

// POST /api/itsm/service-requests/[id]/approve - Approve a service request
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
    
    // Check if user has appropriate role
    const allowedRoles = ['approver', 'admin', 'superadmin'];
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
    
    const serviceRequest = await serviceRequestService.approveServiceRequest(requestId, parseInt(auth.userId));
    
    // Log activity
    await serviceRequestActivityService.createActivity({
      service_request_id: serviceRequest.id,
      user_id: parseInt(auth.userId),
      action: 'approved',
      description: `Approved service request: ${serviceRequest.title}`
    });
    
    return NextResponse.json({ 
      success: true, 
      data: serviceRequest,
      message: 'Service request approved successfully'
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