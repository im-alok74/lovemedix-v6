import { signOut } from "@/lib/auth-server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    await signOut()
    // Use a root-relative redirect so the browser stays on the current origin
    const rootPath = "/"

    // If the request likely comes from JS (fetch/XHR) return JSON with redirect path
    const accept = request.headers.get("accept") || ""
    const xRequestedWith = request.headers.get("x-requested-with") || ""

    if (accept.includes("application/json") || xRequestedWith === "XMLHttpRequest") {
      return NextResponse.json({ success: true, redirectTo: rootPath })
    }

    // Otherwise perform a normal HTTP redirect using a root-relative Location
    return NextResponse.redirect(rootPath, { status: 302 })
  } catch (error) {
    console.error("[v0] Signout error:", error)
    return NextResponse.json({ error: "Failed to sign out" }, { status: 500 })
  }
}
