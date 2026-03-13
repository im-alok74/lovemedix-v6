-- Add photo_url and description columns to medicines table if they don't exist
ALTER TABLE medicines
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS mfg_date DATE;

-- Create an index on medicines for better query performance
CREATE INDEX IF NOT EXISTS idx_medicines_category ON medicines(category);
CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);
