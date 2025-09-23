// test-password-reset.js
const fetch = require('node-fetch');

async function testPasswordReset() {
    try {
        console.log('Testing password reset API...');
        
        // First, login as admin to get a token
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
        
        // Now test password reset API
        console.log('\nTesting password reset for user ID 1...');
        
        const resetResponse = await fetch('http://localhost:3500/api/admin/users/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `token=${loginData.token}`
            },
            body: JSON.stringify({ 
                userId: 1,
                newPassword: 'NewPassword123!'
            }),
        });

        const resetData = await resetResponse.json();
        
        console.log('Password Reset Response:');
        console.log('Status:', resetResponse.status);
        if (resetResponse.ok) {
            console.log('Success:', resetData.message);
        } else {
            console.log('Error:', resetData.message);
        }
        
    } catch (error) {
        console.error('Error testing password reset:', error);
    }
}

testPasswordReset();
