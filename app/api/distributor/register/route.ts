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
      confirmPassword,
      fullName,
      phone,
      companyName,
      licenseNumber,
      gstNumber,
      streetAddress,
      landmark,
      city,
      state,
      pincode,
      serviceAreas,
    } = body

    // Validation
    if (!email || !password || !fullName || !phone) {
      return NextResponse.json(
        { error: "Missing required account information" },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    if (!companyName) {
      return NextResponse.json(
        { error: "Missing company name" },
        { status: 400 }
      )
    }

    // GST is required, license is optional
    if (!gstNumber) {
      return NextResponse.json(
        { error: "GST number is required" },
        { status: 400 }
      )
    }

    if (!streetAddress || !city || !state || !pincode) {
      return NextResponse.json(
        { error: "Missing required address information" },
        { status: 400 }
      )
    }

    // GST Format Validation: 15-digit GSTIN
    if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(gstNumber)) {
      return NextResponse.json(
        { error: "Invalid GST format" },
        { status: 400 }
      )
    }

    // Pincode Format Validation
    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { error: "Invalid pincode format" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmail = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingEmail.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    // Check if license number already exists (optional field)
    if (licenseNumber) {
      const existingLicense = await sql`
        SELECT id FROM distributor_profiles WHERE license_number = ${licenseNumber}
      ` as any[]

      if (existingLicense && existingLicense.length > 0) {
        return NextResponse.json(
          { error: "License number already registered" },
          { status: 409 }
        )
      }
    }

    // Check if GST already exists
    const existingGST = await sql`
      SELECT id FROM distributor_profiles WHERE gst_number = ${gstNumber}
    ` as any[]

    if (existingGST && existingGST.length > 0) {
      return NextResponse.json(
        { error: "GST number already registered" },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const userResult = await sql`
      INSERT INTO users (email, password_hash, full_name, phone, user_type)
      VALUES (${email}, ${passwordHash}, ${fullName}, ${phone}, 'distributor')
      RETURNING id, email, full_name, phone, user_type, status
    `

    const user = userResult[0]
    const userId = user.id

    // Generate a default license number if not provided (format: DL-GSTXXX-TIMESTAMP)
    const finalLicenseNumber = licenseNumber || `DL-${gstNumber.slice(-3)}-${Date.now()}`

    // Create distributor profile
    const distributorResult = await sql`
      INSERT INTO distributor_profiles 
      (user_id, company_name, license_number, gst_number, address, city, state, pincode, verification_status)
      VALUES 
      (${userId}, ${companyName}, ${finalLicenseNumber}, ${gstNumber}, ${streetAddress}, ${city}, ${state}, ${pincode}, 'pending')
      RETURNING id
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
      distributor: {
        id: distributorResult[0].id,
        companyName,
        verificationStatus: "pending",
      },
    })
  } catch (error: any) {
    console.error("[v0] Distributor registration error:", error)

    if (error.message?.includes("duplicate key")) {
      return NextResponse.json(
        { error: "Email or license already registered" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
