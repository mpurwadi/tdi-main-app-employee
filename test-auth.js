// Simple test script to verify authentication flow
const fetch = require('node-fetch');
const fs = require('fs');

async function testAuth() {
  try {
    console.log('Testing authentication flow...');
    
    // First, try to login
    console.log('Attempting login...');
    const loginResponse = await fetch('http://localhost:3501/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'purwadi@tabeldata.com',
        password: 'AdminPassword123!!'  // Password from create-admin.js
      })
    });
    
    console.log('Login response status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    // Get cookies from response
    const cookies = loginResponse.headers.raw()['set-cookie'];
    console.log('Cookies from login response:', cookies);
    
    if (cookies) {
      // Try to access protected endpoint
      console.log('Attempting to access protected service categories endpoint...');
      const categoriesResponse = await fetch('http://localhost:3501/api/itsm/service-categories', {
        method: 'GET',
        headers: {
          'Cookie': cookies.join('; ')
        }
      });
      
      console.log('Categories response status:', categoriesResponse.status);
      const categoriesData = await categoriesResponse.json();
      console.log('Categories response:', categoriesData);
      
      // Also test the auth/me endpoint
      console.log('Attempting to access auth/me endpoint...');
      const meResponse = await fetch('http://localhost:3501/api/auth/me', {
        method: 'GET',
        headers: {
          'Cookie': cookies.join('; ')
        }
      });
      
      console.log('Me response status:', meResponse.status);
      const meData = await meResponse.json();
      console.log('Me response:', meData);
    } else {
      console.log('No cookies received from login, cannot test protected endpoint');
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testAuth();