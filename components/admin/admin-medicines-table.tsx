'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Trash2, Edit2, Plus, Search } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import AddMedicineDialog from '@/components/admin/AddMedicineDialog'
import EditMedicineDialog from '@/components/admin/EditMedicineDialog'

interface Medicine {
  id: number
  name: string
  generic_name: string
  manufacturer: string
  category: string
  form?: string
  strength?: string
  mrp: number
  requires_prescription: boolean
  hsn_code?: string
  mfg_date?: string
}

interface AdminMedicinesTableProps {
  initialMedicines: Medicine[]
}

export function AdminMedicinesTable({ initialMedicines }: AdminMedicinesTableProps) {
  const router = useRouter()
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [medicineToDelete, setMedicineToDelete] = useState<Medicine | null>(null)
  const { toast } = useToast()
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleAddSuccess = (newMedicine: Medicine) => {
    setMedicines([...medicines, newMedicine])
    toast({
      title: 'Success',
      description: 'Medicine added successfully'
    })
  }

  const handleEditSuccess = (updatedMedicine: Medicine) => {
    setMedicines(medicines.map(m => m.id === updatedMedicine.id ? updatedMedicine : m))
    toast({
      title: 'Success',
      description: 'Medicine updated successfully'
    })
  }

  const filteredMedicines = medicines.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.generic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (medicine: Medicine) => {
    router.push(`/admin/medicines/form?id=${medicine.id}`)
  }

  const handleDelete = (medicine: Medicine) => {
    setMedicineToDelete(medicine)
  }

  const confirmDelete = async () => {
    if (!medicineToDelete) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/medicines/${medicineToDelete.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setMedicines(medicines.filter(m => m.id !== medicineToDelete.id))
        toast({
          title: 'Success',
          description: 'Medicine deleted successfully'
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete medicine',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
      setMedicineToDelete(null)
    }
  }



  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Medicines Management</CardTitle>
            <Button onClick={() => router.push('/admin/medicines/form')} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Medicine
            </Button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medicines..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine Name</TableHead>
                <TableHead>Generic Name</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Form</TableHead>
                <TableHead>Strength</TableHead>
                <TableHead>MRP</TableHead>
                <TableHead>Prescription</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedicines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    {searchTerm ? 'No medicines found matching your search.' : 'No medicines added yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMedicines.map((medicine) => (
                  <TableRow key={medicine.id}>
                    <TableCell className="font-medium">{medicine.name}</TableCell>
                    <TableCell>{medicine.generic_name}</TableCell>
                    <TableCell>{medicine.manufacturer}</TableCell>
                    <TableCell>{medicine.category}</TableCell>
                    <TableCell>{medicine.form || 'N/A'}</TableCell>
                    <TableCell>{medicine.strength || 'N/A'}</TableCell>
                    <TableCell>₹{parseFloat(medicine.mrp.toString()).toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded ${medicine.requires_prescription ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {medicine.requires_prescription ? 'Yes' : 'No'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(medicine)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(medicine)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!medicineToDelete} onOpenChange={() => setMedicineToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medicine</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{medicineToDelete?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
