// test-admin-access.js
const http = require('http');

// Create a simple HTTP client to test cookie handling
function testAdminAccess() {
    console.log('Testing admin access with cookie...');
    
    // First, login to get the token
    const loginOptions = {
        hostname: 'localhost',
        port: 3500,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    const loginReq = http.request(loginOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const loginResult = JSON.parse(data);
                console.log('Login Status:', res.statusCode);
                
                if (res.statusCode === 200) {
                    console.log('✅ Login successful');
                    console.log('Token:', loginResult.token.substring(0, 20) + '...');
                    console.log('RedirectTo:', loginResult.redirectTo);
                    
                    // Check if there are set-cookie headers
                    console.log('\nSet-Cookie Headers:');
                    const setCookieHeaders = res.headers['set-cookie'];
                    if (setCookieHeaders) {
                        setCookieHeaders.forEach((cookie, index) => {
                            console.log(`  Cookie ${index + 1}: ${cookie.substring(0, 50)}...`);
                        });
                    } else {
                        console.log('  No Set-Cookie headers found');
                    }
                } else {
                    console.log('❌ Login failed:', loginResult.message);
                }
            } catch (error) {
                console.error('Error parsing login response:', error);
                console.log('Raw response:', data);
            }
        });
    });
    
    loginReq.on('error', (error) => {
        console.error('Login request error:', error);
    });
    
    loginReq.write(JSON.stringify({
        email: 'purwadi@tabeldata.com',
        password: 'AdminPassword123!!'
    }));
    
    loginReq.end();
}

testAdminAccess();