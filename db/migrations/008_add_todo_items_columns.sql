-- Add missing columns to todo_items table
ALTER TABLE todo_items 
ADD COLUMN IF NOT EXISTS description_text TEXT,
ADD COLUMN IF NOT EXISTS tag VARCHAR(50),
ADD COLUMN IF NOT EXISTS date DATE,
ADD COLUMN IF NOT EXISTS path VARCHAR(255);