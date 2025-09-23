-- Enhanced ITSM schema with all required features

-- Add additional columns to users table for ITSM roles
ALTER TABLE users ADD COLUMN IF NOT EXISTS roles TEXT[]; -- Array of roles for the user
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_service_catalog_manager BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_service_provider BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_service_requester BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approver BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_billing_coordinator BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_change_requester BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_change_manager BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_cab_member BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_implementer BOOLEAN DEFAULT FALSE;

-- Create service_categories table for dynamic category management
CREATE TABLE IF NOT EXISTS service_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhance service_catalog table with additional fields
ALTER TABLE service_catalog 
ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES service_categories(id),
ADD COLUMN IF NOT EXISTS sla_days INTEGER,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS document_url VARCHAR(500);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_catalog_category ON service_catalog(category_id);
CREATE INDEX IF NOT EXISTS idx_service_catalog_cost ON service_catalog(cost_amount);
CREATE INDEX IF NOT EXISTS idx_service_catalog_tags ON service_catalog USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_service_catalog_document ON service_catalog(document_url);

-- Enhance service_requests table with additional fields for workflow
ALTER TABLE service_requests 
ADD COLUMN IF NOT EXISTS requested_for INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS sla_breached BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create indexes for service_requests
CREATE INDEX IF NOT EXISTS idx_service_requests_requested_for ON service_requests(requested_for);
CREATE INDEX IF NOT EXISTS idx_service_requests_due_date ON service_requests(due_date);
CREATE INDEX IF NOT EXISTS idx_service_requests_sla_breached ON service_requests(sla_breached);

-- Create service_request_approvals table for multi-level approval workflow
CREATE TABLE IF NOT EXISTS service_request_approvals (
    id SERIAL PRIMARY KEY,
    service_request_id INTEGER REFERENCES service_requests(id) ON DELETE CASCADE,
    approver_id INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    comments TEXT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create service_request_activities table for audit trail
CREATE TABLE IF NOT EXISTS service_request_activities (
    id SERIAL PRIMARY KEY,
    service_request_id INTEGER REFERENCES service_requests(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- 'created', 'updated', 'approved', 'rejected', 'completed', etc.
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhance internal_billing table with additional fields
ALTER TABLE internal_billing 
ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create indexes for internal_billing
CREATE INDEX IF NOT EXISTS idx_internal_billing_invoice_number ON internal_billing(invoice_number);
CREATE INDEX IF NOT EXISTS idx_internal_billing_due_date ON internal_billing(due_date);

-- Create billing_invoice_items table for detailed invoice items
CREATE TABLE IF NOT EXISTS billing_invoice_items (
    id SERIAL PRIMARY KEY,
    billing_id INTEGER REFERENCES internal_billing(id) ON DELETE CASCADE,
    service_request_id INTEGER REFERENCES service_requests(id),
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) DEFAULT 1.00,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhance change_requests table with additional fields
ALTER TABLE change_requests 
ADD COLUMN IF NOT EXISTS cab_meeting_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS implementation_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS rollback_deadline TIMESTAMP,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create indexes for change_requests
CREATE INDEX IF NOT EXISTS idx_change_requests_cab_meeting ON change_requests(cab_meeting_date);
CREATE INDEX IF NOT EXISTS idx_change_requests_implementation ON change_requests(implementation_date);

-- Create change_request_approvals table for CAB approval workflow
CREATE TABLE IF NOT EXISTS change_request_approvals (
    id SERIAL PRIMARY KEY,
    change_request_id INTEGER REFERENCES change_requests(id) ON DELETE CASCADE,
    cab_member_id INTEGER REFERENCES users(id),
    vote VARCHAR(50), -- 'approved', 'rejected', 'abstained'
    comments TEXT,
    voted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create change_request_activities table for audit trail
CREATE TABLE IF NOT EXISTS change_request_activities (
    id SERIAL PRIMARY KEY,
    change_request_id INTEGER REFERENCES change_requests(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- 'created', 'updated', 'approved', 'rejected', 'completed', etc.
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create service_catalog_activities table for audit trail
CREATE TABLE IF NOT EXISTS service_catalog_activities (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES service_catalog(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- 'created', 'updated', 'approved', 'rejected', etc.
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create views for reporting
CREATE OR REPLACE VIEW service_request_summary AS
SELECT 
    sr.id,
    sr.title,
    sr.status,
    sr.priority,
    sc.name as service_name,
    u1.full_name as requester_name,
    u2.full_name as approver_name,
    u3.full_name as provider_name,
    sr.created_at,
    sr.completed_at,
    sr.cost
FROM service_requests sr
LEFT JOIN service_catalog sc ON sr.service_id = sc.id
LEFT JOIN users u1 ON sr.requester_id = u1.id
LEFT JOIN users u2 ON sr.approver_id = u2.id
LEFT JOIN users u3 ON sr.provider_id = u3.id;

CREATE OR REPLACE VIEW billing_summary AS
SELECT 
    ib.id,
    ib.invoice_number,
    ib.requester_division,
    ib.provider_division,
    ib.amount,
    ib.status,
    ib.billing_period,
    ib.created_at,
    ib.due_date
FROM internal_billing ib;

CREATE OR REPLACE VIEW change_request_summary AS
SELECT 
    cr.id,
    cr.title,
    cr.status,
    cr.priority,
    cr.risk_level,
    u1.full_name as requester_name,
    u2.full_name as change_manager_name,
    u3.full_name as implementer_name,
    cr.created_at,
    cr.schedule_date,
    cr.implementation_date
FROM change_requests cr
LEFT JOIN users u1 ON cr.requester_id = u1.id
LEFT JOIN users u2 ON cr.change_manager_id = u2.id
LEFT JOIN users u3 ON cr.implementer_id = u3.id;

-- Add comments to tables
COMMENT ON TABLE service_categories IS 'Table to store service categories for the service catalog';
COMMENT ON TABLE service_request_approvals IS 'Table to store service request approvals in multi-level workflow';
COMMENT ON TABLE service_request_activities IS 'Table to store service request activity logs';
COMMENT ON TABLE billing_invoice_items IS 'Table to store detailed items for billing invoices';
COMMENT ON TABLE change_request_approvals IS 'Table to store change request approvals by CAB members';
COMMENT ON TABLE change_request_activities IS 'Table to store change request activity logs';
COMMENT ON TABLE service_catalog_activities IS 'Table to store service catalog activity logs';