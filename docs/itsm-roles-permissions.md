# ITSM Roles and Permissions Design

## Current Roles in the System
- **user**: Regular users who can submit service requests
- **admin**: Administrators who can manage users and approve services
- **superadmin**: Super administrators with full system access

## New Roles Required for ITSM

### 1. Service Catalog Roles
- **Service Catalog Manager**: 
  - Role: `service_catalog_manager`
  - Permissions:
    - Register new services in the catalog
    - Approve/Reject service registrations
    - Edit service details
    - Deactivate services
    - View service analytics

- **Service Provider**: 
  - Role: `service_provider`
  - Permissions:
    - Register services for their division
    - Update service information
    - View service usage statistics

### 2. Service Request Roles
- **Service Requester**: 
  - Role: `service_requester` (extends `user`)
  - Permissions:
    - Submit service requests
    - Track request status
    - Communicate with service providers
    - Approve completed requests

- **Approver**: 
  - Role: `approver`
  - Permissions:
    - Approve service requests with costs above threshold
    - View pending approvals
    - Reject requests with justification

- **Service Provider** (same as above for requests):
  - Role: `service_provider`
  - Permissions:
    - View assigned service requests
    - Update request status
    - Communicate with requesters
    - Mark requests as complete

### 3. Internal Billing & Reporting Roles
- **Billing Coordinator**: 
  - Role: `billing_coordinator`
  - Permissions:
    - View invoices for their division
    - Confirm payments
    - Upload payment proofs
    - Dispute billing items

- **Admin/Eksekutif**: 
  - Role: `billing_admin` (extends `admin`)
  - Permissions:
    - Access full billing dashboard
    - Generate reports
    - Resolve billing disputes
    - View cross-division analytics

### 4. Change Management Roles
- **Change Requester**: 
  - Role: `change_requester` (typically DevOps/Product team)
  - Permissions:
    - Submit change requests
    - Update change request details
    - Track change status

- **Change Manager**: 
  - Role: `change_manager`
  - Permissions:
    - Review change requests
    - Schedule changes
    - Coordinate CAB meetings
    - Update change status

- **Change Advisory Board (CAB)**: 
  - Role: `cab_member`
  - Permissions:
    - Review and approve/reject change requests
    - View change calendar
    - Participate in CAB discussions

- **Implementer**: 
  - Role: `implementer`
  - Permissions:
    - View assigned changes
    - Update implementation status
    - Report implementation results

## Role Hierarchy and Inheritance
```
superadmin
├── billing_admin
│   └── admin
│       ├── service_catalog_manager
│       ├── change_manager
│       ├── cab_member
│       └── user
│           ├── service_requester
│           ├── service_provider
│           ├── approver
│           ├── billing_coordinator
│           ├── change_requester
│           └── implementer
```

## Division-based Access Control
Each role (except superadmin) should be associated with a division:
- DevOps
- Big Data
- Produk
- Operasional
- Finance (for billing roles)
- Executive (for billing_admin)

Users can have multiple roles but only within their assigned division unless they are superadmin.