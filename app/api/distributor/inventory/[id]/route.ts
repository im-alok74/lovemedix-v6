import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-server"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Get specific inventory item
    const item = await sql`
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
        m.name,
        m.generic_name,
        m.manufacturer,
        m.form,
        m.strength
      FROM distributor_medicines dm
      JOIN medicines m ON dm.medicine_id = m.id
      WHERE dm.id = ${parseInt(id)} AND dm.distributor_id = ${distributorProfile[0].id}
    `

    if (item.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json({ item: item[0] })
  } catch (error: any) {
    console.error("[v0] Get inventory item error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    if (!user || user.user_type !== "distributor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { quantity, unitPrice, expiryDate, notes } = body

    // Get distributor profile
    const distributorProfile = await sql`
      SELECT id FROM distributor_profiles WHERE user_id = ${user.id}
    `

    if (distributorProfile.length === 0) {
      return NextResponse.json({ error: "Distributor profile not found" }, { status: 404 })
    }

    // Verify ownership
    const item = await sql`
      SELECT * FROM distributor_medicines 
      WHERE id = ${parseInt(id)} AND distributor_id = ${distributorProfile[0].id}
    `

    if (item.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Calculate new amount
    const newQuantity = quantity ?? item[0].quantity
    const newUnitPrice = unitPrice ?? item[0].unit_price
    const amount = newQuantity * newUnitPrice

    // Update inventory
    const result = await sql`
      UPDATE distributor_medicines
      SET quantity = ${newQuantity}, 
          unit_price = ${newUnitPrice},
          amount = ${amount},
          expiry_date = ${expiryDate || item[0].expiry_date},
          notes = ${notes || item[0].notes},
          updated_at = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING *
    `

    return NextResponse.json({ 
      success: true, 
      item: result[0],
      message: "Inventory updated successfully"
    })
  } catch (error: any) {
    console.error("[v0] Update inventory error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Verify ownership
    const item = await sql`
      SELECT * FROM distributor_medicines 
      WHERE id = ${parseInt(id)} AND distributor_id = ${distributorProfile[0].id}
    `

    if (item.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Delete inventory item
    await sql`
      DELETE FROM distributor_medicines WHERE id = ${parseInt(id)}
    `

    return NextResponse.json({ 
      success: true,
      message: "Medicine removed from inventory"
    })
  } catch (error: any) {
    console.error("[v0] Delete inventory error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
