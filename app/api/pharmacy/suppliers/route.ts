import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || user.user_type !== "pharmacy") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const medicineId = searchParams.get("medicineId")
    const medicineName = searchParams.get("search")

    let query = `
      SELECT DISTINCT
        dp.id as distributor_id,
        dp.company_name,
        dp.city,
        dp.state_province,
        dp.phone_number,
        dm.id as medicine_id,
        dm.batch_number,
        dm.mrp,
        dm.unit_price,
        dm.quantity,
        dm.expiry_date,
        m.name as medicine_name,
        m.strength,
        m.form,
        m.generic_name,
        m.manufacturer
      FROM distributor_medicines dm
      JOIN medicines m ON dm.medicine_id = m.id
      JOIN distributor_profiles dp ON dm.distributor_id = dp.id
      JOIN users u ON dp.user_id = u.id
      WHERE dp.verification_status = 'verified'
      AND dm.quantity > 0
      AND dm.expiry_date > NOW()
    `

    const params: any[] = []

    if (medicineId) {
      query += " AND dm.medicine_id = $" + (params.length + 1)
      params.push(parseInt(medicineId))
    }

    if (medicineName) {
      query += " AND (m.name ILIKE $" + (params.length + 1) + " OR m.generic_name ILIKE $" + (params.length + 1) + ")"
      params.push("%" + medicineName + "%")
    }

    query += " ORDER BY dp.company_name ASC, dm.unit_price ASC"

    const suppliers = await sql(query, params)

    return NextResponse.json({ suppliers })
  } catch (error: any) {
    console.error("[v0] Pharmacy suppliers error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
