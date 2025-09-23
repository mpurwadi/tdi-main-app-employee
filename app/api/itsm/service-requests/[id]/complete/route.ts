import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { 
  serviceRequestService,
  serviceRequestActivityService,
  billingService
} from '@/services/enhancedItsmService';

// POST /api/itsm/service-requests/[id]/complete - Complete a service request
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    // Check if user has appropriate role
    const allowedRoles = ['service_provider', 'admin', 'superadmin'];
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
    
    const serviceRequest = await serviceRequestService.completeServiceRequest(requestId);
    
    // Create billing record if cost > 0
    if (serviceRequest.cost && serviceRequest.cost > 0) {
      // Get service details to get division information
      // In a real implementation, you would fetch the service details here
      // For now, we'll use mock data
      
      // Create billing record
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // 30 days from now
      
      await billingService.createBillingRecord({
        service_request_id: requestId,
        requester_division: 'DevOps', // This should come from the requester's division
        provider_division: 'IT', // This should come from the provider's division
        amount: serviceRequest.cost,
        billing_period: new Date(),
        due_date: dueDate,
        status: 'pending',
        payment_confirmed_by: null,
        payment_proof_url: null,
        notes: `Billing for service request: ${serviceRequest.title}`,
        metadata: {}
      });
    }
    
    // Log activity
    await serviceRequestActivityService.createActivity({
      service_request_id: serviceRequest.id,
      user_id: parseInt(auth.userId),
      action: 'completed',
      description: `Completed service request: ${serviceRequest.title}`
    });
    
    return NextResponse.json({ 
      success: true, 
      data: serviceRequest,
      message: 'Service request completed successfully'
    });
  } catch (error: any) {
    console.error('Error completing service request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to complete service request' 
      },
      { status: 500 }
    );
  }
}