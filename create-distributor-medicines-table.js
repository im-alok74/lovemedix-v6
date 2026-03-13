const { neon } = require('@neondatabase/serverless');

async function createDistributorMedicinesTable() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('📝 Creating distributor_medicines table if not exists...\n');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS distributor_medicines (
        id SERIAL PRIMARY KEY,
        distributor_id INTEGER NOT NULL REFERENCES distributor_profiles(id) ON DELETE CASCADE,
        medicine_id INTEGER NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
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

      CREATE INDEX IF NOT EXISTS idx_distributor_medicines_distributor ON distributor_medicines(distributor_id);
      CREATE INDEX IF NOT EXISTS idx_distributor_medicines_medicine ON distributor_medicines(medicine_id);
      CREATE INDEX IF NOT EXISTS idx_distributor_medicines_expiry ON distributor_medicines(expiry_date);
    `;

    // Split statements and execute
    const statements = createTableSQL.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (!trimmed) continue;
      
      console.log(`  ✓ Executing: ${trimmed.substring(0, 50)}...`);
      await sql.query(trimmed);
    }
    
    console.log('\n✅ distributor_medicines table created successfully!');
    process.exit(0);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createDistributorMedicinesTable();
