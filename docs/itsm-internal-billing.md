# ITSM Internal Billing System

## Overview

The ITSM Internal Billing system is designed to manage billing and payments between different divisions within an organization. This system allows divisions to create billing records for services provided, track payments, and generate reports.

## Features

1. **Service Catalog Management**
   - Create and manage services with pricing
   - Categorize services for easy filtering
   - Define pricing per unit (hour, request, month, etc.)

2. **Billing Record Management**
   - Create billing records for services provided between divisions
   - Track billing status (pending, paid, overdue, disputed)
   - Manage billing periods and due dates

3. **Payment Processing**
   - Record payments against billing records
   - Track payment methods and references
   - Update billing record status when payments are made

4. **Reporting**
   - Generate billing summary reports
   - View billing by division
   - Analyze monthly billing trends

## Database Schema

### service_catalog
Stores information about services that can be billed:
- `id`: Primary key
- `name`: Service name
- `description`: Detailed description
- `category`: Service category (e.g., IT Operations, Development)
- `unit_price`: Price per unit in Rupiah
- `unit_type`: Unit of measurement (hour, request, month)
- `created_at`, `updated_at`: Timestamps

### billing_records
Stores billing records between divisions:
- `id`: Primary key
- `invoice_number`: Unique invoice number
- `requester_division`: Division requesting the service
- `provider_division`: Division providing the service
- `service_catalog_id`: Foreign key to service_catalog
- `quantity`: Quantity of service units
- `unit_price`: Price per unit in Rupiah
- `total_amount`: Total amount in Rupiah
- `billing_period_start`, `billing_period_end`: Billing period dates
- `due_date`: Payment due date
- `status`: Billing status (pending, paid, overdue, disputed, cancelled)
- `description`: Additional details
- `created_at`, `updated_at`: Timestamps

### payment_records
Stores payment records for billing:
- `id`: Primary key
- `billing_record_id`: Foreign key to billing_records
- `payment_date`: Date of payment
- `amount`: Payment amount in Rupiah
- `payment_method`: Payment method (transfer, cash, etc.)
- `reference_number`: Payment reference number
- `status`: Payment status (pending, completed, failed, refunded)
- `remarks`: Additional notes
- `created_at`, `updated_at`: Timestamps

### billing_reports
Stores generated billing reports:
- `id`: Primary key
- `report_name`: Name of the report
- `report_period_start`, `report_period_end`: Report period dates
- `generated_by`: User ID who generated the report
- `file_path`: Path to generated report file
- `created_at`: Timestamp

## API Endpoints

### Billing Records
- `GET /api/itsm/billing` - Get billing records with filters
- `POST /api/itsm/billing` - Create a new billing record
- `GET /api/itsm/billing/[id]` - Get a specific billing record
- `PUT /api/itsm/billing/[id]` - Update a billing record
- `DELETE /api/itsm/billing/[id]` - Delete a billing record

### Payments
- `GET /api/itsm/billing/payments` - Get payment records with filters
- `POST /api/itsm/billing/payments` - Record a new payment

### Service Catalog
- `GET /api/itsm/billing/services` - Get service catalog items
- `POST /api/itsm/billing/services` - Create a new service
- `GET /api/itsm/billing/services/[id]` - Get a specific service
- `PUT /api/itsm/billing/services/[id]` - Update a service
- `DELETE /api/itsm/billing/services/[id]` - Delete a service

### Reports
- `GET /api/itsm/billing/reports` - Get billing reports and statistics
- `POST /api/itsm/billing/reports` - Generate a detailed billing report

## User Roles and Permissions

1. **Billing Coordinator** (`billing_coordinator`)
   - View billing records and payments
   - Create new billing records
   - Record payments
   - Generate reports

2. **Billing Admin** (`billing_admin`)
   - All Billing Coordinator permissions
   - Manage service catalog
   - Update billing record status

3. **Service Catalog Manager** (`service_catalog_manager`)
   - Manage service catalog items

4. **Admin** (`admin`)
   - All permissions
   - Delete billing records and services

5. **Superadmin** (`superadmin`)
   - All permissions

## Workflow

1. **Service Definition**
   - Service Catalog Manager creates services in the catalog
   - Services include name, description, category, and pricing

2. **Billing Creation**
   - Billing Coordinator creates billing records for services provided
   - Specify requester and provider divisions
   - Set billing period and due date
   - Record is created with "pending" status

3. **Payment Processing**
   - When payment is received, Billing Coordinator records payment
   - System updates billing record status to "paid"
   - Payment details are stored for audit trail

4. **Reporting**
   - Users can view billing summaries
   - Generate detailed reports for specific periods
   - Analyze billing trends by division

## Currency

All monetary values are stored and displayed in Indonesian Rupiah (Rp).

## Setup

1. Run the database initialization script:
   ```bash
   ./scripts/init-itsm-billing-db.sh
   ```

2. The system will be available through the ITSM Billing page in the application.

## Future Enhancements

1. **Automated Billing**: Automatically generate billing records based on service usage
2. **Notifications**: Email notifications for overdue payments
3. **Invoice Generation**: PDF invoice generation and download
4. **Multi-currency Support**: Support for multiple currencies with exchange rates
5. **Budget Tracking**: Track division budgets and spending limits
6. **Dispute Management**: Formal process for handling billing disputes