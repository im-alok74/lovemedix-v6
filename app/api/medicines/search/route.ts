import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null
    const requiresPrescription = searchParams.get('prescription')
    const sortBy = searchParams.get('sortBy') || 'price_low'
    const limit = Number(searchParams.get('limit')) || 50
    const offset = Number(searchParams.get('offset')) || 0

    // Build the search query dynamically based on filters
    let results: any[] = []

    const searchQuery = '%' + query + '%'
    const prescriptionValue = requiresPrescription === 'true' ? true : requiresPrescription === 'false' ? false : null

    // Determine order clause
    let orderClause = 'ORDER BY pi.selling_price ASC'
    if (sortBy === 'price_high') {
      orderClause = 'ORDER BY pi.selling_price DESC'
    } else if (sortBy === 'name') {
      orderClause = 'ORDER BY m.name ASC'
    } else if (sortBy === 'newest') {
      orderClause = 'ORDER BY m.created_at DESC'
    }

    // Execute query based on filter combinations
    if (query && category && minPrice !== null && maxPrice !== null && prescriptionValue !== null) {
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
          AND (LOWER(m.name) ILIKE ${searchQuery} OR LOWER(m.generic_name) ILIKE ${searchQuery} OR LOWER(m.manufacturer) ILIKE ${searchQuery})
          AND m.category = ${category}
          AND pi.selling_price >= ${minPrice}
          AND pi.selling_price <= ${maxPrice}
          AND m.requires_prescription = ${prescriptionValue}
        ${sql.raw(orderClause)}
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (query && category && minPrice !== null && maxPrice !== null) {
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
          AND (LOWER(m.name) ILIKE ${searchQuery} OR LOWER(m.generic_name) ILIKE ${searchQuery} OR LOWER(m.manufacturer) ILIKE ${searchQuery})
          AND m.category = ${category}
          AND pi.selling_price >= ${minPrice}
          AND pi.selling_price <= ${maxPrice}
        ${sql.raw(orderClause)}
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (query && category) {
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
          AND (LOWER(m.name) ILIKE ${searchQuery} OR LOWER(m.generic_name) ILIKE ${searchQuery} OR LOWER(m.manufacturer) ILIKE ${searchQuery})
          AND m.category = ${category}
        ${sql.raw(orderClause)}
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (query) {
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
          AND (LOWER(m.name) ILIKE ${searchQuery} OR LOWER(m.generic_name) ILIKE ${searchQuery} OR LOWER(m.manufacturer) ILIKE ${searchQuery})
        ${sql.raw(orderClause)}
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (category) {
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
          AND m.category = ${category}
        ${sql.raw(orderClause)}
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      // No filters - return all active medicines
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
        ${sql.raw(orderClause)}
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    // Group by medicine to get best price
    const medicines = results.reduce((acc: any[], med: any) => {
      const existing = acc.find((m) => m.id === med.id)
      if (!existing) {
        acc.push(med)
      } else if (med.final_price < existing.final_price) {
        acc[acc.indexOf(existing)] = med
      }
      return acc
    }, [])

    // Get unique categories for filter
    const categories = await sql`
      SELECT DISTINCT category FROM medicines WHERE status = 'active' ORDER BY category
    `

    return NextResponse.json({
      medicines,
      categories: (categories as any[]).map((c) => c.category),
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
