# TDI Main App Employee - Production Deployment

## Running the Application

The application is configured to run on port 3400 and is accessible from all IP addresses (0.0.0.0).

To start the application in production mode, you can use one of the following methods:

### Method 1: Manual Start (Current Session)
```bash
cd /root/app/tdi-main-app-employee
PORT=3400 NODE_ENV=production node server.js
```

### Method 2: Background Process
```bash
cd /root/app/tdi-main-app-employee
PORT=3400 NODE_ENV=production node server.js &
```

### Method 3: Systemd Service (Recommended for Production)

1. Copy the service file to the systemd directory:
   ```bash
   sudo cp /root/app/tdi-main-app-employee/tdi-main-app-employee.service /etc/systemd/system/
   ```

2. Reload systemd to recognize the new service:
   ```bash
   sudo systemctl daemon-reload
   ```

3. Enable the service to start on boot:
   ```bash
   sudo systemctl enable tdi-main-app-employee
   ```

4. Start the service:
   ```bash
   sudo systemctl start tdi-main-app-employee
   ```

5. Check the status of the service:
   ```bash
   sudo systemctl status tdi-main-app-employee
   ```

6. To stop the service:
   ```bash
   sudo systemctl stop tdi-main-app-employee
   ```

7. To restart the service:
   ```bash
   sudo systemctl restart tdi-main-app-employee
   ```

## Accessing the Application

Once running, the application will be accessible at:
- http://YOUR_SERVER_IP:3400
- http://localhost:3400 (from the server itself)

## Troubleshooting

If you're unable to access the application from another machine:

1. Check that the application is running:
   ```bash
   netstat -tulpn | grep 3400
   ```

2. Check firewall settings:
   ```bash
   sudo ufw status
   # or
   sudo iptables -L
   ```

3. Ensure port 3400 is allowed through the firewall:
   ```bash
   sudo ufw allow 3400
   ```

4. Check application logs:
   ```bash
   sudo journalctl -u tdi-main-app-employee -f
   ```