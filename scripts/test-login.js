// test-login.js
const fetch = require('node-fetch');

async function testLogin() {
    try {
        console.log('Testing login with admin credentials...');
        
        // Try to login with Purwadi's credentials (superadmin)
        const response = await fetch('http://localhost:3500/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email: 'purwadi@tabeldata.com', 
                password: 'AdminPassword123!!'
            }),
        });

        const data = await response.json();
        
        console.log('Login Response (Purwadi):');
        console.log('Status:', response.status);
        console.log('Data:', data);
        
        if (response.ok) {
            console.log('Login successful!');
            console.log('Redirecting to:', data.redirectTo);
        } else {
            console.log('Login failed:', data.message);
        }
        
        // Try with Salman's credentials (admin)
        console.log('\nTrying with Salman\'s credentials...');
        const response2 = await fetch('http://localhost:3500/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email: 'mochsalmanr.work@gmail.com', 
                password: 'AdminPassword123!!'
            }),
        });

        const data2 = await response2.json();
        
        console.log('Login Response (Salman):');
        console.log('Status:', response2.status);
        console.log('Data:', data2);
        
        if (response2.ok) {
            console.log('Login successful!');
            console.log('Redirecting to:', data2.redirectTo);
        } else {
            console.log('Login failed:', data2.message);
        }
        
    } catch (error) {
        console.error('Error testing login:', error);
    }
}

testLogin();