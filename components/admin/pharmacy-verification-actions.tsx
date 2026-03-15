"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function PharmacyVerificationActions({ pharmacyId }: { pharmacyId: number }) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const updateStatus = async (status: string) => {
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/admin/pharmacies/${pharmacyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationStatus: status }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: `Pharmacy has been ${status}`,
        })
        // Wait a moment before refreshing to ensure database is updated
        setTimeout(() => {
          router.refresh()
        }, 500)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update status",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button 
        size="sm" 
        onClick={() => updateStatus("verified")}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Verify"}
      </Button>
      <Button 
        size="sm" 
        variant="destructive" 
        onClick={() => updateStatus("rejected")}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Reject"}
      </Button>
    </div>
  )
}
