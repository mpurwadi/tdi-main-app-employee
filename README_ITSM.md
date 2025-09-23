# Internal Service Hub (ITSM Module)

## Overview
The Internal Service Hub is a comprehensive IT Service Management (ITSM) platform that enables efficient collaboration between different divisions within the organization. This platform streamlines service requests, manages internal billing, and facilitates change management processes.

## Features

### 1. Service Catalog
- **Dynamic Service Management**: Divisions can register and manage their services
- **Category Management**: Organize services into categories for easy browsing
- **Cost Management**: Define pricing models (fixed, hourly, per unit)
- **Approval Workflow**: Admin approval for new services before publishing
- **Search & Filter**: Find services by category, division, or keyword

### 2. Service Requests
- **Request Submission**: Users can request services from other divisions
- **Multi-level Approval**: Automatic approval workflow based on cost thresholds
- **Status Tracking**: Real-time tracking of request progress
- **SLA Management**: Service Level Agreements with breach notifications
- **Communication**: Comment system for request discussions

### 3. Internal Billing & Reporting
- **Automatic Billing**: Generate billing records when requests are completed
- **Invoice Management**: Create and manage invoices between divisions
- **Payment Processing**: Track payment status and confirmations
- **Financial Reporting**: Generate reports on divisional spending and revenue
- **Dispute Resolution**: Process billing disputes with documentation

### 4. Change Management
- **Change Request Submission**: Request infrastructure or application changes
- **CAB Workflow**: Change Advisory Board approval process
- **Risk Assessment**: Evaluate and categorize change risks
- **Implementation Scheduling**: Plan and schedule change implementations
- **Rollback Planning**: Document rollback procedures for each change
- **Calendar View**: Visualize scheduled changes

### 5. User Management
- **Role-Based Access Control**: Fine-grained permissions for different user roles
- **Division Assignment**: Organize users by division for billing purposes
- **Role Assignment**: Assign multiple roles to users as needed
- **User Profile Management**: Maintain user information and preferences

## Technology Stack
- **Frontend**: React/Next.js with TypeScript
- **Backend**: Node.js with Next.js API routes
- **Database**: PostgreSQL with custom schema
- **Authentication**: JWT-based authentication
- **Styling**: Tailwind CSS with custom themes

## Architecture

### Database Schema
The system uses a normalized PostgreSQL schema with the following key tables:
- `service_categories`: Service category definitions
- `service_catalog`: Available services with pricing and metadata
- `service_requests`: Service requests with approval workflow
- `service_request_approvals`: Multi-level approval tracking
- `service_request_activities`: Audit trail for service requests
- `internal_billing`: Billing records between divisions
- `billing_invoice_items`: Detailed invoice line items
- `change_requests`: Change management requests
- `change_request_approvals`: CAB approval tracking
- `change_request_activities`: Audit trail for changes
- `service_catalog_activities`: Audit trail for service catalog

### API Structure
All API endpoints are organized under `/api/itsm/` with RESTful conventions:
- `/api/itsm/service-catalog` - Service catalog management
- `/api/itsm/service-categories` - Service category management
- `/api/itsm/service-requests` - Service request management
- `/api/itsm/billing` - Internal billing management
- `/api/itsm/change-requests` - Change management
- `/api/itsm/users` - User management

### Security
- JWT-based authentication with role validation
- Role-based access control for all endpoints
- Input validation and sanitization
- SQL injection prevention through parameterized queries
- CORS configuration for secure cross-origin requests

## Roles and Permissions

| Role | Permissions |
|------|-------------|
| `service_catalog_manager` | Manage service catalog, approve/reject services |
| `service_provider` | Fulfill service requests, create services |
| `service_requester` | Submit service requests |
| `approver` | Approve service requests based on cost |
| `billing_coordinator` | Manage billing, confirm payments |
| `change_requester` | Submit change requests |
| `change_manager` | Manage change approval workflow |
| `cab_member` | Participate in CAB approvals |
| `implementer` | Implement approved changes |
| `admin` | Full system access |
| `superadmin` | Full system access with user management |

## Installation and Setup

1. **Prerequisites**:
   - Node.js 18+
   - PostgreSQL 13+
   - npm or yarn

2. **Database Setup**:
   - Create a PostgreSQL database
   - Run the migration scripts in `db/migrations/` in order
   - Configure database connection in `.env` file

3. **Environment Variables**:
   ```env
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   DB_PORT=5432
   JWT_SECRET=your_jwt_secret
   ```

4. **Installation**:
   ```bash
   npm install
   npm run dev
   ```

## API Documentation
Detailed API documentation is available in `docs/itsm-api-docs.md`

## Testing
The application includes:
- Unit tests for service layer functions
- Integration tests for API endpoints
- End-to-end tests for critical user flows

Run tests with:
```bash
npm test
```

## Deployment
The application can be deployed using:
- Docker containers
- Traditional Node.js deployment
- Cloud platforms (AWS, Azure, Google Cloud)

For production deployment:
1. Set `NODE_ENV=production`
2. Use a production database
3. Configure HTTPS
4. Set up proper logging and monitoring

## Maintenance
- Regular database backups
- Monitoring of API performance
- Review of audit logs
- Periodic security audits
- Update dependencies regularly

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## Support
For issues and feature requests, please use the GitHub issue tracker.