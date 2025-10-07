-- Add late_checkin_reason column to attendance_records table
ALTER TABLE attendance_records 
ADD COLUMN IF NOT EXISTS late_checkin_reason TEXT NULL;