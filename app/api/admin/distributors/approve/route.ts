import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { distributorId, action, notes } = await request.json()

    if (!distributorId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      )
    }

    const verificationStatus = action === 'approve' ? 'verified' : 'rejected'

    const result = await sql`
      UPDATE distributor_profiles
      SET 
        verification_status = ${verificationStatus},
        verification_notes = ${notes || null},
        verification_date = NOW()
      WHERE id = ${distributorId}
      RETURNING id, verification_status
    `

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: 'Distributor not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: `Distributor ${action}d successfully`,
      distributor: result[0]
    })
  } catch (error) {
    console.error('[v0] Error updating distributor verification:', error)
    return NextResponse.json(
      { error: 'Failed to update distributor verification' },
      { status: 500 }
    )
  }
}
