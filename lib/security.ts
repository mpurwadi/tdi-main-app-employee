import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, hasAnyRole, isInDivision } from '@/lib/auth';

// Define role-based access control rules
const accessRules: Record<string, { 
  roles?: string[], 
  divisions?: string[],
  allowAdmin?: boolean 
}> = {
  // Service Catalog
  'GET /api/itsm/service-catalog': { allowAdmin: true },
  'POST /api/itsm/service-catalog': { roles: ['service_catalog_manager', 'service_provider'], allowAdmin: true },
  'GET /api/itsm/service-catalog/[id]': { allowAdmin: true },
  'PUT /api/itsm/service-catalog/[id]': { roles: ['service_catalog_manager'], allowAdmin: true },
  'DELETE /api/itsm/service-catalog/[id]': { roles: ['service_catalog_manager'], allowAdmin: true },
  'POST /api/itsm/service-catalog/[id]/approve': { roles: ['service_catalog_manager'], allowAdmin: true },
  'POST /api/itsm/service-catalog/[id]/reject': { roles: ['service_catalog_manager'], allowAdmin: true },
  
  // Service Categories
  'GET /api/itsm/service-categories': { allowAdmin: true },
  'POST /api/itsm/service-categories': { roles: ['service_catalog_manager'], allowAdmin: true },
  'GET /api/itsm/service-categories/[id]': { allowAdmin: true },
  'PUT /api/itsm/service-categories/[id]': { roles: ['service_catalog_manager'], allowAdmin: true },
  'DELETE /api/itsm/service-categories/[id]': { roles: ['service_catalog_manager'], allowAdmin: true },
  
  // Service Requests
  'GET /api/itsm/service-requests': { allowAdmin: true },
  'POST /api/itsm/service-requests': { roles: ['service_requester'], allowAdmin: true },
  'GET /api/itsm/service-requests/[id]': { allowAdmin: true },
  'PUT /api/itsm/service-requests/[id]': { allowAdmin: true },
  'DELETE /api/itsm/service-requests/[id]': { roles: ['service_requester'], allowAdmin: true },
  'POST /api/itsm/service-requests/[id]/approve': { roles: ['approver'], allowAdmin: true },
  'POST /api/itsm/service-requests/[id]/complete': { roles: ['service_provider'], allowAdmin: true },
  
  // Internal Billing
  'GET /api/itsm/billing': { roles: ['billing_coordinator'], allowAdmin: true },
  'POST /api/itsm/billing': { roles: ['billing_coordinator'], allowAdmin: true },
  'GET /api/itsm/billing/[id]': { roles: ['billing_coordinator'], allowAdmin: true },
  'PUT /api/itsm/billing/[id]': { roles: ['billing_coordinator'], allowAdmin: true },
  'DELETE /api/itsm/billing/[id]': { allowAdmin: true },
  'POST /api/itsm/billing/[id]/confirm-payment': { roles: ['billing_coordinator'], allowAdmin: true },
  
  // Change Management
  'GET /api/itsm/change-requests': { allowAdmin: true },
  'POST /api/itsm/change-requests': { roles: ['change_requester'], allowAdmin: true },
  'GET /api/itsm/change-requests/[id]': { allowAdmin: true },
  'PUT /api/itsm/change-requests/[id]': { allowAdmin: true },
  'DELETE /api/itsm/change-requests/[id]': { roles: ['change_requester'], allowAdmin: true },
  'POST /api/itsm/change-requests/[id]/approve': { roles: ['change_manager', 'cab_member'], allowAdmin: true },
  'POST /api/itsm/change-requests/[id]/complete': { roles: ['implementer'], allowAdmin: true },
  
  // User Management
  'GET /api/itsm/users': { allowAdmin: true },
  'GET /api/itsm/users/[id]': { allowAdmin: true },
  'PUT /api/itsm/users/[id]': { allowAdmin: true }
};

// Function to normalize request method and path
function normalizeRequest(method: string, pathname: string): string {
  // Remove query parameters and normalize dynamic segments
  const cleanPath = pathname.split('?')[0];
  const normalizedPath = cleanPath.replace(/\/\d+/g, '/[id]');
  return `${method} ${normalizedPath}`;
}

// Security middleware
export async function withSecurity(handler: (request: NextRequest, context?: any) => Promise<NextResponse>, request: NextRequest, context?: any) {
  try {
    // Verify authentication
    const auth = await verifyAuth();
    
    // Normalize request for access control
    const normalizedRequest = normalizeRequest(request.method, request.nextUrl.pathname);
    
    // Check access rules
    const rule = accessRules[normalizedRequest];
    
    if (!rule) {
      // If no specific rule, allow admins
      if (auth.role === 'admin' || auth.role === 'superadmin') {
        // Inject auth data into request
        const newRequest = new NextRequest(request, {
          headers: {
            ...Object.fromEntries(request.headers),
            'x-user-auth': JSON.stringify(auth)
          }
        });
        return handler(newRequest, context);
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Forbidden: Access denied' 
        },
        { status: 403 }
      );
    }
    
    // Check admin access
    if (rule.allowAdmin && (auth.role === 'admin' || auth.role === 'superadmin')) {
      // Inject auth data into request
      const newRequest = new NextRequest(request, {
        headers: {
          ...Object.fromEntries(request.headers),
          'x-user-auth': JSON.stringify(auth)
        }
      });
      return handler(newRequest, context);
    }
    
    // Check role-based access
    if (rule.roles && hasAnyRole(auth, rule.roles)) {
      // Inject auth data into request
      request.headers.set('x-user-auth', JSON.stringify(auth));
      return handler(request, context);
    }
    
    // Check division-based access (if needed in future)
    // This would require additional logic based on the resource being accessed
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Forbidden: Insufficient permissions' 
      },
      { status: 403 }
    );
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message 
        },
        { status: 401 }
      );
    }
    
    console.error('Security middleware error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}