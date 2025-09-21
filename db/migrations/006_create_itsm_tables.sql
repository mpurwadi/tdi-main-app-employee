-- Create ITSM tables for the new modules

-- Add division column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS division VARCHAR(100);

-- Create service_catalog table
CREATE TABLE IF NOT EXISTS service_catalog (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    division VARCHAR(100) NOT NULL,
    cost_type VARCHAR(50), -- 'fixed', 'hourly', 'per_unit'
    cost_amount DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'active', 'inactive'
    created_by INTEGER REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP
);

-- Create service_requests table
CREATE TABLE IF NOT EXISTS service_requests (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES service_catalog(id),
    requester_id INTEGER REFERENCES users(id),
    approver_id INTEGER REFERENCES users(id),
    provider_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    status VARCHAR(50) DEFAULT 'submitted', -- 'submitted', 'approved', 'in_progress', 'completed', 'rejected', 'cancelled'
    cost DECIMAL(10, 2),
    approved_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create service_request_comments table for communication
CREATE TABLE IF NOT EXISTS service_request_comments (
    id SERIAL PRIMARY KEY,
    service_request_id INTEGER REFERENCES service_requests(id),
    user_id INTEGER REFERENCES users(id),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create internal_billing table
CREATE TABLE IF NOT EXISTS internal_billing (
    id SERIAL PRIMARY KEY,
    service_request_id INTEGER REFERENCES service_requests(id),
    requester_division VARCHAR(100),
    provider_division VARCHAR(100),
    amount DECIMAL(10, 2) NOT NULL,
    billing_period DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'disputed'
    payment_confirmed_by INTEGER REFERENCES users(id),
    payment_confirmed_at TIMESTAMP,
    payment_proof_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create change_requests table
CREATE TABLE IF NOT EXISTS change_requests (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requester_id INTEGER REFERENCES users(id),
    change_manager_id INTEGER REFERENCES users(id),
    implementer_id INTEGER REFERENCES users(id),
    reason TEXT,
    impact TEXT,
    rollback_plan TEXT,
    schedule_date DATE,
    status VARCHAR(50) DEFAULT 'submitted', -- 'submitted', 'under_review', 'approved', 'scheduled', 'in_progress', 'completed', 'failed', 'cancelled'
    priority VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    risk_level VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- Create change_request_comments table for CAB discussions
CREATE TABLE IF NOT EXISTS change_request_comments (
    id SERIAL PRIMARY KEY,
    change_request_id INTEGER REFERENCES change_requests(id),
    user_id INTEGER REFERENCES users(id),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_catalog_status ON service_catalog(status);
CREATE INDEX IF NOT EXISTS idx_service_catalog_division ON service_catalog(division);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_requester ON service_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_service ON service_requests(service_id);
CREATE INDEX IF NOT EXISTS idx_internal_billing_status ON internal_billing(status);
CREATE INDEX IF NOT EXISTS idx_internal_billing_period ON internal_billing(billing_period);
CREATE INDEX IF NOT EXISTS idx_change_requests_status ON change_requests(status);
CREATE INDEX IF NOT EXISTS idx_change_requests_priority ON change_requests(priority);

-- Add comments to tables
COMMENT ON TABLE service_catalog IS 'Table to store ITSM service catalog entries';
COMMENT ON TABLE service_requests IS 'Table to store ITSM service requests';
COMMENT ON TABLE service_request_comments IS 'Table to store comments on service requests';
COMMENT ON TABLE internal_billing IS 'Table to store internal billing records between divisions';
COMMENT ON TABLE change_requests IS 'Table to store ITSM change management requests';
COMMENT ON TABLE change_request_comments IS 'Table to store comments on change requests';