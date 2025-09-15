-- Add clock_in_time and clock_out_time columns to attendance_records table
ALTER TABLE attendance_records 
ADD COLUMN IF NOT EXISTS clock_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS clock_out_time TIMESTAMP NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_records_clock_in_time ON attendance_records(clock_in_time);
CREATE INDEX IF NOT EXISTS idx_attendance_records_clock_out_time ON attendance_records(clock_out_time);