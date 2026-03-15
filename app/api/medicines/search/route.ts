import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const limit = Number(searchParams.get('limit')) || 50
    const offset = Number(searchParams.get('offset')) || 0

    console.log('[v0] Medicine search - query:', query)

    // Base query - get all active medicines with pharmacy inventory
    let results: any[] = []
    
    if (query && query.trim()) {
      // Search by name, generic name, or manufacturer
      const searchTerm = `%${query}%`
      console.log('[v0] Searching with term:', searchTerm)
      
      results = await sql`
        SELECT 
          m.id,
          m.name,
          m.generic_name,
          m.manufacturer,
          m.category,
          m.strength,
          m.form,
          m.pack_size,
          m.mrp,
          m.image_url,
          m.requires_prescription,
          pi.selling_price,
          pi.discount_percentage,
          pp.pharmacy_name,
          pp.id as pharmacy_id,
          (pi.selling_price * (1 - pi.discount_percentage / 100)) as final_price,
          COUNT(*) OVER () as total_count
        FROM medicines m
        JOIN pharmacy_inventory pi ON m.id = pi.medicine_id
        JOIN pharmacy_profiles pp ON pi.pharmacy_id = pp.id
        WHERE m.status = 'active' 
          AND pp.verification_status = 'verified' 
          AND pi.stock_quantity > 0
          AND (
            LOWER(m.name) LIKE LOWER(${searchTerm})
            OR LOWER(m.generic_name) LIKE LOWER(${searchTerm})
            OR LOWER(m.manufacturer) LIKE LOWER(${searchTerm})
          )
        ORDER BY pi.selling_price ASC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      // No search query - return all active medicines
      console.log('[v0] No search query, fetching all medicines')
      
      results = await sql`
        SELECT 
          m.id,
          m.name,
          m.generic_name,
          m.manufacturer,
          m.category,
          m.strength,
          m.form,
          m.pack_size,
          m.mrp,
          m.image_url,
          m.requires_prescription,
          pi.selling_price,
          pi.discount_percentage,
          pp.pharmacy_name,
          pp.id as pharmacy_id,
          (pi.selling_price * (1 - pi.discount_percentage / 100)) as final_price,
          COUNT(*) OVER () as total_count
        FROM medicines m
        JOIN pharmacy_inventory pi ON m.id = pi.medicine_id
        JOIN pharmacy_profiles pp ON pi.pharmacy_id = pp.id
        WHERE m.status = 'active' 
          AND pp.verification_status = 'verified' 
          AND pi.stock_quantity > 0
        ORDER BY pi.selling_price ASC
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    console.log('[v0] Results count:', results.length)

    // Group by medicine to get best price
    const medicines = results.reduce((acc: any[], med: any) => {
      const existing = acc.find((m) => m.id === med.id)
      if (!existing) {
        acc.push(med)
      } else if (med.final_price < existing.final_price) {
        // Replace with better price
        const idx = acc.indexOf(existing)
        acc[idx] = med
      }
      return acc
    }, [])

    console.log('[v0] Medicines after grouping:', medicines.length)

    // Get unique categories for filter
    const categories = await sql`
      SELECT DISTINCT category FROM medicines WHERE status = 'active' ORDER BY category
    `

    return NextResponse.json({
      medicines,
      categories: Array.isArray(categories) ? (categories as any[]).map((c) => c.category) : [],
      total: medicines.length > 0 ? medicines[0].total_count : 0,
      limit,
      offset
    })
  } catch (error) {
    console.error('[v0] Error searching medicines:', error)
    return NextResponse.json(
      { error: 'Failed to search medicines' },
      { status: 500 }
    )
  }
}
