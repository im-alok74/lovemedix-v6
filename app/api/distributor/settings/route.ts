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
    const profile = await sql`
      SELECT * FROM distributor_profiles WHERE user_id = ${user.id}
    `

    if (profile.length === 0) {
      return NextResponse.json({ error: "Distributor profile not found" }, { status: 404 })
    }

    return NextResponse.json({ profile: profile[0], user })
  } catch (error: any) {
    console.error("[v0] Get settings error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || user.user_type !== "distributor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      companyName,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      stateName,
      postalCode,
      warehouseLocation,
      deliveryRadiusKm,
      bankAccountHolder,
      bankAccountNumber,
      bankIfscCode,
      paymentTerms,
      creditLimit,
    } = body

    // Get distributor profile
    const distributorProfile = await sql`
      SELECT id FROM distributor_profiles WHERE user_id = ${user.id}
    `

    if (distributorProfile.length === 0) {
      return NextResponse.json({ error: "Distributor profile not found" }, { status: 404 })
    }

    // Update profile
    const result = await sql`
      UPDATE distributor_profiles
      SET 
        company_name = ${companyName || undefined},
        phone_number = ${phoneNumber || undefined},
        address_line1 = ${addressLine1 || undefined},
        address_line2 = ${addressLine2 || undefined},
        city = ${city || undefined},
        state_province = ${stateName || undefined},
        postal_code = ${postalCode || undefined},
        warehouse_location = ${warehouseLocation || undefined},
        delivery_radius_km = ${deliveryRadiusKm || undefined},
        bank_account_holder = ${bankAccountHolder || undefined},
        bank_account_number = ${bankAccountNumber || undefined},
        bank_ifsc_code = ${bankIfscCode || undefined},
        payment_terms = ${paymentTerms || undefined},
        credit_limit = ${creditLimit || undefined},
        updated_at = NOW()
      WHERE user_id = ${user.id}
      RETURNING *
    `

    return NextResponse.json({ 
      success: true, 
      profile: result[0],
      message: "Settings updated successfully"
    })
  } catch (error: any) {
    console.error("[v0] Update settings error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
