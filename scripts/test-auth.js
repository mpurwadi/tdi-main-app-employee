// test-auth.js
const fetch = require('node-fetch');

async function testAuth() {
    try {
        console.log('Testing authentication API...');
        
        // Test the me endpoint
        const response = await fetch('http://localhost:3500/api/auth/me');
        const data = await response.json();
        
        console.log('Auth API Response:');
        console.log('Status:', response.status);
        console.log('Data:', data);
        
    } catch (error) {
        console.error('Error testing auth API:', error);
    }
}

testAuth();