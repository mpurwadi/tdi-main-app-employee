// app/api/itsm/billing/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, hasRole } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/itsm/billing/[id] - Get a specific billing record
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth();
    
    // Check if user has appropriate role for billing
    const hasBillingAccess = hasRole(auth, 'billing_coordinator') || 
                             hasRole(auth, 'billing_admin') || 
                             auth.role === 'admin' || 
                             auth.role === 'superadmin';
    
    if (!hasBillingAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const billingId = params.id;
    
    // Get billing record with service details
    const query = `
      SELECT 
        br.id,
        br.invoice_number,
        br.requester_division,
        br.provider_division,
        sc.name as service_name,
        sc.description as service_description,
        br.quantity,
        br.unit_price,
        br.total_amount,
        br.billing_period_start,
        br.billing_period_end,
        br.due_date,
        br.status,
        br.description,
        br.created_at,
        br.updated_at
      FROM billing_records br
      LEFT JOIN service_catalog sc ON br.service_catalog_id = sc.id
      WHERE br.id = $1
    `;
    
    const result = await db.query(query, [billingId]);
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Billing record not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error: any) {
    console.error('Billing API Error (GET single):', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/itsm/billing/[id] - Update a billing record
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth();
    
    // Only billing coordinators, admins, and superadmins can update billing records
    const hasUpdateAccess = hasRole(auth, 'billing_coordinator') || 
                            auth.role === 'admin' || 
                            auth.role === 'superadmin';
    
    if (!hasUpdateAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const billingId = params.id;
    const body = await req.json();
    const {
      status,
      description
    } = body;

    // Build update query
    let updateQuery = 'UPDATE billing_records SET updated_at = CURRENT_TIMESTAMP';
    const updateParams: any[] = [];
    let paramIndex = 1;
    
    if (status) {
      updateQuery += `, status = $${paramIndex}`;
      updateParams.push(status);
      paramIndex++;
    }
    
    if (description !== undefined) {
      updateQuery += `, description = $${paramIndex}`;
      updateParams.push(description);
      paramIndex++;
    }
    
    updateQuery += ` WHERE id = $${paramIndex} RETURNING *`;
    updateParams.push(billingId);

    const result = await db.query(updateQuery, updateParams);
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Billing record not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Billing record updated successfully'
    });

  } catch (error: any) {
    console.error('Billing API Error (PUT):', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/itsm/billing/[id] - Delete a billing record
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth();
    
    // Only admins and superadmins can delete billing records
    const hasDeleteAccess = auth.role === 'admin' || auth.role === 'superadmin';
    
    if (!hasDeleteAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const billingId = params.id;
    
    // Check if there are any payments associated with this billing record
    const paymentCheckQuery = 'SELECT COUNT(*) as count FROM payment_records WHERE billing_record_id = $1';
    const paymentCheckResult = await db.query(paymentCheckQuery, [billingId]);
    
    if (parseInt(paymentCheckResult.rows[0].count) > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete billing record with associated payments' },
        { status: 400 }
      );
    }
    
    // Delete the billing record
    const deleteQuery = 'DELETE FROM billing_records WHERE id = $1 RETURNING id';
    const result = await db.query(deleteQuery, [billingId]);
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Billing record not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Billing record deleted successfully'
    });

  } catch (error: any) {
    console.error('Billing API Error (DELETE):', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}