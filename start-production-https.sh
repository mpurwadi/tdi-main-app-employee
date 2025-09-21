#!/bin/bash

# Production deployment script for the application with HTTPS

# Ensure we're in the project directory
cd /root/app/tdi-main-app-employee

# Build the application (if not already built)
echo "Building the application..."

# Set environment to production
export NODE_ENV=production
export HTTPS=true

# Check if certificates exist, generate if not
if [ ! -f "certificates/key.pem" ] || [ ! -f "certificates/cert.pem" ]; then
    echo "Generating SSL certificates..."
    npm run generate-certificates
fi

# Start the application on port 3443, accessible from all IPs with HTTPS
echo "Starting the application in production mode with HTTPS on port 3443..."
PORT=3443 node server.js

echo "Application should now be accessible at https://0.0.0.0:3443"