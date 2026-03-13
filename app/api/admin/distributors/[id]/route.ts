import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-server'
import { sql } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['admin'])
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const distributor = await sql`
      SELECT d.*, u.id AS user_id, u.email, u.full_name, u.phone, u.status
      FROM distributor_profiles d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = ${Number(id)}
    `

    if (distributor.length === 0) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      distributor: distributor[0]
    })
  } catch (error) {
    console.error('[v0] Error fetching distributor:', error)
    return NextResponse.json({ error: 'Failed to fetch distributor' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['admin'])
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      company_name,
      gst_number,
      address,
      city,
      state,
      pincode,
      service_areas,
      commission_rate,
      verification_status,
      user_status
    } = body

    const distributorId = Number(id)

    // Get distributor to find user_id
    const distributorData = await sql`
      SELECT user_id FROM distributor_profiles WHERE id = ${distributorId}
    `

    if (!distributorData || distributorData.length === 0) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 })
    }

    const userId = (distributorData[0] as any).user_id

    // Update user status if provided
    if (user_status) {
      const validStatus = ['active', 'suspended', 'inactive'].includes(user_status)
      if (!validStatus) {
        return NextResponse.json({ error: 'Invalid user status' }, { status: 400 })
      }
      
      await sql`
        UPDATE users
        SET status = ${user_status}
        WHERE id = ${userId}
      `
      console.log('[v0] Updated user status to:', user_status)
    }

    // Update distributor profile with verification status
    if (verification_status) {
      const validStatuses = ['pending', 'verified', 'rejected']
      if (!validStatuses.includes(verification_status)) {
        return NextResponse.json({ error: 'Invalid verification status' }, { status: 400 })
      }

      const result = await sql`
        UPDATE distributor_profiles
        SET verification_status = ${verification_status}
        WHERE id = ${distributorId}
        RETURNING *
      `

      console.log('[v0] Updated verification status to:', verification_status)

      return NextResponse.json({
        success: true,
        distributor: result[0],
        message: 'Distributor verification updated successfully'
      })
    }

    // Update other distributor fields if provided
    const result = await sql`
      UPDATE distributor_profiles
      SET 
        company_name = COALESCE(${company_name || null}, company_name),
        gst_number = COALESCE(${gst_number || null}, gst_number),
        address = COALESCE(${address || null}, address),
        city = COALESCE(${city || null}, city),
        state = COALESCE(${state || null}, state),
        pincode = COALESCE(${pincode || null}, pincode),
        commission_rate = COALESCE(${commission_rate || null}, commission_rate)
      WHERE id = ${distributorId}
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      distributor: result[0],
      message: 'Distributor updated successfully'
    })
  } catch (error: any) {
    console.error('[v0] Error updating distributor:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update distributor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['admin'])
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get distributor to find user_id
    const distributorData = await sql`
      SELECT user_id FROM distributor_profiles WHERE id = ${Number(id)}
    `

    if (distributorData.length === 0) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 })
    }

    const userId = (distributorData[0] as any).user_id

    // Delete user (cascade will delete distributor profile)
    await sql`
      DELETE FROM users WHERE id = ${userId}
    `

    return NextResponse.json({
      success: true,
      message: 'Distributor deleted successfully'
    })
  } catch (error) {
    console.error('[v0] Error deleting distributor:', error)
    return NextResponse.json({ error: 'Failed to delete distributor' }, { status: 500 })
  }
}
