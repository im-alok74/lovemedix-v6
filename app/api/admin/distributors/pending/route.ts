import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const distributors = await sql`
      SELECT 
        dp.id,
        dp.user_id,
        dp.company_name,
        dp.business_license_number,
        dp.tax_id,
        dp.phone_number,
        dp.address_line1,
        dp.city,
        dp.state_province,
        dp.postal_code,
        dp.country,
        dp.verification_status,
        dp.created_at,
        u.email,
        u.name
      FROM distributor_profiles dp
      JOIN users u ON dp.user_id = u.id
      WHERE dp.verification_status = 'pending'
      ORDER BY dp.created_at ASC
    `

    return NextResponse.json(distributors)
  } catch (error) {
    console.error('[v0] Error fetching pending distributors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending distributors' },
      { status: 500 }
    )
  }
}
