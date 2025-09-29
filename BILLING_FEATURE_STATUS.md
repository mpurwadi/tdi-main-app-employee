# Internal Billing Feature Documentation

## Overview
The Internal Billing feature is part of the ITSM (Internal Service Hub) module, designed to manage and track internal billing between different divisions within the organization.

## Key Features

### 1. Invoice Management
- Create new billing records between divisions
- Track billing status (pending, paid, overdue, disputed)
- Manage billing periods and due dates
- Integration with service catalog items

### 2. Payment Processing
- Record payments for pending invoices
- Confirm payment completion
- Track payment methods and reference numbers
- Handle partial payments

### 3. Reporting
- Financial reporting and analytics
- Billing summary by division
- Payment tracking reports
- Invoice history

## Components

### Frontend Components
- `CreateBillingRecord.tsx` - Component for creating new billing records
- `RecordPayment.tsx` - Component for recording payments
- `billing/page.tsx` - Main billing dashboard page

### Backend API Routes
- `GET /api/itsm/billing` - Retrieve billing records with filters
- `POST /api/itsm/billing` - Create new billing records
- `GET /api/itsm/billing/payments` - Retrieve payment records
- `POST /api/itsm/billing/payments` - Create new payment records
- `POST /api/itsm/billing/[id]/confirm-payment` - Confirm payment for billing record

### Service Layer
- `billingService` in `enhancedItsmService.ts` - Business logic for billing operations
- Database integration with `billing_records` and `payment_records` tables

## Roles and Permissions
- **Billing Coordinator**: Manage invoices and payments for their division
- **Billing Admin**: Access full billing dashboard and analytics
- **Admin/Superadmin**: Full access to all billing features

## Database Schema
- `billing_records` table - Stores internal billing records
- `payment_records` table - Tracks payment transactions
- Integration with `service_catalog` for billing items

## Status
The internal billing feature is **fully implemented** and ready for use, with complete CRUD operations, role-based access control, and reporting capabilities.