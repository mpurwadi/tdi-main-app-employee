// app/api/itsm/billing/payments/route.ts (test version)
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Mock auth for testing
const mockAuth = {
  userId: 1,
  email: 'test@example.com',
  role: 'billing_coordinator',
  division: 'IT',
  roles: ['billing_coordinator']
};

// GET /api/itsm/billing/payments - Get payment records with optional filters
export async function GET(req: NextRequest) {
  try {
    // For testing, we'll use mock auth instead of real auth
    const auth = mockAuth;
    
    // Check if user has appropriate role for billing
    const hasBillingAccess = auth.role === 'billing_coordinator' || 
                             auth.role === 'billing_admin' || 
                             auth.role === 'admin' || 
                             auth.role === 'superadmin';
    
    if (!hasBillingAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const billingRecordId = searchParams.get('billingRecordId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build query
    let query = `
      SELECT 
        pr.id,
        pr.billing_record_id,
        br.invoice_number,
        br.requester_division,
        br.provider_division,
        pr.payment_date,
        pr.amount,
        pr.payment_method,
        pr.reference_number,
        pr.status,
        pr.remarks,
        pr.created_at,
        pr.updated_at
      FROM payment_records pr
      JOIN billing_records br ON pr.billing_record_id = br.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    // Add filters
    if (billingRecordId) {
      query += ` AND pr.billing_record_id = $${paramIndex}`;
      params.push(billingRecordId);
      paramIndex++;
    }
    
    if (status) {
      query += ` AND pr.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (startDate) {
      query += ` AND pr.payment_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      query += ` AND pr.payment_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    
    // Add ordering and pagination
    query += ` ORDER BY pr.payment_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as count
      FROM payment_records pr
      WHERE 1=1
    `;
    
    const countParams: any[] = [];
    let countParamIndex = 1;
    
    if (billingRecordId) {
      countQuery += ` AND pr.billing_record_id = $${countParamIndex}`;
      countParams.push(billingRecordId);
      countParamIndex++;
    }
    
    if (status) {
      countQuery += ` AND pr.status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }
    
    if (startDate) {
      countQuery += ` AND pr.payment_date >= $${countParamIndex}`;
      countParams.push(startDate);
      countParamIndex++;
    }
    
    if (endDate) {
      countQuery += ` AND pr.payment_date <= $${countParamIndex}`;
      countParams.push(endDate);
      countParamIndex++;
    }
    
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error('Payments API Error (GET):', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

// POST /api/itsm/billing/payments - Create a new payment record
export async function POST(req: NextRequest) {
  try {
    // For testing, we'll use mock auth instead of real auth
    const auth = mockAuth;
    
    // Only billing coordinators, admins, and superadmins can create payment records
    const hasCreateAccess = auth.role === 'billing_coordinator' || 
                            auth.role === 'admin' || 
                            auth.role === 'superadmin';
    
    if (!hasCreateAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      billingRecordId,
      amount,
      paymentMethod,
      referenceNumber,
      remarks
    } = body;

    // Validate required fields
    if (!billingRecordId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Billing record ID and amount are required' },
        { status: 400 }
      );
    }

    // Check if billing record exists and is not already paid
    const billingQuery = 'SELECT id, total_amount, status FROM billing_records WHERE id = $1';
    const billingResult = await db.query(billingQuery, [billingRecordId]);
    
    if (billingResult.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Billing record not found' },
        { status: 404 }
      );
    }
    
    const billingRecord = billingResult.rows[0];
    
    if (billingRecord.status === 'paid') {
      return NextResponse.json(
        { success: false, error: 'Billing record is already paid' },
        { status: 400 }
      );
    }
    
    // Insert new payment record
    const insertQuery = `
      INSERT INTO payment_records (
        billing_record_id, amount, payment_method, reference_number, remarks
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const insertParams = [
      billingRecordId, amount, paymentMethod, referenceNumber, remarks
    ];

    const result = await db.query(insertQuery, insertParams);
    
    // Update billing record status to 'paid' if full amount is paid
    // In a real implementation, you might want to handle partial payments
    const updateBillingQuery = `
      UPDATE billing_records 
      SET status = 'paid', updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `;
    await db.query(updateBillingQuery, [billingRecordId]);
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Payment recorded successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Payments API Error (POST):', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}