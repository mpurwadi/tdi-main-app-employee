-- Create remote check-in records table
CREATE TABLE IF NOT EXISTS remote_checkin_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    work_location VARCHAR(255),
    checkin_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_remote_checkin_records_user_id ON remote_checkin_records(user_id);
CREATE INDEX IF NOT EXISTS idx_remote_checkin_records_checkin_time ON remote_checkin_records(checkin_time);