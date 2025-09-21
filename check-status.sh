#!/bin/bash

# Script to check the status of the TDI Main App Employee

echo "Checking TDI Main App Employee status..."

# Check if the process is running
PID=$(pgrep -f "node server.js")
if [ ! -z "$PID" ]; then
    echo "Application is running with PID: $PID"
else
    echo "Application is not running"
fi

# Check which port it's listening on
echo "Checking port status..."
netstat -tulpn | grep 3400

# Check system service status (if installed)
if systemctl list-unit-files | grep -q tdi-main-app-employee; then
    echo "System service status:"
    systemctl status tdi-main-app-employee --no-pager -l
else
    echo "System service not installed"
fi