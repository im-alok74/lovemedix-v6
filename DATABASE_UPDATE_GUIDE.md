# Database Schema Update Guide

## Adding photo_url, mfg_date, and description Columns to Medicines Table

Your code is now ready to support medicine photos, manufacturing dates, and descriptions. To enable these features, you need to add three new columns to your `medicines` table.

### Option 1: Using Your Database Management Console (Recommended)

If you're using **Neon, Supabase, or PlanetScale**, follow these steps:

1. **Log in to your database console**
   - Neon: https://console.neon.tech
   - Supabase: https://app.supabase.com
   - PlanetScale: https://planetscale.com

2. **Run this SQL query** in your database:

```sql
-- Add new columns to medicines table
ALTER TABLE medicines
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS mfg_date DATE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_medicines_category ON medicines(category);
CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);
```

3. **Verify the changes** by running:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'medicines';
```

You should see the new columns listed.

### Option 2: Using Migration Script (Automated)

A migration script has been created at: `scripts/015-add-photo-and-mfg-to-medicines.sql`

If you set up your environment variables with database access, you can execute this script.

### What These Columns Do

- **photo_url** (TEXT): Stores the URL/path to the medicine image uploaded by admin
- **description** (TEXT): Stores detailed medicine information, uses, side effects, precautions
- **mfg_date** (DATE): Stores the manufacturing date of the medicine

### After Adding Columns

Your app will now support:
- ✅ Medicine photo uploads in the admin panel
- ✅ Medicine descriptions and details
- ✅ Manufacturing date tracking
- ✅ Medicine photos displayed on the website
- ✅ Full CRUD operations for all new fields

### Troubleshooting

If you get an error like "column does not exist":
- Make sure the ALTER TABLE command completed successfully
- Verify the columns were added using the verification query above
- Restart your development server after adding columns
- Check that your database connection is working properly

### File Changes Made

The following files have been updated to support these new fields:
- `/app/admin/medicines/form/page.tsx` - Form UI with photo upload
- `/app/api/admin/medicines/route.ts` - POST API endpoint
- `/app/api/admin/medicines/[id]/route.ts` - PATCH API endpoint
- `/components/medicines/medicine-card.tsx` - Display photo_url

All these changes are backward compatible - if the columns don't exist yet, the queries will handle it gracefully.
