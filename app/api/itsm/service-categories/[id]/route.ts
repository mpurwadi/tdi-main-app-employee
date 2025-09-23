import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { serviceCategoryService } from '@/services/enhancedItsmService';

// GET /api/itsm/service-categories/[id] - Get category by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = verifyAuth();
    
    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid category ID' 
        },
        { status: 400 }
      );
    }
    
    const category = await serviceCategoryService.getCategoryById(categoryId);
    
    if (!category) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Category not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: category 
    });
  } catch (error: any) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch category' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/itsm/service-categories/[id] - Update category
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = verifyAuth();
    
    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid category ID' 
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
    
    const body = await request.json();
    
    const category = await serviceCategoryService.updateCategory(categoryId, body);
    
    return NextResponse.json({ 
      success: true, 
      data: category 
    });
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update category' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/itsm/service-categories/[id] - Delete category
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = verifyAuth();
    
    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid category ID' 
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
    
    await serviceCategoryService.deleteCategory(categoryId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Category deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete category' 
      },
      { status: 500 }
    );
  }
}