const { neon } = require('@neondatabase/serverless');

async function checkAdminAccounts() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🔍 Checking all admin accounts in database...\n');
    
    const admins = await sql`
      SELECT id, email, user_type, status, created_at, updated_at
      FROM users
      WHERE user_type = 'admin'
      ORDER BY created_at DESC
    `;
    
    if (admins.length === 0) {
      console.log('❌ No admin accounts found in database\n');
    } else {
      console.log(`✅ Found ${admins.length} admin account(s):\n`);
      admins.forEach((admin, index) => {
        console.log(`Admin ${index + 1}:`);
        console.log(`  ID: ${admin.id}`);
        console.log(`  Email: ${admin.email}`);
        console.log(`  Status: ${admin.status}`);
        console.log(`  Created: ${admin.created_at}`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkAdminAccounts();
