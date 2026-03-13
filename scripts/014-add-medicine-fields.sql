-- Add HSN and MFG Date to medicines table if they don't exist
ALTER TABLE medicines
ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS mfg_date DATE;

-- Create pharmacy_medicines table for pharmacy-specific medicine management
CREATE TABLE IF NOT EXISTS pharmacy_medicines (
  id SERIAL PRIMARY KEY,
  pharmacy_id INTEGER REFERENCES pharmacy_profiles(id) ON DELETE CASCADE,
  medicine_id INTEGER REFERENCES medicines(id) ON DELETE CASCADE,
  hsn_code VARCHAR(20),
  batch_number VARCHAR(100),
  mfg_date DATE,
  expiry_date DATE NOT NULL,
  mrp DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price DECIMAL(10, 2) NOT NULL,
  amount DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pharmacy_id, medicine_id, batch_number)
);

-- Create distributor_medicines table for distributor-specific medicine management
CREATE TABLE IF NOT EXISTS distributor_medicines (
  id SERIAL PRIMARY KEY,
  distributor_id INTEGER REFERENCES distributor_profiles(id) ON DELETE CASCADE,
  medicine_id INTEGER REFERENCES medicines(id) ON DELETE CASCADE,
  hsn_code VARCHAR(20),
  batch_number VARCHAR(100),
  mfg_date DATE,
  expiry_date DATE NOT NULL,
  mrp DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price DECIMAL(10, 2) NOT NULL,
  amount DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(distributor_id, medicine_id, batch_number)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pharmacy_medicines_pharmacy ON pharmacy_medicines(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_medicines_medicine ON pharmacy_medicines(medicine_id);
CREATE INDEX IF NOT EXISTS idx_distributor_medicines_distributor ON distributor_medicines(distributor_id);
CREATE INDEX IF NOT EXISTS idx_distributor_medicines_medicine ON distributor_medicines(medicine_id);
