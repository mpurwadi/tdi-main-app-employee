import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthServer } from "@/lib/auth";
import { 
  serviceRequestService,
  billingService
} from '@/services/enhancedItsmService';

// GET /api/itsm/billing/reports - Get billing reports by division
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuthServer();
    
    // Check if user has appropriate role
    const allowedRoles = ['admin', 'superadmin', 'billing_coordinator', 'itsm_manager', 'itsm_division_admin'];
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
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const division = searchParams.get('division');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let reports;
    
    if (division) {
      // Get reports for a specific division
      const requesterReports = await billingService.getBillingRecordsByRequesterDivision(division);
      const providerReports = await billingService.getBillingRecordsByProviderDivision(division);
      
      // Combine and deduplicate reports
      const allReports = [...requesterReports, ...providerReports];
      const uniqueReports = Array.from(new Map(allReports.map(item => [item.id, item])).values());
      
      reports = uniqueReports;
    } else {
      // Get all reports
      reports = await billingService.getAllBillingRecords();
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date('1970-01-01');
      const end = endDate ? new Date(endDate) : new Date('9999-12-31');
      
      reports = reports.filter(report => {
        const reportDate = new Date(report.billing_period);
        return reportDate >= start && reportDate <= end;
      });
    }
    
    // Calculate summary statistics
    const totalAmount = reports.reduce((sum, report) => sum + report.amount, 0);
    const totalPaid = reports.filter(r => r.status === 'paid').reduce((sum, report) => sum + report.amount, 0);
    const totalPending = reports.filter(r => r.status === 'pending').reduce((sum, report) => sum + report.amount, 0);
    
    // Group by division
    const divisionSummary: any = {};
    reports.forEach(report => {
      const div = report.requester_division;
      if (!divisionSummary[div]) {
        divisionSummary[div] = {
          division: div,
          total_requests: 0,
          total_amount: 0,
          paid_amount: 0,
          pending_amount: 0,
          service_requests: []
        };
      }
      
      divisionSummary[div].total_requests += 1;
      divisionSummary[div].total_amount += report.amount;
      
      if (report.status === 'paid') {
        divisionSummary[div].paid_amount += report.amount;
      } else if (report.status === 'pending') {
        divisionSummary[div].pending_amount += report.amount;
      }
      
      divisionSummary[div].service_requests.push({
        id: report.service_request_id,
        amount: report.amount,
        status: report.status,
        billing_period: report.billing_period,
        created_at: report.created_at
      });
    });
    
    return NextResponse.json({ 
      success: true, 
      data: {
        reports,
        summary: {
          total_amount: totalAmount,
          total_paid: totalPaid,
          total_pending: totalPending,
          division_summary: Object.values(divisionSummary)
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching billing reports:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch billing reports' 
      },
      { status: 500 }
    );
  }
}