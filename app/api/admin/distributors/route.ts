import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-server'
import { sql } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(['admin'])
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '100')

    const distributors = await sql`
      SELECT d.*, u.id AS user_id, u.email, u.full_name, u.phone, u.status
      FROM distributor_profiles d
      JOIN users u ON d.user_id = u.id
      ORDER BY d.created_at DESC
      LIMIT ${limit}
    `

    return NextResponse.json({
      success: true,
      distributors
    })
  } catch (error) {
    console.error('[v0] Error fetching distributors:', error)
    return NextResponse.json({ error: 'Failed to fetch distributors' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(['admin'])
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      email,
      password,
      full_name,
      phone,
      company_name,
      license_number,
      gst_number,
      address,
      city,
      state,
      pincode,
      service_areas,
      commission_rate
    } = body

    // Validate required fields
    if (!email || !password || !full_name || !company_name || !license_number) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user account
    const userResult = await sql`
      INSERT INTO users (
        email, password_hash, full_name, phone, user_type, status
      )
      VALUES (
        ${email}, ${hashedPassword}, ${full_name}, ${phone || null}, 
        'distributor', 'active'
      )
      RETURNING id
    `

    const newUserId = (userResult[0] as any).id

    // Create distributor profile
    const distributorResult = await sql`
      INSERT INTO distributor_profiles (
        user_id, company_name, license_number, gst_number, 
        address, city, state, pincode, service_areas, commission_rate, 
        verification_status
      )
      VALUES (
        ${newUserId}, ${company_name}, ${license_number}, ${gst_number || null},
        ${address}, ${city}, ${state}, ${pincode}, 
        ${service_areas ? `{${service_areas.join(',')}}` : null}, 
        ${commission_rate || 10}, 'pending'
      )
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      distributor: distributorResult[0],
      message: 'Distributor created successfully'
    })
  } catch (error) {
    console.error('[v0] Error creating distributor:', error)
    return NextResponse.json({ error: 'Failed to create distributor' }, { status: 500 })
  }
}
