-- Initialize sample data for ITSM Internal Billing system

-- Insert sample service catalog items
INSERT INTO service_catalog (name, description, category, division, unit_price, unit_type) VALUES
('Server Maintenance', 'Monthly server maintenance and monitoring services', 'IT Operations', 'IT', 5000000, 'month'),
('Database Administration', 'Database administration and optimization services', 'IT Operations', 'IT', 7500000, 'month'),
('Network Support', 'Network infrastructure support and troubleshooting', 'IT Operations', 'IT', 4000000, 'month'),
('Software Development', 'Custom software development services', 'Development', 'IT', 150000, 'hour'),
('System Integration', 'System integration and API development', 'Development', 'IT', 200000, 'hour'),
('IT Consulting', 'IT strategy and consulting services', 'Consulting', 'IT', 300000, 'hour'),
('Cloud Services', 'Cloud infrastructure and management', 'Cloud', 'IT', 10000000, 'month'),
('Security Audit', 'Comprehensive security audit and assessment', 'Security', 'IT', 15000000, 'project'),
('Training Services', 'Technical training and workshops', 'Training', 'HR', 500000, 'session'),
('Helpdesk Support', 'Level 1 and Level 2 technical support', 'Support', 'IT', 3000000, 'month')
ON CONFLICT DO NOTHING;

-- Insert sample billing records
INSERT INTO billing_records (
    invoice_number, requester_division, provider_division, service_catalog_id,
    quantity, unit_price, total_amount, billing_period_start, billing_period_end,
    due_date, status, description
) VALUES
('INV-2025-001', 'DevOps', 'IT', 1, 1, 5000000, 5000000, '2025-09-01', '2025-09-30', '2025-10-15', 'paid', 'Monthly server maintenance'),
('INV-2025-002', 'Big Data', 'IT', 2, 1, 7500000, 7500000, '2025-09-01', '2025-09-30', '2025-10-15', 'paid', 'Database administration services'),
('INV-2025-003', 'Produk', 'IT', 4, 40, 150000, 6000000, '2025-09-01', '2025-09-30', '2025-10-15', 'pending', 'Custom software development'),
('INV-2025-004', 'Operasional', 'IT', 6, 20, 300000, 6000000, '2025-09-01', '2025-09-30', '2025-10-15', 'overdue', 'IT consulting services'),
('INV-2025-005', 'DevOps', 'IT', 7, 1, 10000000, 10000000, '2025-09-01', '2025-09-30', '2025-10-15', 'pending', 'Cloud infrastructure services')
ON CONFLICT DO NOTHING;

-- Insert sample payment records
INSERT INTO payment_records (
    billing_record_id, amount, payment_method, reference_number, status, remarks
) VALUES
(1, 5000000, 'transfer', 'TRX001', 'completed', 'Payment for server maintenance'),
(2, 7500000, 'transfer', 'TRX002', 'completed', 'Payment for database services')
ON CONFLICT DO NOTHING;