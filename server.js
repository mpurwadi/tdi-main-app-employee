const { createServer: createHttpsServer } = require('https');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsEnabled = process.env.HTTPS === 'true';
const port = process.env.PORT || 3400;

// Function to check if certificates exist
function checkCertificates() {
  const keyPath = path.resolve('./certificates/key.pem');
  const certPath = path.resolve('./certificates/cert.pem');
  
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.warn('HTTPS certificates not found. Please run "npm run generate-certificates" first.');
    return false;
  }
  return true;
}

app.prepare().then(() => {
  if (httpsEnabled) {
    // Check if certificates exist
    if (!checkCertificates()) {
      console.log('Falling back to HTTP server...');
      startHttpServer();
      return;
    }
    
    try {
      const options = {
        key: fs.readFileSync(path.resolve('./certificates/key.pem')),
        cert: fs.readFileSync(path.resolve('./certificates/cert.pem')),
      };
      
      createHttpsServer(options, (req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      }).listen(port, '0.0.0.0', (err) => {
        if (err) throw err;
        console.log(`> Ready on https://0.0.0.0:${port}`);
      });
    } catch (error) {
      console.error('Failed to start HTTPS server:', error.message);
      console.log('Falling back to HTTP server...');
      startHttpServer();
    }
  } else {
    startHttpServer();
  }
  
  function startHttpServer() {
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(port, '0.0.0.0', (err) => {
      if (err) throw err;
      console.log(`> Ready on http://0.0.0.0:${port}`);
    });
  }
}).catch(err => {
  console.error('Failed to prepare Next.js app:', err);
  process.exit(1);
});