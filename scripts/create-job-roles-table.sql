-- Create job_roles table
CREATE TABLE IF NOT EXISTS job_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default job roles
INSERT INTO job_roles (name, description) VALUES 
    ('Developer', 'Software development role'),
    ('Data Engineering', 'Data engineering and analytics role'),
    ('UI/UX Designer', 'User interface and experience design role'),
    ('QA Engineer', 'Quality assurance and testing role'),
    ('System Administrator', 'System administration and maintenance role'),
    ('Product Manager', 'Product management and strategy role'),
    ('Business Analyst', 'Business analysis and requirements role'),
    ('DevOps Engineer', 'Development operations and deployment role'),
    ('Security Specialist', 'Information security and compliance role'),
    ('Technical Support', 'Technical support and troubleshooting role')
ON CONFLICT (name) DO NOTHING;

-- Add job_role_id column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS job_role_id INTEGER REFERENCES job_roles(id) ON DELETE SET NULL;