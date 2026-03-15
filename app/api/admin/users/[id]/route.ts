import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-server'
import { sql } from '@/lib/db'

// PATCH /api/admin/users/[id] - Update user type and/or status
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(['admin'])

    // Await params if it's a Promise (Next.js runtime behavior)
    const resolvedParams = await Promise.resolve(params)
    const userId = Number(resolvedParams.id)
    
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const { user_type, status } = await request.json()

    if (!user_type && !status) {
      return NextResponse.json({ error: 'No fields provided for update' }, { status: 400 })
    }

    // Build update dynamically
    if (user_type && status) {
      await sql`
        UPDATE users
        SET user_type = ${user_type}, status = ${status}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
      `
    } else if (user_type) {
      await sql`
        UPDATE users
        SET user_type = ${user_type}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
      `
    } else if (status) {
      await sql`
        UPDATE users
        SET status = ${status}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
      `
    }

    return NextResponse.json({ success: true, message: 'User updated successfully' })
  } catch (error: any) {
    console.error('[v0] Error updating user (id route):', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to update user', details: String(error) }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] - Delete a user
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(['admin'])

    // Await params if it's a Promise (Next.js runtime behavior)
    const resolvedParams = await Promise.resolve(params)
    const userId = Number(resolvedParams.id)
    
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    await sql`
      DELETE FROM users WHERE id = ${userId}
    `

    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error: any) {
    console.error('[v0] Error deleting user (id route):', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to delete user', details: String(error) }, { status: 500 })
  }
}
