-- Create attendance records table
CREATE TABLE IF NOT EXISTS attendance_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    qr_data VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    clock_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    clock_out_time TIMESTAMP NULL,
    manual_checkin_reason TEXT NULL,
    manual_checkout_reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_records_user_id ON attendance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_created_at ON attendance_records(created_at);
CREATE INDEX IF NOT EXISTS idx_attendance_records_clock_in_time ON attendance_records(clock_in_time);
CREATE INDEX IF NOT EXISTS idx_attendance_records_clock_out_time ON attendance_records(clock_out_time);