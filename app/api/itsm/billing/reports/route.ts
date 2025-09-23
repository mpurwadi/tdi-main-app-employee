// app/api/itsm/billing/reports/route.ts (test version)
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

// GET /api/itsm/billing/reports - Get billing reports with optional filters
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const requesterDivision = searchParams.get('requesterDivision');
    const providerDivision = searchParams.get('providerDivision');

    // Get billing summary statistics
    let summaryQuery = `
      SELECT 
        COUNT(*) as total_invoices,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_invoices,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_invoices,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_invoices,
        SUM(total_amount) as total_billed,
        SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN status = 'pending' THEN total_amount ELSE 0 END) as pending_amount,
        SUM(CASE WHEN status = 'overdue' THEN total_amount ELSE 0 END) as overdue_amount
      FROM billing_records
      WHERE 1=1
    `;
    
    const summaryParams: any[] = [];
    let summaryParamIndex = 1;
    
    if (startDate) {
      summaryQuery += ` AND billing_period_start >= $${summaryParamIndex}`;
      summaryParams.push(startDate);
      summaryParamIndex++;
    }
    
    if (endDate) {
      summaryQuery += ` AND billing_period_end <= $${summaryParamIndex}`;
      summaryParams.push(endDate);
      summaryParamIndex++;
    }
    
    if (requesterDivision) {
      summaryQuery += ` AND requester_division = $${summaryParamIndex}`;
      summaryParams.push(requesterDivision);
      summaryParamIndex++;
    }
    
    if (providerDivision) {
      summaryQuery += ` AND provider_division = $${summaryParamIndex}`;
      summaryParams.push(providerDivision);
      summaryParamIndex++;
    }
    
    const summaryResult = await db.query(summaryQuery, summaryParams);
    const summary = summaryResult.rows[0];

    // Get billing by division
    let divisionQuery = `
      SELECT 
        requester_division,
        COUNT(*) as invoice_count,
        SUM(total_amount) as total_amount
      FROM billing_records
      WHERE 1=1
    `;
    
    const divisionParams: any[] = [];
    let divisionParamIndex = 1;
    
    if (startDate) {
      divisionQuery += ` AND billing_period_start >= $${divisionParamIndex}`;
      divisionParams.push(startDate);
      divisionParamIndex++;
    }
    
    if (endDate) {
      divisionQuery += ` AND billing_period_end <= $${divisionParamIndex}`;
      divisionParams.push(endDate);
      divisionParamIndex++;
    }
    
    if (requesterDivision) {
      divisionQuery += ` AND requester_division = $${divisionParamIndex}`;
      divisionParams.push(requesterDivision);
      divisionParamIndex++;
    }
    
    if (providerDivision) {
      divisionQuery += ` AND provider_division = $${divisionParamIndex}`;
      divisionParams.push(providerDivision);
      divisionParamIndex++;
    }
    
    divisionQuery += ` GROUP BY requester_division ORDER BY total_amount DESC`;
    
    const divisionResult = await db.query(divisionQuery, divisionParams);

    // Get monthly billing trend
    let trendQuery = `
      SELECT 
        DATE_TRUNC('month', billing_period_start) as billing_month,
        COUNT(*) as invoice_count,
        SUM(total_amount) as total_amount
      FROM billing_records
      WHERE 1=1
    `;
    
    const trendParams: any[] = [...divisionParams]; // Start with division params
    let trendParamIndex = divisionParamIndex;
    
    if (startDate) {
      trendQuery += ` AND billing_period_start >= $${trendParamIndex}`;
      trendParams.push(startDate);
      trendParamIndex++;
    }
    
    if (endDate) {
      trendQuery += ` AND billing_period_end <= $${trendParamIndex}`;
      trendParams.push(endDate);
      trendParamIndex++;
    }
    
    trendQuery += ` GROUP BY DATE_TRUNC('month', billing_period_start) ORDER BY billing_month`;
    
    const trendResult = await db.query(trendQuery, trendParams);

    return NextResponse.json({
      success: true,
      data: {
        summary,
        byDivision: divisionResult.rows,
        monthlyTrend: trendResult.rows
      }
    });

  } catch (error: any) {
    console.error('Billing Reports API Error (GET):', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

// POST /api/itsm/billing/reports - Generate a detailed billing report
export async function POST(req: NextRequest) {
  try {
    // For testing, we'll use mock auth instead of real auth
    const auth = mockAuth;
    
    // Only billing coordinators, admins, and superadmins can generate reports
    const hasReportAccess = auth.role === 'billing_coordinator' || 
                           auth.role === 'admin' || 
                           auth.role === 'superadmin';
    
    if (!hasReportAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      reportName,
      startDate,
      endDate,
      requesterDivision,
      providerDivision
    } = body;

    // Validate required fields
    if (!reportName || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Report name, start date, and end date are required' },
        { status: 400 }
      );
    }

    // Get detailed billing data for the report
    let detailQuery = `
      SELECT 
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
        br.created_at
      FROM billing_records br
      LEFT JOIN service_catalog sc ON br.service_catalog_id = sc.id
      WHERE br.billing_period_start >= $1 AND br.billing_period_end <= $2
    `;
    
    const detailParams: any[] = [startDate, endDate];
    let detailParamIndex = 3;
    
    if (requesterDivision) {
      detailQuery += ` AND br.requester_division = $${detailParamIndex}`;
      detailParams.push(requesterDivision);
      detailParamIndex++;
    }
    
    if (providerDivision) {
      detailQuery += ` AND br.provider_division = $${detailParamIndex}`;
      detailParams.push(providerDivision);
      detailParamIndex++;
    }
    
    detailQuery += ` ORDER BY br.created_at DESC`;
    
    const detailResult = await db.query(detailQuery, detailParams);

    // In a real implementation, you would generate a PDF or CSV file and save it
    // For now, we'll just return the data
    
    // Save report metadata to database
    const insertQuery = `
      INSERT INTO billing_reports (
        report_name, report_period_start, report_period_end, generated_by
      ) VALUES ($1, $2, $3, $4)
      RETURNING id, created_at
    `;
    
    const insertParams = [
      reportName, 
      startDate, 
      endDate, 
      auth.userId
    ];

    const insertResult = await db.query(insertQuery, insertParams);
    const reportMetadata = insertResult.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        report: detailResult.rows,
        metadata: reportMetadata
      },
      message: 'Report generated successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Billing Reports API Error (POST):', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}