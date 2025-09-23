// test-billing-api.js
const fs = require('fs').promises;

async function testAPI() {
    const baseUrl = 'http://localhost:3500/api/itsm/billing';
    
    console.log('Testing ITSM Billing API endpoints...\n');
    
    try {
        // Test 1: GET /api/itsm/billing - Get all billing records
        console.log('Test 1: GET /api/itsm/billing');
        let response = await fetch(baseUrl);
        let data = await response.json();
        console.log(`  Status: ${response.status}`);
        console.log(`  Success: ${data.success}`);
        if (data.success) {
            console.log(`  Records found: ${data.data.length}`);
            console.log(`  First record: ${data.data[0]?.invoice_number} - Rp ${data.data[0]?.total_amount}`);
        }
        console.log('');
        
        // Test 2: GET /api/itsm/billing/services - Get service catalog
        console.log('Test 2: GET /api/itsm/billing/services');
        response = await fetch(`${baseUrl}/services`);
        data = await response.json();
        console.log(`  Status: ${response.status}`);
        console.log(`  Success: ${data.success}`);
        if (data.success) {
            console.log(`  Services found: ${data.data.length}`);
            console.log(`  First service: ${data.data[0]?.name} - Rp ${data.data[0]?.unit_price} per ${data.data[0]?.unit_type}`);
        }
        console.log('');
        
        // Test 3: GET /api/itsm/billing/payments - Get payment records
        console.log('Test 3: GET /api/itsm/billing/payments');
        response = await fetch(`${baseUrl}/payments`);
        data = await response.json();
        console.log(`  Status: ${response.status}`);
        console.log(`  Success: ${data.success}`);
        if (data.success) {
            console.log(`  Payments found: ${data.data.length}`);
            if (data.data.length > 0) {
                console.log(`  First payment: Rp ${data.data[0]?.amount} (${data.data[0]?.status})`);
            }
        }
        console.log('');
        
        // Test 4: GET /api/itsm/billing/reports - Get billing reports
        console.log('Test 4: GET /api/itsm/billing/reports');
        response = await fetch(`${baseUrl}/reports`);
        data = await response.json();
        console.log(`  Status: ${response.status}`);
        console.log(`  Success: ${data.success}`);
        if (data.success) {
            console.log(`  Summary: ${data.data.summary.total_invoices} invoices, Rp ${data.data.summary.total_billed}`);
            console.log(`  Divisions: ${data.data.byDivision.length} divisions`);
        }
        console.log('');
        
        console.log('API testing completed successfully!');
        
    } catch (error) {
        console.error('Error testing API:', error);
    }
}

testAPI();