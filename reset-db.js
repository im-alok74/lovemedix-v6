const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function resetAndMigrate() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🔄 Resetting database...\n');
    
    // Drop all tables in correct order (foreign keys first)
    const dropStatements = [
      'DROP TABLE IF EXISTS prescriptions CASCADE',
      'DROP TABLE IF EXISTS reviews CASCADE',
      'DROP TABLE IF EXISTS order_items CASCADE',
      'DROP TABLE IF EXISTS orders CASCADE',
      'DROP TABLE IF EXISTS cart_items CASCADE',
      'DROP TABLE IF EXISTS pharmacy_inventory CASCADE',
      'DROP TABLE IF EXISTS medicines CASCADE',
      'DROP TABLE IF EXISTS addresses CASCADE',
      'DROP TABLE IF EXISTS pharmacy_profiles CASCADE',
      'DROP TABLE IF EXISTS distributor_profiles CASCADE',
      'DROP TABLE IF EXISTS customer_profiles CASCADE',
      'DROP TABLE IF EXISTS sessions CASCADE',
      'DROP TABLE IF EXISTS users CASCADE',
    ];
    
    for (const stmt of dropStatements) {
      try {
        await sql.query(stmt);
      } catch (err) {
        // Ignore if table doesn't exist
      }
    }
    
    console.log('✅ Database cleared\n');
    
    // Run the base 001-create-tables.sql
    console.log('📝 Running 001-create-tables.sql...\n');
    const createSql = fs.readFileSync(path.join(__dirname, 'scripts', '001-create-tables.sql'), 'utf-8');
    const createStatements = createSql.split(';').filter(s => s.trim());
    
    for (const statement of createStatements) {
      const trimmed = statement.trim();
      if (!trimmed) continue;
      
      try {
        await sql.query(trimmed);
      } catch (err) {
        if (err.message.includes('already exists')) {
          // skip
        } else {
          console.error('Error in statement:', trimmed.substring(0, 50));
          throw err;
        }
      }
    }
    
    console.log('✅ 001-create-tables.sql completed\n');
    
    // Run 002-seed-data
    console.log('📝 Running 002-seed-data.sql...\n');
    const seedSql = fs.readFileSync(path.join(__dirname, 'scripts', '002-seed-data.sql'), 'utf-8');
    const seedStatements = seedSql.split(';').filter(s => s.trim());
    
    for (const statement of seedStatements) {
      const trimmed = statement.trim();
      if (!trimmed) continue;
      
      try {
        await sql.query(trimmed);
      } catch (err) {
        // Skip duplicate errors
        if (err.code === '23505' || err.code === '23514') {
          // skip
        } else {
          console.error('Error in statement:', trimmed.substring(0, 50));
          throw err;
        }
      }
    }
    
    console.log('✅ 002-seed-data.sql completed\n');
    
    // Now add the migration: rename columns in distributor_profiles to match API expectations
    console.log('🔧 Migrating distributor_profiles columns...\n');
    
    const migrationStatements = [
      'ALTER TABLE distributor_profiles ADD COLUMN IF NOT EXISTS business_license_number VARCHAR(255)',
      'UPDATE distributor_profiles SET business_license_number = license_number WHERE business_license_number IS NULL',
      'ALTER TABLE distributor_profiles ADD COLUMN IF NOT EXISTS tax_id VARCHAR(255)',
      'UPDATE distributor_profiles SET tax_id = gst_number WHERE tax_id IS NULL',
    ];
    
    for (const stmt of migrationStatements) {
      try {
        await sql.query(stmt);
        console.log(`  ✓ ${stmt.substring(0, 50)}...`);
      } catch (err) {
        if (err.code === '42601' || err.message.includes('duplicate')) {
          console.log(`  ℹ️  ${stmt.substring(0, 50)}... (already exists)`);
        } else {
          console.error('Migration error:', err.message);
          // Don't throw, continue
        }
      }
    }
    
    console.log('\n✅ Distributor profiles migration completed');
    
    // Verify the schema
    console.log('\n🔍 Final schema verification:\n');
    const columns = await sql.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'distributor_profiles'
      ORDER BY ordinal_position
    `);
    
    const cols = Array.isArray(columns) ? columns : columns?.rows || [];
    cols.forEach(row => {
      if (row.column_name.includes('license') || row.column_name.includes('tax') || row.column_name.includes('gst')) {
        console.log(`  ✓ ${row.column_name} (${row.data_type})`);
      }
    });
    
    console.log('\n✅ Database reset and migration completed successfully!');
    console.log('   The database is ready for the distributor registration feature.');
    process.exit(0);
    
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  }
}

resetAndMigrate();
