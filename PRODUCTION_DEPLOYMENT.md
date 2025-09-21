# TDI Main App Employee - Production Deployment Guide

This document provides detailed instructions on how to deploy and run the TDI Main App Employee application in a production environment.

## Prerequisites

Before deploying the application, ensure you have:

1. Node.js installed (version 16 or higher recommended)
2. PostgreSQL database accessible
3. Proper network/firewall configuration for port 3400

## Environment Configuration

The application requires specific environment variables to be set. These are defined in the `.env` file:

```bash
# Database Configuration
DB_HOST=192.168.100.115
DB_USER=postgres
DB_PASSWORD=456456
DB_NAME=opsapps
DB_PORT=5432
DB_SSLMODE=disable

# JWT Secret
JWT_SECRET=your-super-secret-key
```

Update these values according to your production environment.

## Database Setup

### Running Database Migrations

The application requires specific database tables to function properly. Run the migrations to set up the database schema:

```bash
cd /root/app/tdi-main-app-employee
node run-migrations.js
```

This will create all necessary tables including users, logbook entries, attendance records, and more.

### Testing Database Connection

You can verify the database connection with the provided test script:

```bash
cd /root/app/tdi-main-app-employee
node test-db-connection.js
```

### Creating an Admin User

After running migrations, create an admin user to access the application:

```bash
cd /root/app/tdi-main-app-employee
node create-admin.js
```

This will create a user with the following credentials:
- Username: purwadi
- Email: purwadi@tabeldata.com
- Password: TabeldataPassword11!
- Role: superadmin

**Important:** Change these default credentials immediately after the first login for security reasons.

## Build Process

Before running the application in production, you need to build it:

```bash
cd /root/app/tdi-main-app-employee
npm run build
```

This command compiles the Next.js application for production use.

## Production Deployment Methods

### Method 1: Direct Execution

To run the application directly in production mode:

```bash
cd /root/app/tdi-main-app-employee
PORT=3400 NODE_ENV=production node server.js
```

### Method 2: Direct Execution with HTTPS

To run the application directly in production mode with HTTPS:

```bash
cd /root/app/tdi-main-app-employee
HTTPS=true PORT=3443 NODE_ENV=production node server.js
```

### Method 3: Background Process

To run the application in the background:

```bash
cd /root/app/tdi-main-app-employee
PORT=3400 NODE_ENV=production node server.js &
```

### Method 4: Background Process with HTTPS

To run the application in the background with HTTPS:

```bash
cd /root/app/tdi-main-app-employee
HTTPS=true PORT=3443 NODE_ENV=production node server.js &
```

### Method 5: Using the Start Script

The application includes a convenience script for production deployment:

```bash
cd /root/app/tdi-main-app-employee
chmod +x start-production.sh
./start-production.sh
```

This script will automatically build the application and start it in production mode.

### Method 6: Using the HTTPS Start Script

The application includes a convenience script for HTTPS production deployment:

```bash
cd /root/app/tdi-main-app-employee
chmod +x start-production-https.sh
./start-production-https.sh
```

This script will automatically build the application, generate SSL certificates if needed, and start it in production mode with HTTPS.

### Method 4: Systemd Service (Recommended for Production)

For production environments, it's recommended to use systemd to manage the application as a service:

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

### Method 5: Systemd Service with HTTPS (Recommended for Production)

For production environments with HTTPS, it's recommended to use systemd to manage the application as a service:

1. Copy the HTTPS service file to the systemd directory:
   ```bash
   sudo cp /root/app/tdi-main-app-employee/tdi-employee-https.service /etc/systemd/system/
   ```

2. Reload systemd to recognize the new service:
   ```bash
   sudo systemctl daemon-reload
   ```

3. Enable the service to start on boot:
   ```bash
   sudo systemctl enable tdi-employee-https
   ```

4. Start the service:
   ```bash
   sudo systemctl start tdi-employee-https
   ```

5. Check the status of the service:
   ```bash
   sudo systemctl status tdi-employee-https
   ```

6. To stop the service:
   ```bash
   sudo systemctl stop tdi-employee-https
   ```

7. To restart the service:
   ```bash
   sudo systemctl restart tdi-employee-https
   ```

## Accessing the Application

Once running, the application will be accessible at:
- http://YOUR_SERVER_IP:3400
- http://localhost:3400 (from the server itself)

For HTTPS deployment:
- https://YOUR_SERVER_IP:3443
- https://localhost:3443 (from the server itself)

Use the admin credentials created earlier to log in to the application.

## Monitoring and Logs

When running as a systemd service, you can monitor the application logs with:

```bash
sudo journalctl -u tdi-main-app-employee -f
```

To view recent logs:
```bash
sudo journalctl -u tdi-main-app-employee --since "1 hour ago"
```

When running as a systemd service with HTTPS, you can monitor the application logs with:

```bash
sudo journalctl -u tdi-employee-https -f
```

To view recent logs:
```bash
sudo journalctl -u tdi-employee-https --since "1 hour ago"
```

## Troubleshooting

If you're unable to access the application from another machine:

1. Check that the application is running:
   ```bash
   netstat -tulpn | grep 3400
   ```

2. For HTTPS, check that the application is running:
   ```bash
   netstat -tulpn | grep 3443
   ```

3. Check firewall settings:
   ```bash
   sudo ufw status
   # or
   sudo iptables -L
   ```

4. Ensure port 3400 is allowed through the firewall:
   ```bash
   sudo ufw allow 3400
   ```

5. For HTTPS, ensure port 3443 is allowed through the firewall:
   ```bash
   sudo ufw allow 3443
   ```

6. Verify database connectivity:
   ```bash
   # Test database connection using the provided script
   node test-db-connection.js
   ```

7. Check application logs:
   ```bash
   sudo journalctl -u tdi-main-app-employee -f
   ```

8. For HTTPS, check application logs:
   ```bash
   sudo journalctl -u tdi-employee-https -f
   ```

## Security Considerations

1. Change the default JWT secret in the `.env` file to a strong, random secret
2. Ensure the database credentials are secure and have minimal required privileges
3. Change the default admin user password immediately after first login
4. Consider using HTTPS in production by setting `HTTPS=true` and providing certificates
5. For production use, replace the self-signed certificates with certificates from a trusted Certificate Authority (CA)
6. Regularly update dependencies to patch security vulnerabilities

## Backup and Recovery

Regularly backup:
1. The PostgreSQL database
2. Any uploaded files or data stored locally
3. The `.env` file (store securely, not in version control)

## Updating the Application

To update the application:

1. Stop the service (if using systemd):
   ```bash
   sudo systemctl stop tdi-main-app-employee
   ```
   Or for HTTPS:
   ```bash
   sudo systemctl stop tdi-employee-https
   ```

2. Pull the latest code from your repository:
   ```bash
   cd /root/app/tdi-main-app-employee
   git pull
   ```

3. Install any new dependencies:
   ```bash
   npm install
   ```

4. Run database migrations (if any new migrations were added):
   ```bash
   node run-migrations.js
   ```

5. Rebuild the application:
   ```bash
   npm run build
   ```

6. Start the service:
   ```bash
   sudo systemctl start tdi-main-app-employee
   ```
   Or for HTTPS:
   ```bash
   sudo systemctl start tdi-employee-https
   ```

Or if running manually:
```bash
# Kill the current process
pkill -f "node server.js"

# Install dependencies, run migrations, rebuild and start
npm install
node run-migrations.js
npm run build
PORT=3400 NODE_ENV=production node server.js
```

Or for HTTPS:
```bash
# Kill the current process
pkill -f "node server.js"

# Install dependencies, run migrations, rebuild and start with HTTPS
npm install
node run-migrations.js
npm run build
HTTPS=true PORT=3443 NODE_ENV=production node server.js
```