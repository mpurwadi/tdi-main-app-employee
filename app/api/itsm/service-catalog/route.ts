import { NextRequest, NextResponse } from 'next/server';
import { withSecurity } from '@/lib/security';
import { 
  serviceCatalogService, 
  serviceCategoryService,
  serviceCatalogActivityService
} from '@/services/enhancedItsmService';

// Validation functions
const validateServiceInput = (data: any) => {
  const errors: string[] = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Service name is required and must be a non-empty string');
  }
  
  if (!data.division || typeof data.division !== 'string' || data.division.trim().length === 0) {
    errors.push('Division is required and must be a non-empty string');
  }
  
  if (!data.category_id || typeof data.category_id !== 'number' || data.category_id <= 0) {
    errors.push('Valid category ID is required');
  }
  
  if (data.cost_type && !['fixed', 'hourly', 'per_unit'].includes(data.cost_type)) {
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
  if (data.cost_type && (data.cost_amount === undefined || data.cost_amount === null)) {
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

const validateCategoryInput = (data: any) => {
  const errors: string[] = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Category name is required and must be a non-empty string');
  }
  
  return errors;
};

// Handler functions
const getHandler = async (request: NextRequest) => {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const division = searchParams.get('division');
    const categoryId = searchParams.get('categoryId');
    
    let services;
    if (status) {
      // Validate status parameter
      const validStatuses = ['pending', 'approved', 'rejected', 'active', 'inactive'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid status parameter' 
          },
          { status: 400 }
        );
      }
      services = await serviceCatalogService.getServicesByStatus(status);
    } else if (division) {
      if (typeof division !== 'string' || division.trim().length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid division parameter' 
          },
          { status: 400 }
        );
      }
      services = await serviceCatalogService.getServicesByDivision(division);
    } else if (categoryId) {
      const categoryIdNum = parseInt(categoryId);
      if (isNaN(categoryIdNum) || categoryIdNum <= 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid category ID parameter' 
          },
          { status: 400 }
        );
      }
      services = await serviceCatalogService.getServicesByCategory(categoryIdNum);
    } else {
      services = await serviceCatalogService.getAllServices();
    }
    
    return NextResponse.json({ 
      success: true, 
      data: services 
    });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch services' 
      },
      { status: 500 }
    );
  }
};

const postHandler = async (request: NextRequest) => {
  try {
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
    
    // Get user from request (injected by withSecurity)
    const authHeader = request.headers.get('x-user-auth');
    const auth = authHeader ? JSON.parse(authHeader) : null;
    
    const service = await serviceCatalogService.createService({
      ...body,
      created_by: parseInt(auth.userId),
      status: 'pending', // Default status
      approved_by: null,
      metadata: body.metadata || {}
    });
    
    // Log activity
    await serviceCatalogActivityService.createActivity({
      service_id: service.id,
      user_id: parseInt(auth.userId),
      action: 'created',
      description: `Created service: ${service.name}`
    });
    
    return NextResponse.json({ 
      success: true, 
      data: service 
    });
  } catch (error: any) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create service' 
      },
      { status: 500 }
    );
  }
};

// GET /api/itsm/service-catalog - Get all services
export async function GET(request: NextRequest) {
  return withSecurity(getHandler, request);
}

// POST /api/itsm/service-catalog - Create a new service
export async function POST(request: NextRequest) {
  return withSecurity(postHandler, request);
}