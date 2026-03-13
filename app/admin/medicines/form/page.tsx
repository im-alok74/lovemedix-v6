'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ChevronLeft, Upload, X, Check } from 'lucide-react'

interface FormData {
  name: string
  generic_name: string
  manufacturer: string
  category: string
  form: string
  strength: string
  mrp: string
  requires_prescription: boolean
  hsn_code: string
  mfg_date?: string
  description?: string
  photo_url?: string
}

const CATEGORIES = ['Antibiotic', 'Antiviral', 'Antihistamine', 'Antacid', 'Pain Relief', 'Vitamin', 'Supplement', 'Other']
const FORMS = ['Tablet', 'Capsule', 'Liquid', 'Injection', 'Syrup', 'Powder', 'Cream', 'Ointment']

export default function MedicineFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const medicineId = searchParams.get('id')
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMedicine, setIsLoadingMedicine] = useState(!!medicineId)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    generic_name: '',
    manufacturer: '',
    category: '',
    form: '',
    strength: '',
    mrp: '',
    requires_prescription: false,
    hsn_code: '',
    mfg_date: '',
    description: '',
    photo_url: ''
  })

  // Load medicine data if editing
  useEffect(() => {
    if (medicineId) {
      const loadMedicine = async () => {
        try {
          const response = await fetch(`/api/admin/medicines/${medicineId}`)
          const data = await response.json()
          
          if (data.medicine) {
            setFormData({
              name: data.medicine.name || '',
              generic_name: data.medicine.generic_name || '',
              manufacturer: data.medicine.manufacturer || '',
              category: data.medicine.category || '',
              form: data.medicine.form || '',
              strength: data.medicine.strength || '',
              mrp: data.medicine.mrp?.toString() || '',
              requires_prescription: data.medicine.requires_prescription || false,
              hsn_code: data.medicine.hsn_code || '',
              mfg_date: data.medicine.mfg_date || '',
              description: data.medicine.description || '',
              photo_url: data.medicine.photo_url || ''
            })
            if (data.medicine.photo_url) {
              setPhotoPreview(data.medicine.photo_url)
            }
          }
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to load medicine details',
            variant: 'destructive'
          })
        } finally {
          setIsLoadingMedicine(false)
        }
      }
      loadMedicine()
    }
  }, [medicineId, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    const checked = (e.target as HTMLInputElement).checked
    
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPhotoPreview(result)
        setFormData(prev => ({
          ...prev,
          photo_url: result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Auto-fill N/A for empty fields
  const fillEmptyFieldsWithNA = () => {
    setFormData(prev => ({
      ...prev,
      form: prev.form || 'N/A',
      strength: prev.strength || 'N/A',
      hsn_code: prev.hsn_code || 'N/A',
      mfg_date: prev.mfg_date || 'N/A',
      description: prev.description || 'N/A'
    }))
    toast({
      title: 'Success',
      description: 'Empty fields filled with N/A'
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.name || !formData.generic_name || !formData.manufacturer || !formData.category || !formData.mrp) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      const url = medicineId ? `/api/admin/medicines/${medicineId}` : '/api/admin/medicines'
      const method = medicineId ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
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
          description: medicineId ? 'Medicine updated successfully' : 'Medicine added successfully'
        })
        router.push('/admin/medicines')
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save medicine',
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

  if (isLoadingMedicine) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading medicine details...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {medicineId ? 'Edit Medicine' : 'Add New Medicine'}
            </h1>
            <p className="text-muted-foreground">
              {medicineId ? 'Update medicine details' : 'Fill in all the details to add a new medicine'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Section */}
          <Card className="border border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Medicine Photo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {photoPreview ? (
                <div className="relative w-full h-56 md:h-64 bg-muted rounded-xl overflow-hidden flex items-center justify-center border-2 border-border">
                  <img
                    src={photoPreview || "/placeholder.svg"}
                    alt="Medicine preview"
                    className="w-full h-full object-contain p-4"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview('')
                      setFormData(prev => ({ ...prev, photo_url: '' }))
                    }}
                    className="absolute top-2 right-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground p-1 rounded-md"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => document.getElementById('photo')?.click()}
                  className="w-full h-48 md:h-56 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              )}
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="border border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Medicine Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Paracetamol"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="generic_name" className="text-sm font-medium">
                    Generic Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="generic_name"
                    name="generic_name"
                    placeholder="e.g., Acetaminophen"
                    value={formData.generic_name}
                    onChange={handleInputChange}
                    className="h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manufacturer" className="text-sm font-medium">
                    Manufacturer <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="manufacturer"
                    name="manufacturer"
                    placeholder="e.g., GSK"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                    className="h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Add medicine description, uses, side effects, and precautions"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card className="border border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mfg_date" className="text-sm font-medium">
                    Manufacturing Date
                  </Label>
                  <Input
                    id="mfg_date"
                    name="mfg_date"
                    type="date"
                    value={formData.mfg_date || ''}
                    onChange={handleInputChange}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-muted transition-colors">
                    <input
                      id="requires_prescription"
                      name="requires_prescription"
                      type="checkbox"
                      checked={formData.requires_prescription}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded"
                    />
                    <span className="text-sm font-medium">Requires Prescription</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dosage, Pricing & Codes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dosage & Form */}
            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Dosage & Form</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="form" className="text-sm font-medium">
                    Form
                  </Label>
                  <Select value={formData.form} onValueChange={(value) => handleSelectChange('form', value)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select form" />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMS.map(form => (
                        <SelectItem key={form} value={form}>{form}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="strength" className="text-sm font-medium">
                    Strength
                  </Label>
                  <Input
                    id="strength"
                    name="strength"
                    placeholder="e.g., 500mg"
                    value={formData.strength}
                    onChange={handleInputChange}
                    className="h-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Pricing & Codes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mrp" className="text-sm font-medium">
                    MRP (₹) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="mrp"
                    name="mrp"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.mrp}
                    onChange={handleInputChange}
                    className="h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hsn_code" className="text-sm font-medium">
                    HSN Code
                  </Label>
                  <Input
                    id="hsn_code"
                    name="hsn_code"
                    placeholder="e.g., 3004"
                    value={formData.hsn_code}
                    onChange={handleInputChange}
                    className="h-10"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="flex items-end">
                  <div className="flex items-center gap-2">
                    <input
                      id="requires_prescription"
                      name="requires_prescription"
                      type="checkbox"
                      checked={formData.requires_prescription}
                      onChange={handleInputChange}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="requires_prescription" className="text-sm cursor-pointer mb-0">
                      Requires Prescription
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auto-fill Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full bg-transparent"
            onClick={fillEmptyFieldsWithNA}
            disabled={isLoading}
          >
            Auto-fill Empty Fields with N/A
          </Button>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="px-8 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  {medicineId ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  {medicineId ? 'Update Medicine' : 'Add Medicine'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
