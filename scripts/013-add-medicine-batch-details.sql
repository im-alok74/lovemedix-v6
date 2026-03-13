-- Add manufacturing date and MRP to pharmacy inventory
ALTER TABLE pharmacy_inventory
ADD COLUMN IF NOT EXISTS mfg_date DATE,
ADD COLUMN IF NOT EXISTS mrp_price DECIMAL(10, 2);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_pharmacy_inventory_batch ON pharmacy_inventory(pharmacy_id, batch_number, expiry_date);
