import { getCurrentUser } from "@/lib/auth-server"
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import crypto from "crypto"

const UPLOAD_DIR = join(process.cwd(), "public", "prescriptions")

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const doctorName = formData.get("doctorName") as string
    const hospitalName = formData.get("hospitalName") as string
    const prescriptionDate = formData.get("prescriptionDate") as string
    const notes = formData.get("notes") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    // Ensure upload directory exists
    await ensureUploadDir()

    // Generate unique filename
    const fileExtension = file.name.split(".").pop()
    const filename = `${crypto.randomBytes(16).toString("hex")}.${fileExtension}`
    const filepath = join(UPLOAD_DIR, filename)

    // Convert file to buffer and write to filesystem
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Save prescription to database
    const prescriptionImageUrl = `/prescriptions/${filename}`

    const result = await sql`
      INSERT INTO prescriptions 
        (customer_id, doctor_name, hospital_name, prescription_date, prescription_image, notes)
      VALUES 
        (${user.id}, ${doctorName || null}, ${hospitalName || null}, ${prescriptionDate || null}, ${prescriptionImageUrl}, ${notes || null})
      RETURNING *
    `

    return NextResponse.json({ 
      success: true, 
      prescription: result[0],
      imageUrl: prescriptionImageUrl 
    })
  } catch (error) {
    console.error("[v0] Upload prescription error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
