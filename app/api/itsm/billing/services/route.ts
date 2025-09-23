// app/api/itsm/billing/services/route.ts (test version)
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

// GET /api/itsm/billing/services - Get service catalog items
export async function GET(req: NextRequest) {
  try {
    // For testing, we'll use mock auth instead of real auth
    const auth = mockAuth;
    
    // Check if user has appropriate role for billing
    const hasBillingAccess = auth.role === 'billing_coordinator' || 
                             auth.role === 'billing_admin' || 
                             auth.role === 'service_catalog_manager' ||
                             auth.role === 'admin' || 
                             auth.role === 'superadmin';
    
    if (!hasBillingAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build query
    let query = `
      SELECT 
        id, name, description, category, unit_price, unit_type, created_at, updated_at
      FROM service_catalog
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    // Add filters
    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    // Add ordering and pagination
    query += ` ORDER BY name LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as count
      FROM service_catalog
      WHERE 1=1
    `;
    
    const countParams: any[] = [];
    let countParamIndex = 1;
    
    if (category) {
      countQuery += ` AND category = $${countParamIndex}`;
      countParams.push(category);
      countParamIndex++;
    }
    
    if (search) {
      countQuery += ` AND (name ILIKE $${countParamIndex} OR description ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
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
    console.error('Service Catalog API Error (GET):', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

// POST /api/itsm/billing/services - Create a new service catalog item
export async function POST(req: NextRequest) {
  try {
    // For testing, we'll use mock auth instead of real auth
    const auth = mockAuth;
    
    // Only service catalog managers, admins, and superadmins can create services
    const hasCreateAccess = auth.role === 'service_catalog_manager' || 
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
      name,
      description,
      category,
      unitPrice,
      unitType
    } = body;

    // Validate required fields
    if (!name || !category || !unitPrice || !unitType) {
      return NextResponse.json(
        { success: false, error: 'Name, category, unit price, and unit type are required' },
        { status: 400 }
      );
    }

    // Insert new service catalog item
    const insertQuery = `
      INSERT INTO service_catalog (
        name, description, category, unit_price, unit_type
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const insertParams = [
      name, description, category, unitPrice, unitType
    ];

    const result = await db.query(insertQuery, insertParams);
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Service catalog item created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Service Catalog API Error (POST):', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}