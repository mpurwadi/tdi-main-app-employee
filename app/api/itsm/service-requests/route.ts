import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { 
  serviceRequestService,
  serviceRequestActivityService
} from '@/services/enhancedItsmService';

// GET /api/itsm/service-requests - Get all service requests
export async function GET(request: NextRequest) {
  try {
    const auth = verifyAuth();
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const requesterId = searchParams.get('requesterId');
    const providerId = searchParams.get('providerId');
    
    let requests;
    if (status) {
      requests = await serviceRequestService.getServiceRequestsByStatus(status);
    } else if (requesterId) {
      requests = await serviceRequestService.getServiceRequestsByRequester(parseInt(requesterId));
    } else if (providerId) {
      requests = await serviceRequestService.getServiceRequestsByProvider(parseInt(providerId));
    } else {
      requests = await serviceRequestService.getAllServiceRequests();
    }
    
    return NextResponse.json({ 
      success: true, 
      data: requests 
    });
  } catch (error: any) {
    console.error('Error fetching service requests:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch service requests' 
      },
      { status: 500 }
    );
  }
}

// POST /api/itsm/service-requests - Create a new service request
export async function POST(request: NextRequest) {
  try {
    const auth = verifyAuth();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.service_id || !body.title) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Service ID and title are required' 
        },
        { status: 400 }
      );
    }
    
    const serviceRequest = await serviceRequestService.createServiceRequest({
      ...body,
      requester_id: parseInt(auth.userId),
      requested_for: body.requested_for || parseInt(auth.userId),
      status: 'submitted', // Default status
      approver_id: null,
      provider_id: null,
      cost: body.cost || 0,
      metadata: body.metadata || {}
    });
    
    // Log activity
    await serviceRequestActivityService.createActivity({
      service_request_id: serviceRequest.id,
      user_id: parseInt(auth.userId),
      action: 'created',
      description: `Created service request: ${serviceRequest.title}`
    });
    
    return NextResponse.json({ 
      success: true, 
      data: serviceRequest 
    });
  } catch (error: any) {
    console.error('Error creating service request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create service request' 
      },
      { status: 500 }
    );
  }
}