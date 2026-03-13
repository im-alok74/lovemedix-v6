"use client"

import { useState } from "react"

export default function SignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    if (isSigningOut) return
    setIsSigningOut(true)
    try {
      const res = await fetch("/api/auth/signout", { method: "POST", headers: { Accept: "application/json" } })
      if (res.ok) {
        const data = await res.json().catch(() => ({ redirectTo: "/" }))
        // If server returned a redirectTo path use it, otherwise default to '/'
        const redirectTo = data?.redirectTo || "/"
        window.location.href = redirectTo
        return
      }
    } catch (error) {
      console.error("Signout failed", error)
    }

    // Fallback: go to homepage
    window.location.href = "/"
  }

  return (
    <button type="button" onClick={handleSignOut} className="w-full text-left" disabled={isSigningOut}>
      {isSigningOut ? "Signing out..." : "Sign Out"}
    </button>
  )
}
