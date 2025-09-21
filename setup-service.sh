#!/bin/bash

# Copy the service file to the systemd directory
sudo cp /root/app/tdi-main-app-employee/tdi-employee.service /etc/systemd/system/

# Reload systemd to recognize the new service
sudo systemctl daemon-reload

# Enable the service to start on boot
sudo systemctl enable tdi-employee.service

# Start the service
sudo systemctl start tdi-employee.service

# Check the status of the service
sudo systemctl status tdi-employee.service