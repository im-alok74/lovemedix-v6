const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

async function checkAndRecreateAdmin() {
  const sql = neon(process.env.DATABASE_URL);
  const email = "speeclo@gmail.com";
  const password = "123456";
  
  try {
    console.log('🔍 Checking for admin account: speeclo@gmail.com\n');
    
    // Check if account exists
    const existing = await sql`
      SELECT id, email, status, password_hash FROM users WHERE email = ${email}
    `;
    
    if (existing.length > 0) {
      console.log('✅ Account found!');
      console.log(`   Email: ${existing[0].email}`);
      console.log(`   Status: ${existing[0].status}`);
      console.log(`   Password Hash: ${existing[0].password_hash.substring(0, 30)}...\n`);
      
      // Try to verify password
      const isValid = await bcrypt.compare(password, existing[0].password_hash);
      if (isValid) {
        console.log('✅ Password is CORRECT!\n');
      } else {
        console.log('❌ Password is INCORRECT - rehashing...\n');
        const newHash = await bcrypt.hash(password, 10);
        await sql`
          UPDATE users 
          SET password_hash = ${newHash}, updated_at = NOW()
          WHERE email = ${email}
        `;
        console.log('✅ Password updated successfully!\n');
      }
      
      // Make sure status is active
      if (existing[0].status !== 'active') {
        await sql`
          UPDATE users 
          SET status = 'active', updated_at = NOW()
          WHERE email = ${email}
        `;
        console.log('✅ Account status set to active!\n');
      }
    } else {
      console.log('❌ Account NOT found! Creating new admin account...\n');
      
      // Create new admin
      const passwordHash = await bcrypt.hash(password, 10);
      const result = await sql`
        INSERT INTO users (email, password_hash, full_name, user_type, status, created_at, updated_at)
        VALUES (${email}, ${passwordHash}, 'Admin', 'admin', 'active', NOW(), NOW())
        RETURNING id, email, user_type, status
      `;
      
      console.log('✅ Admin account created successfully!');
      console.log(`   ID: ${result[0].id}`);
      console.log(`   Email: ${result[0].email}`);
      console.log(`   Type: ${result[0].user_type}`);
      console.log(`   Status: ${result[0].status}\n`);
    }
    
    console.log('='.repeat(50));
    console.log('LOGIN CREDENTIALS:');
    console.log('='.repeat(50));
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('='.repeat(50) + '\n');
    
    console.log('✅ Admin account is ready! Try signing in now.\n');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkAndRecreateAdmin();
