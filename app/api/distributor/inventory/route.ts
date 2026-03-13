import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || user.user_type !== "distributor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get distributor profile
    const distributorProfile = await sql`
      SELECT id FROM distributor_profiles WHERE user_id = ${user.id}
    `

    if (distributorProfile.length === 0) {
      return NextResponse.json({ error: "Distributor profile not found" }, { status: 404 })
    }

    const distributorId = distributorProfile[0].id

    // Get inventory with medicine details
    const inventory = await sql`
      SELECT 
        dm.id,
        dm.medicine_id,
        dm.batch_number,
        dm.mfg_date,
        dm.expiry_date,
        dm.mrp,
        dm.quantity,
        dm.unit_price,
        dm.amount,
        dm.hsn_code,
        dm.notes,
        dm.created_at,
        m.name,
        m.generic_name,
        m.manufacturer,
        m.form,
        m.strength,
        m.pack_size,
        m.requires_prescription
      FROM distributor_medicines dm
      JOIN medicines m ON dm.medicine_id = m.id
      WHERE dm.distributor_id = ${distributorId}
      ORDER BY dm.created_at DESC
    `

    return NextResponse.json({ inventory })
  } catch (error: any) {
    console.error("[v0] Distributor inventory error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || user.user_type !== "distributor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      medicineId,
      batchNumber,
      mfgDate,
      expiryDate,
      mrp,
      quantity,
      unitPrice,
      hsnCode,
      notes,
    } = body

    // Validate required fields
    if (!medicineId || !expiryDate || !mrp || !quantity || !unitPrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get distributor profile
    const distributorProfile = await sql`
      SELECT id FROM distributor_profiles WHERE user_id = ${user.id}
    `

    if (distributorProfile.length === 0) {
      return NextResponse.json({ error: "Distributor profile not found" }, { status: 404 })
    }

    const distributorId = distributorProfile[0].id

    // Check if medicine exists
    const medicine = await sql`
      SELECT id, name FROM medicines WHERE id = ${medicineId}
    `

    if (medicine.length === 0) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 })
    }

    // Calculate amount
    const amount = quantity * unitPrice

    // Insert or update inventory
    const result = await sql`
      INSERT INTO distributor_medicines 
      (distributor_id, medicine_id, batch_number, mfg_date, expiry_date, mrp, quantity, unit_price, amount, hsn_code, notes)
      VALUES 
      (${distributorId}, ${medicineId}, ${batchNumber || null}, ${mfgDate || null}, ${expiryDate}, ${mrp}, ${quantity}, ${unitPrice}, ${amount}, ${hsnCode || null}, ${notes || null})
      RETURNING *
    `

    return NextResponse.json({ 
      success: true, 
      item: result[0],
      message: "Medicine added to inventory"
    })
  } catch (error: any) {
    console.error("[v0] Add inventory error:", error)

    if (error.message?.includes("duplicate")) {
      return NextResponse.json(
        { error: "This medicine with same batch already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
