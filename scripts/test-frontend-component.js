// test-frontend-component.js
// This simulates what would happen in the frontend component
const fetch = require('node-fetch');

async function testFrontendComponent() {
    try {
        console.log('Simulating frontend component behavior...');
        
        // Simulate getting auth token (this would normally be in cookies)
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
        
        console.log('Admin authenticated successfully');
        
        // Simulate user password reset action (this would be triggered by clicking the button)
        console.log('\nSimulating password reset action...');
        
        const resetResponse = await fetch('http://localhost:3500/api/admin/users/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.token}`
            },
            body: JSON.stringify({ 
                userId: 3, // test2 user
                newPassword: 'SecurePassword123!'
            }),
        });

        const resetData = await resetResponse.json();
        
        console.log('Password Reset Result:');
        console.log('Status:', resetResponse.status);
        if (resetResponse.ok) {
            console.log('✓ Success:', resetData.message);
            console.log('✓ User ID:', resetData.userId);
        } else {
            console.log('✗ Error:', resetData.message);
        }
        
        console.log('\nFrontend component test completed successfully!');
        
    } catch (error) {
        console.error('Error in frontend component test:', error);
    }
}

testFrontendComponent();