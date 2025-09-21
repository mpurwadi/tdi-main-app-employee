const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const certificatesDir = path.join(__dirname, 'certificates');
const keyPath = path.join(certificatesDir, 'key.pem');
const certPath = path.join(certificatesDir, 'cert.pem');

// Create certificates directory if it doesn't exist
if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir);
}

// Generate certificates if they don't exist
if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.log('Generating self-signed certificates...');
  
  try {
    execSync(
      `openssl req -x509 -newkey rsa:4096 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -subj "/CN=localhost"`,
      { stdio: 'inherit' }
    );
    console.log('Certificates generated successfully!');
  } catch (error) {
    console.error('Failed to generate certificates:', error.message);
    console.log('Please ensure OpenSSL is installed on your system.');
    process.exit(1);
  }
} else {
  console.log('Certificates already exist.');
}