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

    if (!id) {
      return NextResponse.json({ error: 'Medicine ID is required' }, { status: 400 })
    }

    const result = await sql`
      SELECT id, name, generic_name, manufacturer, category, form, strength, mrp, requires_prescription, hsn_code, COALESCE(photo_url, '') as photo_url, COALESCE(description, '') as description, COALESCE(mfg_date, '') as mfg_date
      FROM medicines
      WHERE id = ${Number(id)}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      medicine: result[0]
    })
  } catch (error) {
    console.error('[v0] Error fetching medicine:', error)
    return NextResponse.json({ error: 'Failed to fetch medicine' }, { status: 500 })
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
      name,
      generic_name,
      manufacturer,
      category,
      form,
      strength,
      mrp,
      requires_prescription,
      hsn_code,
      photo_url,
      description,
      mfg_date
    } = body

    if (!id) {
      return NextResponse.json({ error: 'Medicine ID is required' }, { status: 400 })
    }

    const result = await sql`
      UPDATE medicines
      SET 
        name = COALESCE(${name || null}, name),
        generic_name = COALESCE(${generic_name || null}, generic_name),
        manufacturer = COALESCE(${manufacturer || null}, manufacturer),
        category = COALESCE(${category || null}, category),
        form = COALESCE(${form || null}, form),
        strength = COALESCE(${strength || null}, strength),
        mrp = COALESCE(${mrp || null}, mrp),
        requires_prescription = COALESCE(${requires_prescription !== undefined ? requires_prescription : null}, requires_prescription),
        hsn_code = COALESCE(${hsn_code || null}, hsn_code),
        photo_url = COALESCE(${photo_url || null}, photo_url),
        description = COALESCE(${description || null}, description),
        mfg_date = COALESCE(${mfg_date || null}, mfg_date),
        updated_at = NOW()
      WHERE id = ${Number(id)}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      medicine: result[0]
    })
  } catch (error) {
    console.error('[v0] Error updating medicine:', error)
    return NextResponse.json({ error: 'Failed to update medicine' }, { status: 500 })
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

    if (!id) {
      return NextResponse.json({ error: 'Medicine ID is required' }, { status: 400 })
    }

    const result = await sql`
      DELETE FROM medicines
      WHERE id = ${Number(id)}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Medicine deleted successfully'
    })
  } catch (error) {
    console.error('[v0] Error deleting medicine:', error)
    return NextResponse.json({ error: 'Failed to delete medicine' }, { status: 500 })
  }
}
