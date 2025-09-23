import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { 
  billingService
} from '@/services/enhancedItsmService';

// POST /api/itsm/billing/[id]/confirm-payment - Confirm payment for a billing record
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth();
    
    const billingId = parseInt(params.id);
    if (isNaN(billingId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid billing record ID' 
        },
        { status: 400 }
      );
    }
    
    // Check if user has appropriate role
    const allowedRoles = ['billing_coordinator', 'admin', 'superadmin'];
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
    
    const record = await billingService.confirmPayment(billingId, parseInt(auth.userId));
    
    return NextResponse.json({ 
      success: true, 
      data: record,
      message: 'Payment confirmed successfully'
    });
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to confirm payment' 
      },
      { status: 500 }
    );
  }
}