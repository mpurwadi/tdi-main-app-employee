// check-login-page.js
const fs = require('fs');

// Read the login page file
const loginPageContent = fs.readFileSync('/root/app/tdi-main-app-employee_itsm/tdi-main-app-employee/app/(auth)/auth/cover-login/page.tsx', 'utf8');

// Find the handleSubmit function
const handleSubmitMatch = loginPageContent.match(/const handleSubmit = async \(.*?\)[^}]*\}/s);
if (handleSubmitMatch) {
    console.log('handleSubmit function found:');
    console.log(handleSubmitMatch[0]);
} else {
    console.log('handleSubmit function not found');
}