// test-admin-access.js
const fetch = require('node-fetch');

async function testAdminAccess() {
    try {
        console.log('Testing direct access to admin dashboard...');
        
        // First, login to get a token
        const loginResponse = await fetch('http://localhost:3500/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email: 'purwadi@tabeldata.com', 
                password: 'AdminPassword123!!'
            }),
        });

        const loginData = await loginResponse.json();
        
        if (!loginResponse.ok) {
            console.log('Login failed:', loginData.message);
            return;
        }
        
        console.log('Login successful!');
        console.log('Token:', loginData.token.substring(0, 20) + '...');
        console.log('RedirectTo:', loginData.redirectTo);
        
        // Now try to access the admin dashboard with the token
        console.log('\nTesting access to admin dashboard...');
        const dashboardResponse = await fetch('http://localhost:3500/admin/dashboard', {
            method: 'GET',
            headers: {
                'Cookie': `token=${loginData.token}`
            }
        });
        
        console.log('Dashboard Response:');
        console.log('Status:', dashboardResponse.status);
        console.log('Headers:', Object.fromEntries(dashboardResponse.headers));
        
        // Try to get the content
        const dashboardText = await dashboardResponse.text();
        console.log('Content Length:', dashboardText.length);
        console.log('Content Start:', dashboardText.substring(0, 200));
        
    } catch (error) {
        console.error('Error testing admin access:', error);
    }
}

testAdminAccess();