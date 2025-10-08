-- Add late_checkin_reason column to attendance_records table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'attendance_records' 
                   AND column_name = 'late_checkin_reason') THEN
        ALTER TABLE attendance_records ADD COLUMN late_checkin_reason TEXT NULL;
    END IF;
END $$;

-- Also ensure qr_data column is NOT NULL as per our schema
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'attendance_records' 
               AND column_name = 'qr_data' AND is_nullable = 'YES') THEN
        ALTER TABLE attendance_records ALTER COLUMN qr_data SET NOT NULL;
    END IF;
END $$;