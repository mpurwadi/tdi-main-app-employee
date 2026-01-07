// simple-test.js
async function simpleTest() {
    console.log('Testing simple login...');
    
    try {
        // Import fetch dynamically
        const { default: fetch } = await import('node-fetch');
        
        // Login
        console.log('Logging in...');
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
        
        if (loginResponse.ok) {
            console.log('✅ Login successful!');
            console.log('RedirectTo:', loginData.redirectTo);
        } else {
            console.log('❌ Login failed:', loginData.message);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

simpleTest();