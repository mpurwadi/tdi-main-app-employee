-- Logbook table migration
-- This migration adds the logbook table to track daily activity logs

CREATE TABLE logbook_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    activity TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_logbook_user_id ON logbook_entries(user_id);
CREATE INDEX idx_logbook_entry_date ON logbook_entries(entry_date);
CREATE INDEX idx_logbook_status ON logbook_entries(status);

-- Add a comment to the table
COMMENT ON TABLE logbook_entries IS 'Table to store daily logbook entries for users';