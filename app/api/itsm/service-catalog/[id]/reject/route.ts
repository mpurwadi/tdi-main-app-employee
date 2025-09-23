import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { 
  serviceCatalogService,
  serviceCatalogActivityService
} from '@/services/enhancedItsmService';

// POST /api/itsm/service-catalog/[id]/reject - Reject a service
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = verifyAuth();
    
    const serviceId = parseInt(params.id);
    if (isNaN(serviceId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid service ID' 
        },
        { status: 400 }
      );
    }
    
    // Check if user has appropriate role
    const allowedRoles = ['service_catalog_manager', 'admin', 'superadmin'];
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
    
    const service = await serviceCatalogService.rejectService(serviceId, parseInt(auth.userId));
    
    // Log activity
    await serviceCatalogActivityService.createActivity({
      service_id: service.id,
      user_id: parseInt(auth.userId),
      action: 'rejected',
      description: `Rejected service: ${service.name}`
    });
    
    return NextResponse.json({ 
      success: true, 
      data: service,
      message: 'Service rejected successfully'
    });
  } catch (error: any) {
    console.error('Error rejecting service:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to reject service' 
      },
      { status: 500 }
    );
  }
}