// test-complete-login-flow.js
const puppeteer = require('puppeteer');

async function testCompleteLoginFlow() {
    let browser;
    try {
        console.log('Testing complete login flow with browser automation...');
        
        // Launch browser
        browser = await puppeteer.launch({ 
            headless: false, // Run in visible mode to see what's happening
            slowMo: 100, // Slow down operations to see them
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Enable request interception to see what's happening
        await page.setRequestInterception(false);
        
        // Listen for console messages
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        
        // Listen for page errors
        page.on('pageerror', error => console.log('PAGE ERROR:', error));
        
        // Go to login page
        console.log('Navigating to login page...');
        await page.goto('http://localhost:3500/auth/cover-login', { 
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        console.log('Current URL:', page.url());
        
        // Fill in login form
        console.log('Filling in login form...');
        await page.type('#email', 'purwadi@tabeldata.com');
        await page.type('#password', 'AdminPassword123!!');
        
        // Submit form
        console.log('Submitting login form...');
        await page.click('button[type="submit"]');
        
        // Wait for navigation or timeout
        console.log('Waiting for navigation...');
        try {
            await page.waitForNavigation({ 
                waitUntil: 'networkidle2', 
                timeout: 10000 
            });
        } catch (navError) {
            console.log('Navigation timeout, checking current URL...');
        }
        
        // Check where we ended up
        const finalUrl = page.url();
        console.log('Final URL:', finalUrl);
        
        // Check cookies
        const cookies = await page.cookies();
        console.log('Cookies after login:');
        cookies.forEach(cookie => {
            console.log(`  ${cookie.name} = ${cookie.value} (domain: ${cookie.domain})`);
        });
        
        // Check if we're authenticated
        const authCheck = await page.evaluate(async () => {
            try {
                const response = await fetch('/api/auth/me', { credentials: 'include' });
                const data = await response.json();
                return { status: response.status, data: data };
            } catch (error) {
                return { error: error.message };
            }
        });
        
        console.log('Auth check result:', authCheck);
        
        // Take a screenshot
        await page.screenshot({ path: 'login-test-result.png' });
        console.log('Screenshot saved as login-test-result.png');
        
    } catch (error) {
        console.error('Error in login flow test:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run the test
testCompleteLoginFlow();