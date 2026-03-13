"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit2, Plus, Loader2 } from "lucide-react"

interface InventoryItem {
  id: number
  medicine_id: number
  name: string
  generic_name: string
  manufacturer: string
  batch_number: string
  mfg_date: string
  expiry_date: string
  mrp: number
  quantity: number
  unit_price: number
  amount: number
  hsn_code: string
  notes: string
  form: string
  strength: string
}

interface AddMedicineFormProps {
  // No props needed
}

export function AddMedicineForm({ onSuccess }: AddMedicineFormProps & { onSuccess?: () => void }) {
  const [medicines, setMedicines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    medicineId: "",
    batchNumber: "",
    mfgDate: "",
    expiryDate: "",
    mrp: "",
    quantity: "",
    unitPrice: "",
    hsnCode: "",
    notes: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    // Fetch medicines
    const fetchMedicines = async () => {
      try {
        const response = await fetch("/api/medicines")
        if (!response.ok) {
          throw new Error("Failed to fetch medicines")
        }
        const data = await response.json()
        setMedicines(data.medicines || [])
      } catch (error) {
        console.error("[v0] Error fetching medicines:", error)
        toast({
          title: "Error",
          description: "Failed to load medicines",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchMedicines()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/distributor/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineId: parseInt(formData.medicineId),
          batchNumber: formData.batchNumber,
          mfgDate: formData.mfgDate || null,
          expiryDate: formData.expiryDate,
          mrp: parseFloat(formData.mrp),
          quantity: parseInt(formData.quantity),
          unitPrice: parseFloat(formData.unitPrice),
          hsnCode: formData.hsnCode,
          notes: formData.notes,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        console.error("[v0] Add medicine error:", data)
        toast({
          title: "Error",
          description: data.error || "Failed to add medicine",
          variant: "destructive",
        })
        return
      }

      const data = await response.json()
      console.log("[v0] Medicine added successfully:", data)

      toast({
        title: "Success",
        description: "Medicine added to inventory",
      })

      // Reset form
      setFormData({
        medicineId: "",
        batchNumber: "",
        mfgDate: "",
        expiryDate: "",
        mrp: "",
        quantity: "",
        unitPrice: "",
        hsnCode: "",
        notes: "",
      })

      // Call parent callback to refresh inventory
      if (onSuccess) {
        onSuccess()
      }
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
    return <div className="text-center py-8">Loading medicines...</div>
  }

  return (
    <Card className="p-6 mb-8">
      <h2 className="text-lg font-semibold mb-6">Add Medicine to Inventory</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="medicineId">Medicine *</Label>
            <select
              id="medicineId"
              value={formData.medicineId}
              onChange={(e) =>
                setFormData({ ...formData, medicineId: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
              required
            >
              <option value="">Select Medicine</option>
              {medicines.map((med) => (
                <option key={med.id} value={med.id}>
                  {med.name} - {med.strength}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="batchNumber">Batch Number</Label>
            <Input
              id="batchNumber"
              value={formData.batchNumber}
              onChange={(e) =>
                setFormData({ ...formData, batchNumber: e.target.value })
              }
              placeholder="e.g., B12345"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="mfgDate">Mfg. Date</Label>
            <Input
              id="mfgDate"
              type="date"
              value={formData.mfgDate}
              onChange={(e) =>
                setFormData({ ...formData, mfgDate: e.target.value })
              }
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="expiryDate">Expiry Date *</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) =>
                setFormData({ ...formData, expiryDate: e.target.value })
              }
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="mrp">MRP (₹) *</Label>
            <Input
              id="mrp"
              type="number"
              step="0.01"
              value={formData.mrp}
              onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
              placeholder="0.00"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              placeholder="0"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="unitPrice">Unit Price (₹) *</Label>
            <Input
              id="unitPrice"
              type="number"
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) =>
                setFormData({ ...formData, unitPrice: e.target.value })
              }
              placeholder="0.00"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="hsnCode">HSN Code</Label>
            <Input
              id="hsnCode"
              value={formData.hsnCode}
              onChange={(e) =>
                setFormData({ ...formData, hsnCode: e.target.value })
              }
              placeholder="e.g., 3004"
              className="mt-1"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional notes"
              className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
              rows={3}
            />
          </div>
        </div>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add to Inventory
            </>
          )}
        </Button>
      </form>
    </Card>
  )
}

export function InventoryTable() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    fetchInventory()
  }, [refreshTrigger])

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/distributor/inventory")
      if (!response.ok) {
        throw new Error("Failed to fetch inventory")
      }
      const data = await response.json()
      console.log("[v0] Inventory fetched:", data)
      setInventory(data.inventory || [])
    } catch (error) {
      console.error("[v0] Error fetching inventory:", error)
      toast({
        title: "Error",
        description: "Failed to load inventory",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this medicine?")) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/distributor/inventory/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        console.error("[v0] Delete error:", data)
        toast({
          title: "Error",
          description: data.error || "Failed to delete",
          variant: "destructive",
        })
        return
      }

      const data = await response.json()
      console.log("[v0] Medicine deleted:", data)

      toast({ title: "Success", description: data.message })
      setInventory(inventory.filter((item) => item.id !== id))
    } catch (error) {
      console.error("[v0] Delete error:", error)
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  const isExpiringSoon = (expiryDate: string) => {
    const now = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  if (loading) {
    return <div className="text-center py-8">Loading inventory...</div>
  }

  if (inventory.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No medicines in inventory yet</p>
      </Card>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Medicine Name</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventory.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.strength} - {item.form}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-sm">{item.batch_number || "-"}</TableCell>
              <TableCell className="font-medium">{item.quantity}</TableCell>
              <TableCell className="text-sm">₹{item.unit_price.toFixed(2)}</TableCell>
              <TableCell className="font-medium">
                ₹{item.amount?.toFixed(2) || (item.quantity * item.unit_price).toFixed(2)}
              </TableCell>
              <TableCell className="text-sm">
                {new Date(item.expiry_date).toLocaleDateString("en-IN")}
              </TableCell>
              <TableCell>
                {isExpired(item.expiry_date) ? (
                  <Badge variant="destructive" className="text-xs">
                    Expired
                  </Badge>
                ) : isExpiringSoon(item.expiry_date) ? (
                  <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                    Expiring Soon
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                    Active
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                  className="p-1 text-destructive hover:bg-destructive/10 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
