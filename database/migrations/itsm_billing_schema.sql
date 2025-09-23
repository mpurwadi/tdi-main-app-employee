-- Create tables for ITSM Internal Billing system

-- Service Catalog table (already exists in many ITSM systems)
CREATE TABLE IF NOT EXISTS service_catalog (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit_price DECIMAL(15,2) NOT NULL, -- Price in Rupiah
    unit_type VARCHAR(50) NOT NULL, -- e.g., 'hour', 'request', 'month'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Billing records table
CREATE TABLE IF NOT EXISTS billing_records (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    requester_division VARCHAR(100) NOT NULL,
    provider_division VARCHAR(100) NOT NULL,
    service_catalog_id INTEGER REFERENCES service_catalog(id),
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL, -- Price in Rupiah
    total_amount DECIMAL(15,2) NOT NULL, -- Total in Rupiah
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'disputed', 'cancelled')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment records table
CREATE TABLE IF NOT EXISTS payment_records (
    id SERIAL PRIMARY KEY,
    billing_record_id INTEGER REFERENCES billing_records(id),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(15,2) NOT NULL, -- Amount in Rupiah
    payment_method VARCHAR(50), -- e.g., 'transfer', 'cash', 'other'
    reference_number VARCHAR(100), -- e.g., transfer reference number
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Billing reports table
CREATE TABLE IF NOT EXISTS billing_reports (
    id SERIAL PRIMARY KEY,
    report_name VARCHAR(255) NOT NULL,
    report_period_start DATE NOT NULL,
    report_period_end DATE NOT NULL,
    generated_by INTEGER, -- User ID who generated the report
    file_path VARCHAR(500), -- Path to the generated report file
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_billing_records_invoice ON billing_records(invoice_number);
CREATE INDEX IF NOT EXISTS idx_billing_records_status ON billing_records(status);
CREATE INDEX IF NOT EXISTS idx_billing_records_requester ON billing_records(requester_division);
CREATE INDEX IF NOT EXISTS idx_billing_records_provider ON billing_records(provider_division);
CREATE INDEX IF NOT EXISTS idx_billing_records_period ON billing_records(billing_period_start, billing_period_end);
CREATE INDEX IF NOT EXISTS idx_payment_records_billing ON payment_records(billing_record_id);