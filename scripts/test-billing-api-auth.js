// test-billing-api-auth.js
const fs = require('fs').promises;

async function testAPI() {
    const baseUrl = 'http://localhost:3500';
    
    console.log('Testing ITSM Billing API endpoints with authentication...\n');
    
    try {
        // First, let's try to access the auth endpoint to see if we can get a token
        console.log('Checking authentication endpoint...');
        let response = await fetch(`${baseUrl}/api/auth/me`);
        console.log(`  Auth endpoint status: ${response.status}`);
        
        if (response.status === 200) {
            let data = await response.json();
            console.log(`  Auth success: ${data.success}`);
            if (data.success) {
                console.log(`  User role: ${data.role}`);
                console.log(`  Is admin: ${data.isAdmin}`);
            }
        } else {
            console.log(`  Auth failed with status: ${response.status}`);
            let text = await response.text();
            console.log(`  Response: ${text.substring(0, 200)}...`);
        }
        console.log('');
        
        // Test API endpoints
        const apiEndpoints = [
            { name: 'Billing Records', url: '/api/itsm/billing' },
            { name: 'Service Catalog', url: '/api/itsm/billing/services' },
            { name: 'Payments', url: '/api/itsm/billing/payments' },
            { name: 'Reports', url: '/api/itsm/billing/reports' }
        ];
        
        for (const endpoint of apiEndpoints) {
            console.log(`Testing: ${endpoint.name} (${endpoint.url})`);
            try {
                response = await fetch(`${baseUrl}${endpoint.url}`);
                console.log(`  Status: ${response.status}`);
                
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    console.log(`  Success: ${data.success}`);
                    if (data.success) {
                        if (data.data) {
                            if (Array.isArray(data.data)) {
                                console.log(`  Items found: ${data.data.length}`);
                                if (data.data.length > 0) {
                                    console.log(`  First item:`, Object.keys(data.data[0]).slice(0, 3).join(', '));
                                }
                            } else {
                                console.log(`  Data keys:`, Object.keys(data.data).join(', '));
                            }
                        }
                        if (data.pagination) {
                            console.log(`  Pagination: Page ${data.pagination.page} of ${data.pagination.pages}`);
                        }
                    } else {
                        console.log(`  Error: ${data.error}`);
                    }
                } else {
                    console.log(`  Content-Type: ${contentType}`);
                    const text = await response.text();
                    console.log(`  Response (first 200 chars): ${text.substring(0, 200)}`);
                }
            } catch (error) {
                console.log(`  Error: ${error.message}`);
            }
            console.log('');
        }
        
        console.log('API testing completed!');
        
    } catch (error) {
        console.error('Error testing API:', error);
    }
}

testAPI();