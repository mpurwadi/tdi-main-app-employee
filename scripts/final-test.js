// final-test.js
const http = require('http');

async function finalTest() {
    console.log('🧪 Final test: Simulating complete login flow...');
    
    return new Promise((resolve) => {
        // Step 1: Login
        console.log('\n1️⃣ Logging in...');
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
                    console.log('   Status:', res.statusCode);
                    
                    if (res.statusCode === 200) {
                        console.log('   ✅ Login successful');
                        console.log('   📍 Redirecting to:', loginResult.redirectTo);
                        
                        // Extract cookie from response headers
                        const setCookieHeaders = res.headers['set-cookie'];
                        if (setCookieHeaders && setCookieHeaders.length > 0) {
                            console.log('   🍪 Cookie set successfully');
                            
                            // Step 2: Access admin dashboard with cookie
                            console.log('\n2️⃣ Accessing admin dashboard...');
                            
                            const dashboardOptions = {
                                hostname: 'localhost',
                                port: 3500,
                                path: loginResult.redirectTo,
                                method: 'GET',
                                headers: {
                                    'Cookie': setCookieHeaders[0].split(';')[0] // Extract just the token part
                                }
                            };
                            
                            const dashboardReq = http.request(dashboardOptions, (dashboardRes) => {
                                console.log('   Status:', dashboardRes.statusCode);
                                
                                if (dashboardRes.statusCode === 200) {
                                    console.log('   ✅ Admin dashboard loaded successfully!');
                                    console.log('\n🎉 COMPLETE: Login and redirect flow working correctly!');
                                    resolve(true);
                                } else {
                                    console.log('   ❌ Failed to access admin dashboard');
                                    
                                    // Try to get more details
                                    let dashboardData = '';
                                    dashboardRes.on('data', (chunk) => {
                                        dashboardData += chunk;
                                    });
                                    
                                    dashboardRes.on('end', () => {
                                        console.log('   Response (first 200 chars):', dashboardData.substring(0, 200));
                                        console.log('\n⚠️  PARTIAL SUCCESS: Login works but dashboard access failed');
                                        resolve(false);
                                    });
                                }
                            });
                            
                            dashboardReq.on('error', (error) => {
                                console.error('   Dashboard request error:', error.message);
                                console.log('\n⚠️  PARTIAL SUCCESS: Login works but dashboard access failed');
                                resolve(false);
                            });
                            
                            dashboardReq.end();
                        } else {
                            console.log('   ❌ No cookie set in response');
                            console.log('\n❌ FAILED: Login succeeded but no cookie was set');
                            resolve(false);
                        }
                    } else {
                        console.log('   ❌ Login failed:', loginResult.message);
                        console.log('\n❌ FAILED: Login process failed');
                        resolve(false);
                    }
                } catch (error) {
                    console.error('   Error parsing response:', error.message);
                    console.log('\n❌ FAILED: Error parsing login response');
                    resolve(false);
                }
            });
        });
        
        loginReq.on('error', (error) => {
            console.error('   Login request error:', error.message);
            console.log('\n❌ FAILED: Cannot connect to login API');
            resolve(false);
        });
        
        loginReq.write(JSON.stringify({
            email: 'purwadi@tabeldata.com',
            password: 'AdminPassword123!!'
        }));
        
        loginReq.end();
    });
}

// Run the test
finalTest().then((success) => {
    console.log('\n📊 Test Summary:');
    console.log(success ? '   ✅ PASS' : '   ❌ FAIL');
    console.log('\n💡 If this test passes but you still see the redirect issue in browser:');
    console.log('   1. Clear browser cache and cookies');
    console.log('   2. Try in an incognito/private browsing window');
    console.log('   3. Check browser developer tools for cookie issues');
    console.log('   4. Ensure you are accessing the correct domain/port');
});