"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Trash2, Edit2, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Medicine {
  id: number
  medicine_name: string
  generic_name?: string
  manufacturer?: string
  hsn_code: string
  batch_number: string
  mfg_date?: string
  expiry_date: string
  mrp: number
  quantity: number
  unit_price: number
  amount: number
  notes?: string
  image_url?: string
  created_at: string
}

export default function PharmacyMedicinesList() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchMedicines()
  }, [])

  const fetchMedicines = async () => {
    try {
      const response = await fetch("/api/pharmacy/medicines")
      const data = await response.json()

      if (response.ok) {
        setMedicines(data.medicines || [])
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch medicines",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching medicines:", error)
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this medicine?")) return

    try {
      const response = await fetch(`/api/pharmacy/medicines/${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Medicine removed successfully"
        })
        fetchMedicines()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to delete medicine",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      })
    }
  }

  const handleEditClick = (medicine: Medicine) => {
    setEditingMedicine(medicine)
    setShowEditDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!editingMedicine) return

    try {
      const response = await fetch(`/api/pharmacy/medicines/${editingMedicine.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hsnCode: editingMedicine.hsn_code,
          batchNumber: editingMedicine.batch_number,
          mfgDate: editingMedicine.mfg_date,
          expiryDate: editingMedicine.expiry_date,
          mrp: editingMedicine.mrp,
          quantity: editingMedicine.quantity,
          unitPrice: editingMedicine.unit_price,
          notes: editingMedicine.notes
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Medicine updated successfully"
        })
        setShowEditDialog(false)
        fetchMedicines()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to update medicine",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      })
    }
  }

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  const isExpiringSoon = (expiryDate: string) => {
    const expiryTime = new Date(expiryDate).getTime()
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).getTime()
    return expiryTime < thirtyDaysFromNow && !isExpired(expiryDate)
  }

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading medicines...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medicines ({medicines.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {medicines.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No medicines added yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine Name</TableHead>
                  <TableHead>HSN</TableHead>
                  <TableHead>Batch No</TableHead>
                  <TableHead>EXP Date</TableHead>
                  <TableHead>MRP</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicines.map((medicine) => (
                  <TableRow key={medicine.id}>
                    <TableCell className="font-medium">{medicine.medicine_name}</TableCell>
                    <TableCell>{medicine.hsn_code}</TableCell>
                    <TableCell>{medicine.batch_number}</TableCell>
                    <TableCell>{new Date(medicine.expiry_date).toLocaleDateString()}</TableCell>
                    <TableCell>₹{medicine.mrp}</TableCell>
                    <TableCell>{medicine.quantity}</TableCell>
                    <TableCell>₹{medicine.unit_price}</TableCell>
                    <TableCell className="font-bold">₹{medicine.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {isExpired(medicine.expiry_date) ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : isExpiringSoon(medicine.expiry_date) ? (
                        <Badge className="bg-yellow-500">Expiring Soon</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(medicine)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(medicine.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Medicine</DialogTitle>
          </DialogHeader>
          {editingMedicine && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>HSN Code</Label>
                  <Input
                    value={editingMedicine.hsn_code}
                    onChange={(e) =>
                      setEditingMedicine({ ...editingMedicine, hsn_code: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Batch Number</Label>
                  <Input
                    value={editingMedicine.batch_number}
                    onChange={(e) =>
                      setEditingMedicine({ ...editingMedicine, batch_number: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>MFG Date</Label>
                  <Input
                    type="date"
                    value={editingMedicine.mfg_date || ""}
                    onChange={(e) =>
                      setEditingMedicine({ ...editingMedicine, mfg_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>EXP Date</Label>
                  <Input
                    type="date"
                    value={editingMedicine.expiry_date}
                    onChange={(e) =>
                      setEditingMedicine({ ...editingMedicine, expiry_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>MRP</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingMedicine.mrp}
                    onChange={(e) =>
                      setEditingMedicine({ ...editingMedicine, mrp: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={editingMedicine.quantity}
                    onChange={(e) =>
                      setEditingMedicine({ ...editingMedicine, quantity: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingMedicine.unit_price}
                    onChange={(e) =>
                      setEditingMedicine({ ...editingMedicine, unit_price: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label>Amount</Label>
                  <div className="text-2xl font-bold text-primary py-2">
                    ₹{(editingMedicine.quantity * editingMedicine.unit_price).toFixed(2)}
                  </div>
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <textarea
                  value={editingMedicine.notes || ""}
                  onChange={(e) =>
                    setEditingMedicine({ ...editingMedicine, notes: e.target.value })
                  }
                  className="w-full border rounded-md p-2 min-h-20"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
