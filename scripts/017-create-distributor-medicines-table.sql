-- Create distributor_medicines table
CREATE TABLE IF NOT EXISTS distributor_medicines (
  id SERIAL PRIMARY KEY,
  distributor_id INTEGER NOT NULL REFERENCES distributor_profiles(id) ON DELETE CASCADE,
  medicine_id INTEGER NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  batch_number VARCHAR(100),
  mfg_date DATE,
  expiry_date DATE NOT NULL,
  mrp DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  amount DECIMAL(12, 2),
  hsn_code VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(distributor_id, medicine_id, batch_number)
);

-- Add distributor_id column to pharmacy_inventory if it doesn't exist
ALTER TABLE pharmacy_inventory
ADD COLUMN IF NOT EXISTS distributor_id INTEGER REFERENCES distributor_profiles(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_distributor_medicines_distributor_id ON distributor_medicines(distributor_id);
CREATE INDEX IF NOT EXISTS idx_distributor_medicines_medicine_id ON distributor_medicines(medicine_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_inventory_distributor_id ON pharmacy_inventory(distributor_id);
