-- Add photo_url, description, and mfg_date columns to medicines table
-- This script adds support for medicine photos, descriptions, and manufacturing dates

ALTER TABLE medicines
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS mfg_date DATE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_medicines_photo_url ON medicines(photo_url);
CREATE INDEX IF NOT EXISTS idx_medicines_mfg_date ON medicines(mfg_date);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'medicines'
ORDER BY ordinal_position;
