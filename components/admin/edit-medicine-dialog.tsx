'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

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

interface EditMedicineDialogProps {
  medicine: Medicine | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const CATEGORIES = ['Antibiotic', 'Antiviral', 'Antihistamine', 'Antacid', 'Pain Relief', 'Vitamin', 'Supplement', 'Other']
const FORMS = ['Tablet', 'Capsule', 'Liquid', 'Injection', 'Syrup', 'Powder', 'Cream', 'Ointment']

export function EditMedicineDialog({ medicine, isOpen, onClose, onSuccess }: EditMedicineDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    manufacturer: '',
    category: '',
    form: '',
    strength: '',
    mrp: '',
    requires_prescription: false,
    hsn_code: '',
    mfg_date: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    if (medicine && isOpen) {
      setFormData({
        name: medicine.name || '',
        generic_name: medicine.generic_name || '',
        manufacturer: medicine.manufacturer || '',
        category: medicine.category || '',
        form: medicine.form || '',
        strength: medicine.strength || '',
        mrp: medicine.mrp.toString() || '',
        requires_prescription: medicine.requires_prescription || false,
        hsn_code: medicine.hsn_code || '',
        mfg_date: medicine.mfg_date || ''
      })
    }
  }, [medicine, isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!medicine) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/medicines/${medicine.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          mrp: parseFloat(formData.mrp)
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Medicine updated successfully'
        })
        onSuccess()
        onClose()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update medicine',
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
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Medicine</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Medicine Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="generic_name">Generic Name</Label>
              <Input
                id="generic_name"
                name="generic_name"
                value={formData.generic_name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="form">Form</Label>
              <Select value={formData.form} onValueChange={(value) => handleSelectChange('form', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select form" />
                </SelectTrigger>
                <SelectContent>
                  {FORMS.map(form => (
                    <SelectItem key={form} value={form}>{form}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="strength">Strength</Label>
              <Input
                id="strength"
                name="strength"
                value={formData.strength}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="mrp">MRP (₹)</Label>
              <Input
                id="mrp"
                name="mrp"
                type="number"
                step="0.01"
                value={formData.mrp}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="hsn_code">HSN Code</Label>
              <Input
                id="hsn_code"
                name="hsn_code"
                value={formData.hsn_code}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="mfg_date">Manufacturing Date</Label>
              <Input
                id="mfg_date"
                name="mfg_date"
                type="date"
                value={formData.mfg_date}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="requires_prescription"
              name="requires_prescription"
              type="checkbox"
              checked={formData.requires_prescription}
              onChange={handleInputChange}
              className="h-4 w-4"
            />
            <Label htmlFor="requires_prescription" className="text-sm cursor-pointer">
              Requires Prescription
            </Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Medicine'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
