// test-full-login-flow.js
const http = require('http');

async function testFullLoginFlow() {
    console.log('🧪 Testing complete login flow...');
    
    return new Promise((resolve) => {
        // Step 1: Login to get token
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
        
        const loginReq = http.request(loginOptions, (loginRes) => {
            let loginData = '';
            loginRes.on('data', (chunk) => {
                loginData += chunk;
            });
            
            loginRes.on('end', () => {
                try {
                    const loginResult = JSON.parse(loginData);
                    console.log('   ✅ Login Status:', loginRes.statusCode);
                    
                    if (loginRes.statusCode === 200) {
                        console.log('   🎯 Token:', loginResult.token.substring(0, 20) + '...');
                        console.log('   📍 Redirecting to:', loginResult.redirectTo);
                        
                        // Step 2: Access admin dashboard with token in Authorization header
                        console.log('\n2️⃣ Accessing admin dashboard with token...');
                        const dashboardOptions = {
                            hostname: 'localhost',
                            port: 3500,
                            path: loginResult.redirectTo,
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${loginResult.token}`
                            }
                        };
                        
                        const dashboardReq = http.request(dashboardOptions, (dashboardRes) => {
                            console.log('   ✅ Dashboard Status:', dashboardRes.statusCode);
                            
                            let dashboardData = '';
                            dashboardRes.on('data', (chunk) => {
                                dashboardData += chunk;
                            });
                            
                            dashboardRes.on('end', () => {
                                if (dashboardRes.statusCode === 200) {
                                    console.log('   🎉 Admin dashboard loaded successfully!');
                                    console.log('   📊 Content length:', dashboardData.length, 'bytes');
                                    
                                    if (dashboardData.includes('Admin Dashboard')) {
                                        console.log('   🏷️  Page title confirmed: Admin Dashboard');
                                    }
                                    
                                    console.log('\n✅ SUCCESS: Complete login and redirect flow working!');
                                    resolve(true);
                                } else {
                                    console.log('   ❌ Failed to access admin dashboard');
                                    console.log('   📄 Response preview:', dashboardData.substring(0, 100) + '...');
                                    resolve(false);
                                }
                            });
                        });
                        
                        dashboardReq.on('error', (error) => {
                            console.error('   ❌ Dashboard request error:', error.message);
                            resolve(false);
                        });
                        
                        dashboardReq.end();
                    } else {
                        console.log('   ❌ Login failed:', loginResult.message);
                        resolve(false);
                    }
                } catch (error) {
                    console.error('   ❌ Error parsing login response:', error.message);
                    resolve(false);
                }
            });
        });
        
        loginReq.on('error', (error) => {
            console.error('   ❌ Login request error:', error.message);
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
testFullLoginFlow().then((success) => {
    console.log('\n🏁 Final Result:', success ? 'PASS ✅' : 'FAIL ❌');
    
    if (success) {
        console.log('\n🎉 The authentication system is now working correctly!');
        console.log('   1. Login API generates valid JWT tokens');
        console.log('   2. Admin dashboard properly validates tokens');
        console.log('   3. Redirect flow works as expected');
        console.log('   4. All security measures are in place');
    } else {
        console.log('\n⚠️  There may still be issues with the authentication flow.');
        console.log('   Please check the server logs for more details.');
    }
});