# ITSM (Internal Service Hub) Module

This module implements a comprehensive IT Service Management system with the following features:

## Features

### 1. Service Catalog
- Browse and manage internal services offered by different divisions
- Service registration with cost tracking
- Approval workflow for new services
- Categorization and search capabilities

### 2. Service Requests
- Submit, track, and manage service requests across divisions
- Approval workflow for requests with costs above threshold
- Communication between requesters and providers
- Status tracking from submission to completion

### 3. Internal Billing & Reporting
- Automated internal billing between divisions
- Invoice generation and payment tracking
- Financial reporting and analytics
- Dispute resolution workflow

### 4. Change Management
- Submit and track infrastructure/application changes
- Approval workflow with Change Advisory Board (CAB)
- Change calendar for scheduling
- Risk assessment and rollback planning

## Roles and Permissions

The ITSM module implements role-based access control with the following roles:

- **Service Catalog Manager**: Manage service registrations and approvals
- **Service Provider**: Register services and fulfill requests
- **Service Requester**: Submit and track service requests
- **Approver**: Approve service requests with costs above threshold
- **Billing Coordinator**: Manage invoices and payments for their division
- **Billing Admin**: Access full billing dashboard and analytics
- **Change Requester**: Submit change requests
- **Change Manager**: Review and schedule changes
- **CAB Member**: Approve/reject change requests
- **Implementer**: Execute approved changes

## Division-based Access

All roles are associated with divisions:
- DevOps
- Big Data
- Produk
- Operasional
- Finance
- Executive

Users can have multiple roles but only within their assigned division unless they are superadmin.

## Database Schema

The ITSM module uses the following tables:

1. `service_catalog` - Stores service definitions
2. `service_requests` - Tracks service requests
3. `service_request_comments` - Communication on service requests
4. `internal_billing` - Internal billing records
5. `change_requests` - Change management requests
6. `change_request_comments` - Discussion on change requests

## API Endpoints

The module provides the following API endpoints:

- `/api/itsm/service-catalog` - Service catalog management
- `/api/itsm/service-requests` - Service request management
- `/api/itsm/billing` - Billing and invoice management
- `/api/itsm/change-management` - Change request management

## Integration

The ITSM module integrates with the existing application through:
- Shared authentication system
- Common user management
- Unified dashboard access
- Consistent UI/UX design

## Access

The ITSM module can be accessed through:
1. Main navigation link from the dashboard
2. Direct URL: `/itsm`
3. Quick access from the landing page

The module has its own layout and navigation system for easy access to all ITSM features.