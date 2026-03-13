"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function AdminUserActions({ userId }: { userId: number }) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const patchStatus = async (status: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: "Success", description: `User ${status}` })
        router.refresh()
      } else {
        toast({ title: "Error", description: data.error || "Failed to update user", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteUser = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" })
      const data = await res.json()
      if (res.ok) {
        toast({ title: "Success", description: "User deleted" })
        router.refresh()
      } else {
        toast({ title: "Error", description: data.error || "Failed to delete user", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={() => patchStatus("active")} disabled={isLoading}>Activate</Button>
      <Button size="sm" variant="destructive" onClick={() => patchStatus("suspended")} disabled={isLoading}>Pause</Button>
      <Button size="sm" variant="ghost" onClick={deleteUser} disabled={isLoading}>Remove</Button>
    </div>
  )
}
