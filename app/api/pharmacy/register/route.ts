import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

function generateSessionToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      email,
      password,
      fullName,
      phone,
      pharmacyName,
      licenseNumber,
      gstNumber,
      address,
      city,
      state,
      pincode,
      is24x7,
    } = body

    // Validation
    if (!email || !password || !fullName || !phone) {
      return NextResponse.json(
        { error: "Missing required account information" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    if (!pharmacyName || !licenseNumber) {
      return NextResponse.json(
        { error: "Missing required pharmacy information" },
        { status: 400 }
      )
    }

    if (!address || !city || !state || !pincode) {
      return NextResponse.json(
        { error: "Missing required address information" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmail = await sql`
      SELECT id FROM users WHERE email = ${email}
    ` as any[]

    if (existingEmail && existingEmail.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    // Check if license number already exists
    const existingLicense = await sql`
      SELECT id FROM pharmacy_profiles WHERE license_number = ${licenseNumber}
    ` as any[]

    if (existingLicense && existingLicense.length > 0) {
      return NextResponse.json(
        { error: "License number already registered" },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const userResult = await sql`
      INSERT INTO users (email, password_hash, full_name, phone, user_type, status)
      VALUES (${email}, ${passwordHash}, ${fullName}, ${phone}, 'pharmacy', 'active')
      RETURNING id, email, full_name, phone, user_type, status
    ` as any[]

    const user = userResult[0]
    const userId = user.id

    // Create pharmacy profile
    const pharmacyResult = await sql`
      INSERT INTO pharmacy_profiles 
      (user_id, pharmacy_name, license_number, gst_number, address, city, state, pincode, is_24x7, verification_status)
      VALUES 
      (${userId}, ${pharmacyName}, ${licenseNumber}, ${gstNumber || null}, ${address}, ${city}, ${state}, ${pincode}, ${is24x7 || false}, 'pending')
      RETURNING id, pharmacy_name, license_number, verification_status
    ` as any[]

    // Create session
    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await sql`
      INSERT INTO sessions (user_id, session_token, expires_at)
      VALUES (${userId}, ${sessionToken}, ${expiresAt})
    `

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        userType: user.user_type,
      },
      pharmacy: {
        id: pharmacyResult[0].id,
        pharmacyName: pharmacyResult[0].pharmacy_name,
        verificationStatus: pharmacyResult[0].verification_status,
      },
    })
  } catch (error: any) {
    console.error("[v0] Pharmacy registration error:", error)

    if (error.message?.includes("duplicate key")) {
      return NextResponse.json(
        { error: "Email or license already registered" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    )
  }
}
