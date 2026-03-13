"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save } from "lucide-react"

interface DistributorSettings {
  id: number
  company_name: string
  phone_number: string
  address_line1: string
  address_line2: string
  city: string
  state_province: string
  postal_code: string
  warehouse_location: string
  delivery_radius_km: number
  bank_account_holder: string
  bank_account_number: string
  bank_ifsc_code: string
  payment_terms: string
  credit_limit: number
}

export function SettingsForm() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<DistributorSettings>>({})
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/distributor/settings")
      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to load settings",
          variant: "destructive",
        })
        return
      }

      setFormData(data.profile)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    field: keyof DistributorSettings,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/distributor/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: formData.company_name,
          phoneNumber: formData.phone_number,
          addressLine1: formData.address_line1,
          addressLine2: formData.address_line2,
          city: formData.city,
          stateName: formData.state_province,
          postalCode: formData.postal_code,
          warehouseLocation: formData.warehouse_location,
          deliveryRadiusKm: formData.delivery_radius_km,
          bankAccountHolder: formData.bank_account_holder,
          bankAccountNumber: formData.bank_account_number,
          bankIfscCode: formData.bank_ifsc_code,
          paymentTerms: formData.payment_terms,
          creditLimit: formData.credit_limit,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to update settings",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Settings updated successfully",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Company Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Company Information</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={formData.company_name || ""}
              onChange={(e) =>
                handleChange("company_name", e.target.value)
              }
              className="mt-1"
              disabled
            />
            <p className="text-xs text-muted-foreground mt-1">
              Cannot be changed - part of registration
            </p>
          </div>

          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phone_number || ""}
              onChange={(e) =>
                handleChange("phone_number", e.target.value)
              }
              className="mt-1"
              placeholder="Enter contact number"
            />
          </div>
        </div>
      </Card>

      {/* Address Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Address Information</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="address1">Address Line 1</Label>
            <Input
              id="address1"
              value={formData.address_line1 || ""}
              onChange={(e) =>
                handleChange("address_line1", e.target.value)
              }
              className="mt-1"
              placeholder="Street address"
            />
          </div>

          <div>
            <Label htmlFor="address2">Address Line 2</Label>
            <Input
              id="address2"
              value={formData.address_line2 || ""}
              onChange={(e) =>
                handleChange("address_line2", e.target.value)
              }
              className="mt-1"
              placeholder="Apt, suite, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city || ""}
                onChange={(e) => handleChange("city", e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={formData.state_province || ""}
                onChange={(e) =>
                  handleChange("state_province", e.target.value)
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="postal">Postal Code</Label>
              <Input
                id="postal"
                value={formData.postal_code || ""}
                onChange={(e) =>
                  handleChange("postal_code", e.target.value)
                }
                className="mt-1"
                placeholder="6 digit code"
              />
            </div>

            <div>
              <Label htmlFor="warehouse">Warehouse Location</Label>
              <Input
                id="warehouse"
                value={formData.warehouse_location || ""}
                onChange={(e) =>
                  handleChange("warehouse_location", e.target.value)
                }
                className="mt-1"
                placeholder="Warehouse address/area"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="radius">Delivery Radius (km)</Label>
            <Input
              id="radius"
              type="number"
              value={formData.delivery_radius_km || ""}
              onChange={(e) =>
                handleChange(
                  "delivery_radius_km",
                  parseInt(e.target.value) || 0
                )
              }
              className="mt-1"
              placeholder="50"
            />
          </div>
        </div>
      </Card>

      {/* Banking Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Banking Information</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="accountHolder">Bank Account Holder Name</Label>
            <Input
              id="accountHolder"
              value={formData.bank_account_holder || ""}
              onChange={(e) =>
                handleChange("bank_account_holder", e.target.value)
              }
              className="mt-1"
              placeholder="Account holder name"
            />
          </div>

          <div>
            <Label htmlFor="accountNumber">Bank Account Number</Label>
            <Input
              id="accountNumber"
              type="password"
              value={formData.bank_account_number || ""}
              onChange={(e) =>
                handleChange("bank_account_number", e.target.value)
              }
              className="mt-1"
              placeholder="••••••••••••••••"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your account number is secure and encrypted
            </p>
          </div>

          <div>
            <Label htmlFor="ifsc">IFSC Code</Label>
            <Input
              id="ifsc"
              value={formData.bank_ifsc_code || ""}
              onChange={(e) =>
                handleChange("bank_ifsc_code", e.target.value)
              }
              className="mt-1"
              placeholder="e.g., SBIN0001234"
            />
          </div>

          <div>
            <Label htmlFor="paymentTerms">Payment Terms</Label>
            <Input
              id="paymentTerms"
              value={formData.payment_terms || ""}
              onChange={(e) =>
                handleChange("payment_terms", e.target.value)
              }
              className="mt-1"
              placeholder="e.g., Net 30, COD"
            />
          </div>

          <div>
            <Label htmlFor="creditLimit">Credit Limit (₹)</Label>
            <Input
              id="creditLimit"
              type="number"
              step="0.01"
              value={formData.credit_limit || ""}
              onChange={(e) =>
                handleChange("credit_limit", parseFloat(e.target.value) || 0)
              }
              className="mt-1"
              placeholder="0.00"
            />
          </div>
        </div>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={submitting} size="lg">
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
