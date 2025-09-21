# TDI Main App Service - Production Deployment

This application can be deployed in production using several methods. We have two documentation files that provide detailed instructions:

## Documentation Files

1. **[README.PRODUCTION.md](README.PRODUCTION.md)** - Original production deployment guide
2. **[PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)** - Enhanced production deployment guide with additional details

## Quick Start

For a quick deployment, follow these steps:

1. Ensure Node.js and PostgreSQL are installed
2. Configure your environment variables in `.env`
3. Run database migrations: `node run-migrations.js`
4. Create an admin user: `node create-admin.js`
5. Build the application: `npm run build`
6. Start the application: `PORT=3400 NODE_ENV=production node server.js`

## Recommended Production Setup

For production environments, we recommend using the systemd service approach:

1. Configure your environment in `.env`
2. Run database migrations: `node run-migrations.js`
3. Create an admin user: `node create-admin.js`
4. Build the application: `npm run build`
5. Install the systemd service:
   ```bash
   sudo cp tdi-main-app-employee.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable tdi-main-app-employee
   sudo systemctl start tdi-main-app-employee
   ```

For detailed instructions, please refer to [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md).