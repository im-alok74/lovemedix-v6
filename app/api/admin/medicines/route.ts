import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(['admin'])
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query') || ''
    const category = searchParams.get('category') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let whereClause = ''
    const params: any[] = []

    if (query) {
      params.push(`%${query}%`, `%${query}%`)
      whereClause = ' WHERE (name ILIKE $1 OR generic_name ILIKE $2)'
    }

    if (category) {
      if (whereClause) {
        params.push(category)
        whereClause += ` AND category = $${params.length}`
      } else {
        params.push(category)
        whereClause = ` WHERE category = $1`
      }
    }

    const countResult = await sql`
      SELECT COUNT(*) as total FROM medicines ${whereClause ? sql.raw(whereClause.replace(/\$/g, '').replace(/\?/g, '$1')) : sql.empty}
    `

    let medicines
    if (query || category) {
      const conditions = []
      let paramIndex = 1
      
      if (query) {
        conditions.push(`(name ILIKE $${paramIndex} OR generic_name ILIKE $${paramIndex + 1})`)
        paramIndex += 2
      }
      
      if (category) {
        conditions.push(`category = $${paramIndex}`)
        paramIndex += 1
      }

      const whereCondition = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''
      
      medicines = await sql`
        SELECT id, name, generic_name, manufacturer, category, form, strength, mrp, requires_prescription, hsn_code, photo_url, description, mfg_date
        FROM medicines
        ${whereCondition ? sql.raw(whereCondition) : sql.empty}
        ORDER BY name ASC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      medicines = await sql`
        SELECT id, name, generic_name, manufacturer, category, form, strength, mrp, requires_prescription, hsn_code, photo_url, description, mfg_date
        FROM medicines
        ORDER BY name ASC
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    const total = 0 // For now, return all results
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      medicines,
      total,
      totalPages,
      currentPage: page
    })
  } catch (error) {
    console.error('[v0] Error fetching medicines:', error)
    return NextResponse.json({ error: 'Failed to fetch medicines' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole(['admin'])
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    if (!name || !generic_name || !manufacturer || !mrp || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO medicines (
        name, generic_name, manufacturer, category, form, strength, 
        mrp, requires_prescription, hsn_code, photo_url, description, mfg_date
      )
      VALUES (
        ${name}, ${generic_name}, ${manufacturer}, ${category}, ${form || null}, 
        ${strength || null}, ${mrp}, ${requires_prescription || false}, 
        ${hsn_code || null}, ${photo_url || null}, ${description || null}, ${mfg_date || null}
      )
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      medicine: result[0]
    })
  } catch (error) {
    console.error('[v0] Error creating medicine:', error)
    return NextResponse.json({ error: 'Failed to create medicine' }, { status: 500 })
  }
}
