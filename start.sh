#!/bin/bash
# Wrapper script for tdi-main-app-service

# Source NVM if it exists
if [ -f "/root/.nvm/nvm.sh" ]; then
    source /root/.nvm/nvm.sh
    nvm use 24.8.0
fi

# Change to the working directory
cd /home/tabeldata/app/tdi-main-app-employee

# Set environment variables
export PORT=3400
export NODE_ENV=production

# Start the application
exec /root/.nvm/versions/node/v24.8.0/bin/node server.js