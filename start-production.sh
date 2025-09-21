#!/bin/bash

# Production deployment script for the application

# Ensure we're in the project directory
cd /root/app/tdi-main-app-employee

# Build the application (if not already built)
echo "Building the application..."

# Set environment to production
export NODE_ENV=production

# Start the application on port 3400, accessible from all IPs
echo "Starting the application in production mode on port 3400..."
PORT=3400 node server.js

echo "Application should now be accessible at http://0.0.0.0:3400"