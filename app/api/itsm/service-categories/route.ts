import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, isAdmin } from '@/lib/auth';
import { serviceCategoryService } from '@/services/enhancedItsmService';

// GET /api/itsm/service-categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const auth = verifyAuth();
    
    const categories = await serviceCategoryService.getAllCategories();
    
    return NextResponse.json({ 
      success: true, 
      data: categories 
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch categories' 
      },
      { status: 500 }
    );
  }
}

// POST /api/itsm/service-categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const auth = verifyAuth();
    
    // Check if user has appropriate role (admin or service catalog manager)
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
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Category name is required' 
        },
        { status: 400 }
      );
    }
    
    const category = await serviceCategoryService.createCategory(body);
    
    return NextResponse.json({ 
      success: true, 
      data: category 
    });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create category' 
      },
      { status: 500 }
    );
  }
}