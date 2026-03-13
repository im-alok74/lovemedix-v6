import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { sql } from "@/lib/db"

export async function PATCH(
  request: Request,
  { params }: { params: any }
) {
  try {
    await requireRole(["admin"])

    const { status } = await request.json()

    // `params` may be a Promise in some Next.js environments — unwrap if needed
    const resolvedParams = typeof params?.then === "function" ? await params : params
    const rawId = resolvedParams?.orderId
    const numericId = Number(rawId)

    // Determine whether the caller provided a numeric DB id or an order_number string
    const isNumericId = !isNaN(numericId)

    console.log("[ADMIN ORDERS] PATCH called with:", { rawId, numericId, isNumericId, status })

    const allowedStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ]

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    let result
    if (isNumericId) {
      result = await sql`
        UPDATE orders
        SET order_status = ${status}, updated_at = NOW()
        WHERE id = ${numericId}
        RETURNING id
      `
    } else {
      // Treat param as order_number
      result = await sql`
        UPDATE orders
        SET order_status = ${status}, updated_at = NOW()
        WHERE order_number = ${rawId}
        RETURNING id
      `
    }

    console.log("[ADMIN ORDERS] SQL update result:", result)

    if (result.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    try {
      revalidatePath("/admin/orders")
    } catch (e) {
      // revalidatePath can be optional; log but don't fail the request
      console.error("[ADMIN ORDERS] revalidatePath failed:", e)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[ADMIN ORDERS] Update error:", error)
    if (error?.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
