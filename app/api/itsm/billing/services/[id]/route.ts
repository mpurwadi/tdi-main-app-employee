// app/api/itsm/billing/services/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, hasRole } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/itsm/billing/services/[id] - Get a specific service catalog item
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth();
    
    // Check if user has appropriate role for billing
    const hasBillingAccess = hasRole(auth, 'billing_coordinator') || 
                             hasRole(auth, 'billing_admin') || 
                             hasRole(auth, 'service_catalog_manager') ||
                             auth.role === 'admin' || 
                             auth.role === 'superadmin';
    
    if (!hasBillingAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const serviceId = params.id;
    
    const query = `
      SELECT 
        id, name, description, category, unit_price, unit_type, created_at, updated_at
      FROM service_catalog
      WHERE id = $1
    `;
    
    const result = await db.query(query, [serviceId]);
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Service catalog item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error: any) {
    console.error('Service Catalog API Error (GET single):', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/itsm/billing/services/[id] - Update a service catalog item
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth();
    
    // Only service catalog managers, admins, and superadmins can update services
    const hasUpdateAccess = hasRole(auth, 'service_catalog_manager') || 
                            auth.role === 'admin' || 
                            auth.role === 'superadmin';
    
    if (!hasUpdateAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const serviceId = params.id;
    const body = await req.json();
    const {
      name,
      description,
      category,
      unitPrice,
      unitType
    } = body;

    // Build update query
    let updateQuery = 'UPDATE service_catalog SET updated_at = CURRENT_TIMESTAMP';
    const updateParams: any[] = [];
    let paramIndex = 1;
    
    if (name) {
      updateQuery += `, name = $${paramIndex}`;
      updateParams.push(name);
      paramIndex++;
    }
    
    if (description !== undefined) {
      updateQuery += `, description = $${paramIndex}`;
      updateParams.push(description);
      paramIndex++;
    }
    
    if (category) {
      updateQuery += `, category = $${paramIndex}`;
      updateParams.push(category);
      paramIndex++;
    }
    
    if (unitPrice) {
      updateQuery += `, unit_price = $${paramIndex}`;
      updateParams.push(unitPrice);
      paramIndex++;
    }
    
    if (unitType) {
      updateQuery += `, unit_type = $${paramIndex}`;
      updateParams.push(unitType);
      paramIndex++;
    }
    
    updateQuery += ` WHERE id = $${paramIndex} RETURNING *`;
    updateParams.push(serviceId);

    const result = await db.query(updateQuery, updateParams);
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Service catalog item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Service catalog item updated successfully'
    });

  } catch (error: any) {
    console.error('Service Catalog API Error (PUT):', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/itsm/billing/services/[id] - Delete a service catalog item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth();
    
    // Only service catalog managers, admins, and superadmins can delete services
    const hasDeleteAccess = hasRole(auth, 'service_catalog_manager') || 
                            auth.role === 'admin' || 
                            auth.role === 'superadmin';
    
    if (!hasDeleteAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const serviceId = params.id;
    
    // Check if this service is used in any billing records
    const billingCheckQuery = 'SELECT COUNT(*) as count FROM billing_records WHERE service_catalog_id = $1';
    const billingCheckResult = await db.query(billingCheckQuery, [serviceId]);
    
    if (parseInt(billingCheckResult.rows[0].count) > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete service catalog item that is used in billing records' },
        { status: 400 }
      );
    }
    
    // Delete the service catalog item
    const deleteQuery = 'DELETE FROM service_catalog WHERE id = $1 RETURNING id';
    const result = await db.query(deleteQuery, [serviceId]);
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Service catalog item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Service catalog item deleted successfully'
    });

  } catch (error: any) {
    console.error('Service Catalog API Error (DELETE):', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}