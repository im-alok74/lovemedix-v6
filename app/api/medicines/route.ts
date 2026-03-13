import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Get all medicines
    const medicines = await sql`
      SELECT id, name, generic_name, strength, form, manufacturer, description, mrp
      FROM medicines
      WHERE status = 'active'
      ORDER BY name ASC
    `

    return NextResponse.json({ medicines })
  } catch (error: any) {
    console.error("[v0] Medicines error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
