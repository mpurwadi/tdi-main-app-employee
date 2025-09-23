// test-auth-after-login.js
const fetch = require('node-fetch');
const CookieJar = require('tough-cookie').CookieJar;
const fetchCookie = require('fetch-cookie');

async function testAuthAfterLogin() {
    try {
        console.log('Testing authentication after login...');
        
        // Create a cookie jar to maintain cookies
        const cookieJar = new CookieJar();
        const fetchWithCookies = fetchCookie(fetch, cookieJar);
        
        // Login
        console.log('Logging in...');
        const loginResponse = await fetchWithCookies('http://localhost:3500/api/auth/login', {
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
        console.log('Login Data:', loginData);
        
        if (!loginResponse.ok) {
            console.log('Login failed:', loginData.message);
            return;
        }
        
        // Check cookies
        console.log('\nCookies after login:');
        const cookies = cookieJar.getCookiesSync('http://localhost:3500');
        cookies.forEach(cookie => {
            console.log(`  ${cookie.key} = ${cookie.value}`);
        });
        
        // Test auth/me endpoint
        console.log('\nTesting auth/me endpoint...');
        const authResponse = await fetchWithCookies('http://localhost:3500/api/auth/me');
        const authData = await authResponse.json();
        console.log('Auth Status:', authResponse.status);
        console.log('Auth Data:', authData);
        
        if (authResponse.ok) {
            console.log('✅ Authentication successful!');
        } else {
            console.log('❌ Authentication failed!');
        }
        
    } catch (error) {
        console.error('Error testing auth:', error);
    }
}

testAuthAfterLogin();