import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthServer } from "@/lib/auth";
import { 
  serviceCatalogService,
  serviceCatalogActivityService
} from '@/services/enhancedItsmService';

// Validation functions
const validateServiceInput = (data: any) => {
  const errors: string[] = [];
  
  if (data.name !== undefined && (typeof data.name !== 'string' || data.name.trim().length === 0)) {
    errors.push('Service name must be a non-empty string');
  }
  
  if (data.division !== undefined && (typeof data.division !== 'string' || data.division.trim().length === 0)) {
    errors.push('Division must be a non-empty string');
  }
  
  if (data.category_id !== undefined && (typeof data.category_id !== 'number' || data.category_id <= 0)) {
    errors.push('Category ID must be a positive number');
  }
  
  if (data.cost_type !== undefined && !['fixed', 'hourly', 'per_unit'].includes(data.cost_type)) {
    errors.push('Cost type must be one of: fixed, hourly, per_unit');
  }
  
  // Validasi cost_amount berdasarkan cost_type
  if (data.cost_amount !== undefined) {
    if (typeof data.cost_amount !== 'number' || data.cost_amount < 0) {
      errors.push('Cost amount must be a non-negative number');
    }
    
    // Untuk cost_type hourly, pastikan nilai masuk akal
    if (data.cost_type === 'hourly' && data.cost_amount > 9999.99) {
      errors.push('Hourly cost amount cannot exceed 9999.99');
    }
    
    // Untuk cost_type per_unit, pastikan nilai masuk akal
    if (data.cost_type === 'per_unit' && data.cost_amount > 999999.99) {
      errors.push('Per unit cost amount cannot exceed 999999.99');
    }
    
    // Untuk cost_type fixed, pastikan nilai masuk akal
    if (data.cost_type === 'fixed' && data.cost_amount > 9999999.99) {
      errors.push('Fixed cost amount cannot exceed 9999999.99');
    }
  }
  
  // Validasi bahwa cost_amount wajib diisi jika cost_type ada
  if (data.cost_type !== undefined && data.cost_type !== null && data.cost_type !== '' && 
      (data.cost_amount === undefined || data.cost_amount === null)) {
    errors.push('Cost amount is required when cost type is specified');
  }
  
  if (data.sla_days !== undefined && (typeof data.sla_days !== 'number' || data.sla_days < 0)) {
    errors.push('SLA days must be a non-negative number');
  }
  
  // Validasi tags jika ada
  if (data.tags !== undefined) {
    if (typeof data.tags === 'string') {
      try {
        const parsedTags = JSON.parse(data.tags);
        if (!Array.isArray(parsedTags)) {
          errors.push('Tags must be an array or a valid JSON array string');
        } else if (parsedTags.length > 10) {
          errors.push('Maximum 10 tags allowed');
        }
      } catch (e) {
        // Jika tidak bisa diparse sebagai JSON, asumsi itu adalah string biasa
        const tagsArray = data.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
        if (tagsArray.length > 10) {
          errors.push('Maximum 10 tags allowed');
        }
        for (const tag of tagsArray) {
          if (tag.length > 50) {
            errors.push('Each tag must be no more than 50 characters');
          }
        }
      }
    } else if (Array.isArray(data.tags)) {
      if (data.tags.length > 10) {
        errors.push('Maximum 10 tags allowed');
      }
      for (const tag of data.tags) {
        if (typeof tag !== 'string' || tag.trim().length === 0) {
          errors.push('All tags must be non-empty strings');
          break;
        }
        if (tag.length > 50) {
          errors.push('Each tag must be no more than 50 characters');
        }
      }
    } else if (data.tags !== null) {
      errors.push('Tags must be an array, string, or null');
    }
  }
  
  return errors;
};

// GET /api/itsm/service-catalog/[id] - Get service by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuthServer();
    
    const serviceId = parseInt(params.id);
    if (isNaN(serviceId) || serviceId <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid service ID' 
        },
        { status: 400 }
      );
    }
    
    const service = await serviceCatalogService.getServiceById(serviceId);
    
    if (!service) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Service not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: service 
    });
  } catch (error: any) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch service' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/itsm/service-catalog/[id] - Update service
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuthServer();
    
    const serviceId = parseInt(params.id);
    if (isNaN(serviceId) || serviceId <= 0) {
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
    
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON in request body' 
        },
        { status: 400 }
      );
    }
    
    // Validate input
    const validationErrors = validateServiceInput(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationErrors
        },
        { status: 400 }
      );
    }
    
    const service = await serviceCatalogService.updateService(serviceId, body);
    
    // Log activity
    await serviceCatalogActivityService.createActivity({
      service_id: service.id,
      user_id: parseInt(auth.userId),
      action: 'updated',
      description: `Updated service: ${service.name}`
    });
    
    return NextResponse.json({ 
      success: true, 
      data: service 
    });
  } catch (error: any) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update service' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/itsm/service-catalog/[id] - Delete service
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuthServer();
    
    const serviceId = parseInt(params.id);
    if (isNaN(serviceId) || serviceId <= 0) {
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
    
    await serviceCatalogService.deleteService(serviceId);
    
    // Log activity
    await serviceCatalogActivityService.createActivity({
      service_id: serviceId,
      user_id: parseInt(auth.userId),
      action: 'deleted',
      description: `Deleted service ID: ${serviceId}`
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Service deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete service' 
      },
      { status: 500 }
    );
  }
}