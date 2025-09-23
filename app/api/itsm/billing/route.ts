// app/api/itsm/billing/route.ts (test version with mock auth)
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

// GET /api/itsm/billing - Get billing records with optional filters
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
    const status = searchParams.get('status');
    const requesterDivision = searchParams.get('requesterDivision');
    const providerDivision = searchParams.get('providerDivision');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build query
    let query = `
      SELECT 
        br.id,
        br.invoice_number,
        br.requester_division,
        br.provider_division,
        sc.name as service_name,
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
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    // Add filters
    if (status) {
      query += ` AND br.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (requesterDivision) {
      query += ` AND br.requester_division = $${paramIndex}`;
      params.push(requesterDivision);
      paramIndex++;
    }
    
    if (providerDivision) {
      query += ` AND br.provider_division = $${paramIndex}`;
      params.push(providerDivision);
      paramIndex++;
    }
    
    if (startDate) {
      query += ` AND br.billing_period_start >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      query += ` AND br.billing_period_end <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    
    // Add ordering and pagination
    query += ` ORDER BY br.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as count
      FROM billing_records br
      WHERE 1=1
    `;
    
    const countParams: any[] = [];
    let countParamIndex = 1;
    
    if (status) {
      countQuery += ` AND br.status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }
    
    if (requesterDivision) {
      countQuery += ` AND br.requester_division = $${countParamIndex}`;
      countParams.push(requesterDivision);
      countParamIndex++;
    }
    
    if (providerDivision) {
      countQuery += ` AND br.provider_division = $${countParamIndex}`;
      countParams.push(providerDivision);
      countParamIndex++;
    }
    
    if (startDate) {
      countQuery += ` AND br.billing_period_start >= $${countParamIndex}`;
      countParams.push(startDate);
      countParamIndex++;
    }
    
    if (endDate) {
      countQuery += ` AND br.billing_period_end <= $${countParamIndex}`;
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
    console.error('Billing API Error (GET):', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

// POST /api/itsm/billing - Create a new billing record
export async function POST(req: NextRequest) {
  try {
    // For testing, we'll use mock auth instead of real auth
    const auth = mockAuth;
    
    // Only billing coordinators, admins, and superadmins can create billing records
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
      requesterDivision,
      providerDivision,
      serviceCatalogId,
      quantity,
      unitPrice,
      totalAmount,
      billingPeriodStart,
      billingPeriodEnd,
      dueDate,
      description
    } = body;

    // Validate required fields
    if (!requesterDivision || !providerDivision || !quantity || !unitPrice || !totalAmount || 
        !billingPeriodStart || !billingPeriodEnd || !dueDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now()}`;

    // Insert new billing record
    const insertQuery = `
      INSERT INTO billing_records (
        invoice_number, requester_division, provider_division, service_catalog_id,
        quantity, unit_price, total_amount, billing_period_start, billing_period_end,
        due_date, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const insertParams = [
      invoiceNumber, requesterDivision, providerDivision, serviceCatalogId,
      quantity, unitPrice, totalAmount, billingPeriodStart, billingPeriodEnd,
      dueDate, description
    ];

    const result = await db.query(insertQuery, insertParams);
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Billing record created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Billing API Error (POST):', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}