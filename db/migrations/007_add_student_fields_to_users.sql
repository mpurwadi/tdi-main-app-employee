-- Add student-related fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS student_id VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS campus VARCHAR(100),
ADD COLUMN IF NOT EXISTS division VARCHAR(100);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);

-- Add comments to the new columns
COMMENT ON COLUMN users.student_id IS 'Unique identifier for students';
COMMENT ON COLUMN users.campus IS 'Campus where the student is enrolled';
COMMENT ON COLUMN users.division IS 'Division/Department of the student';