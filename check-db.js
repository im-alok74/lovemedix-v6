const { neon } = require('@neondatabase/serverless');

async function checkDB() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('Checking database tables and columns...\n');
    
    // List all tables
    const tablesResult = await sql.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tables = Array.isArray(tablesResult) ? tablesResult : tablesResult?.rows || [];
    
    console.log('📋 Tables in database:');
    if (tables.length === 0) {
      console.log('  ❌ No tables found!');
    } else {
      tables.forEach(row => {
        console.log('  -', row.table_name);
      });
    }
    
    // Check distributor_profiles table
    console.log('\n🔍 Checking distributor_profiles columns:');
    const columnsResult = await sql.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'distributor_profiles'
      ORDER BY ordinal_position
    `);
    
    const columns = Array.isArray(columnsResult) ? columnsResult : columnsResult?.rows || [];
    
    if (columns.length === 0) {
      console.log('  ❌ Table "distributor_profiles" does NOT exist!');
    } else {
      console.log(`  ✓ Found ${columns.length} columns:`);
      columns.forEach(row => {
        console.log(`    - ${row.column_name} (${row.data_type})`);
      });
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkDB();
