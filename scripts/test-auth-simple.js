// test-auth-simple.js
const fetch = require('node-fetch');

async function testAuthSimple() {
    try {
        console.log('Testing simple auth endpoint...');
        
        // Test auth/me endpoint without login first
        console.log('\nTesting auth/me without login...');
        const authResponse = await fetch('http://localhost:3500/api/auth/me');
        const authData = await authResponse.json();
        console.log('Auth Status (without login):', authResponse.status);
        console.log('Auth Data (without login):', authData);
        
        // Login first
        console.log('\nLogging in...');
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
        console.log('Login Status:', loginResponse.status);
        
        if (!loginResponse.ok) {
            console.log('Login failed:', loginData.message);
            return;
        }
        
        // Extract the token from the response
        console.log('Token:', loginData.token.substring(0, 20) + '...');
        
        // Test auth/me endpoint with Authorization header
        console.log('\nTesting auth/me with token...');
        const authResponse2 = await fetch('http://localhost:3500/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });
        const authData2 = await authResponse2.json();
        console.log('Auth Status (with token):', authResponse2.status);
        console.log('Auth Data (with token):', authData2);
        
        if (authResponse2.ok) {
            console.log('✅ Authentication successful!');
        } else {
            console.log('❌ Authentication failed!');
        }
        
    } catch (error) {
        console.error('Error testing auth:', error);
    }
}

testAuthSimple();