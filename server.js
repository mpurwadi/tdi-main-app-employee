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

app.prepare().then(() => {
    if (httpsEnabled) {
        const options = {
            key: fs.readFileSync(path.resolve('./certificates/key.pem')),
            cert: fs.readFileSync(path.resolve('./certificates/cert.pem')),
        };
        
        createHttpsServer(options, (req, res) => {
            const parsedUrl = parse(req.url, true);
            handle(req, res, parsedUrl);
        }).listen(3000, (err) => {
            if (err) throw err;
            console.log('> Ready on https://localhost:3000');
        });
    } else {
        createServer((req, res) => {
            const parsedUrl = parse(req.url, true);
            handle(req, res, parsedUrl);
        }).listen(3000, (err) => {
            if (err) throw err;
            console.log('> Ready on http://localhost:3000');
        });
    }
});