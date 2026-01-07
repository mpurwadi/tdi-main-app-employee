// cookie-test.js
async function cookieTest() {
    console.log('Testing cookies...');
    
    try {
        // Import fetch dynamically
        const { default: fetch } = await import('node-fetch');
        
        // Login and check cookies
        console.log('Logging in and checking cookies...');
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

        console.log('Login Status:', loginResponse.status);
        console.log('Response Headers:');
        for (const [key, value] of loginResponse.headers.entries()) {
            if (key.toLowerCase().includes('set-cookie') || key.toLowerCase().includes('cookie')) {
                console.log(`  ${key}: ${value}`);
            }
        }
        
        // Get all headers
        console.log('\nAll Response Headers:');
        for (const [key, value] of loginResponse.headers.entries()) {
            console.log(`  ${key}: ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

cookieTest();
