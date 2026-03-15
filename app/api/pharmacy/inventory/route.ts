import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || user.user_type !== "pharmacy") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get pharmacy profile
    const pharmacyProfile = await sql`
      SELECT id FROM pharmacy_profiles WHERE user_id = ${user.id}
    `

    if (pharmacyProfile.length === 0) {
      return NextResponse.json({ error: "Pharmacy profile not found" }, { status: 404 })
    }

    const pharmacyId = pharmacyProfile[0].id

    // Get pharmacy inventory with distributor info
    const inventory = await sql`
      SELECT 
        pi.id,
        pi.medicine_id,
        pi.quantity,
        pi.unit_price,
        pi.distributor_id,
        pi.created_at,
        m.name,
        m.generic_name,
        m.manufacturer,
        m.form,
        m.strength,
        m.pack_size,
        m.requires_prescription,
        dp.company_name as distributor_name
      FROM pharmacy_inventory pi
      JOIN medicines m ON pi.medicine_id = m.id
      LEFT JOIN distributor_profiles dp ON pi.distributor_id = dp.id
      WHERE pi.pharmacy_id = ${pharmacyId}
      ORDER BY pi.created_at DESC
    `

    return NextResponse.json({ inventory })
  } catch (error: any) {
    console.error("[v0] Pharmacy inventory error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || user.user_type !== "pharmacy") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      medicineId,
      quantity,
      unitPrice,
      distributorId,
      batchNumber,
      expiryDate,
      mrp
    } = body

    // Validate required fields
    if (!medicineId || !quantity || !unitPrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get pharmacy profile
    const pharmacyProfile = await sql`
      SELECT id FROM pharmacy_profiles WHERE user_id = ${user.id}
    `

    if (pharmacyProfile.length === 0) {
      return NextResponse.json({ error: "Pharmacy profile not found" }, { status: 404 })
    }

    const pharmacyId = pharmacyProfile[0].id

    // Check if medicine exists
    const medicine = await sql`
      SELECT id, name FROM medicines WHERE id = ${medicineId}
    `

    if (medicine.length === 0) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 })
    }

    // Check if medicine already exists in pharmacy inventory
    const existing = await sql`
      SELECT id FROM pharmacy_inventory 
      WHERE pharmacy_id = ${pharmacyId} AND medicine_id = ${medicineId}
    `

    if (existing && existing.length > 0) {
      // Update quantity
      const result = await sql`
        UPDATE pharmacy_inventory
        SET 
          quantity = quantity + ${quantity},
          unit_price = ${unitPrice},
          distributor_id = ${distributorId || null}
        WHERE id = ${existing[0].id}
        RETURNING *
      `

      return NextResponse.json({ 
        success: true, 
        item: result[0],
        message: "Medicine quantity updated"
      })
    } else {
      // Insert new medicine
      const result = await sql`
        INSERT INTO pharmacy_inventory 
        (pharmacy_id, medicine_id, quantity, unit_price, distributor_id)
        VALUES 
        (${pharmacyId}, ${medicineId}, ${quantity}, ${unitPrice}, ${distributorId || null})
        RETURNING *
      `

      return NextResponse.json({ 
        success: true, 
        item: result[0],
        message: "Medicine added to inventory"
      })
    }
  } catch (error: any) {
    console.error("[v0] Add pharmacy inventory error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
