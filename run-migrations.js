const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

async function runMigrations() {
  const sql = neon(process.env.DATABASE_URL);
  
  const migrationFiles = [
    '001-init-tables.sql',
    '002-seed-data.sql',
  ];

  try {
    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, 'scripts', file);
      if (!fs.existsSync(filePath)) {
        console.log(`⏭️  Skipping ${file} - not found`);
        continue;
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      console.log(`\n📝 Running ${file}...`);
      
      // Split by semicolon and execute each statement
      const statements = content.split(';').filter(s => s.trim());
      
      for (const statement of statements) {
        try {
          const trimmed = statement.trim();
          if (!trimmed) continue;
          
          console.log(`  ✓ Executing statement...`);
          await sql.query(trimmed);
        } catch (err) {
          if (err.message.includes('already exists')) {
            console.log(`  ℹ️  Table/index already exists (safe to ignore)`);
          } else {
            throw err;
          }
        }
      }
      
      console.log(`✅ ${file} completed`);
    }
    
    console.log('\n✅ All migrations completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigrations();
