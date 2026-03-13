'use client'

import React from "react"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

interface AddDistributorDialogProps {
  onSuccess?: () => void
}

export function AddDistributorDialog({ onSuccess }: AddDistributorDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    company_name: '',
    license_number: '',
    gst_number: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    service_areas: '',
    commission_rate: '10'
  })

  const { toast } = useToast()
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Parse service areas
      const serviceAreas = formData.service_areas
        .split(',')
        .map(area => area.trim())
        .filter(area => area)

      const res = await fetch('/api/admin/distributors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          service_areas: serviceAreas,
          commission_rate: parseFloat(formData.commission_rate)
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast({ title: 'Success', description: 'Distributor added successfully' })
        setIsOpen(false)
        setFormData({
          email: '',
          password: '',
          full_name: '',
          phone: '',
          company_name: '',
          license_number: '',
          gst_number: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          service_areas: '',
          commission_rate: '10'
        })
        router.refresh()
        onSuccess?.()
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to add distributor', variant: 'destructive' })
      }
    } catch (error) {
      console.error('[v0] Error adding distributor:', error)
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Distributor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Distributor</DialogTitle>
          <DialogDescription>Fill in the distributor details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Information */}
          <div className="space-y-3 border-b pb-4">
            <h3 className="font-semibold text-sm">Account Information</h3>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="full_name">Contact Person Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-3 border-b pb-4">
            <h3 className="font-semibold text-sm">Company Information</h3>
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="license_number">License Number</Label>
              <Input
                id="license_number"
                name="license_number"
                value={formData.license_number}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="gst_number">GST Number</Label>
              <Input
                id="gst_number"
                name="gst_number"
                value={formData.gst_number}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-3 border-b pb-4">
            <h3 className="font-semibold text-sm">Address</h3>
            <div>
              <Label htmlFor="address">Street Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Service Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Service Details</h3>
            <div>
              <Label htmlFor="service_areas">Service Areas (comma separated)</Label>
              <Textarea
                id="service_areas"
                name="service_areas"
                placeholder="e.g., New York, California, Texas"
                value={formData.service_areas}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="commission_rate">Commission Rate (%)</Label>
              <Input
                id="commission_rate"
                name="commission_rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.commission_rate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Distributor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
