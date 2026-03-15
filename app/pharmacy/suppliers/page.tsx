'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Building2, MapPin, Phone, Search } from 'lucide-react'

interface Medicine {
  medicine_id: number
  medicine_name: string
  strength: string
  form: string
  generic_name: string
  manufacturer: string
  batch_number: string
  mrp: number
  unit_price: number
  quantity: number
  expiry_date: string
}

interface Supplier {
  distributor_id: number
  company_name: string
  city: string
  state_province: string
  phone_number: string
  medicines: Medicine[]
}

export default function PharmacySuppliersPage() {
  const [suppliers, setSupplers] = useState<Supplier[]>([])
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMedicine, setSelectedMedicine] = useState<string>('')
  const [addingMedicine, setAddingMedicine] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchSuppliers()
  }, [searchTerm, selectedMedicine])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }
      if (selectedMedicine) {
        params.append('medicineId', selectedMedicine)
      }

      const response = await fetch(`/api/pharmacy/suppliers?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch suppliers')

      const data = await response.json()
      console.log('[v0] Suppliers data:', data)

      // Group medicines by distributor
      const suppliersMap = new Map<number, Supplier>()
      
      if (data.suppliers) {
        data.suppliers.forEach((medicine: any) => {
          const distributorId = medicine.distributor_id
          
          if (!suppliersMap.has(distributorId)) {
            suppliersMap.set(distributorId, {
              distributor_id: distributorId,
              company_name: medicine.company_name,
              city: medicine.city,
              state_province: medicine.state_province,
              phone_number: medicine.phone_number,
              medicines: []
            })
          }
          
          suppliersMap.get(distributorId)!.medicines.push({
            medicine_id: medicine.medicine_id,
            medicine_name: medicine.medicine_name,
            strength: medicine.strength,
            form: medicine.form,
            generic_name: medicine.generic_name,
            manufacturer: medicine.manufacturer,
            batch_number: medicine.batch_number,
            mrp: medicine.mrp,
            unit_price: medicine.unit_price,
            quantity: medicine.quantity,
            expiry_date: medicine.expiry_date
          })
        })
      }

      setSupplers(Array.from(suppliersMap.values()))
      setMedicines(data.suppliers || [])
    } catch (error) {
      console.error('[v0] Error fetching suppliers:', error)
      toast({
        title: 'Error',
        description: 'Failed to load suppliers',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddMedicine = async (medicine: Medicine) => {
    try {
      setAddingMedicine(`${medicine.medicine_id}-${medicine.distributor_id}`)

      const response = await fetch('/api/pharmacy/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineId: medicine.medicine_id,
          quantity: 1,
          unitPrice: medicine.unit_price,
          distributorId: medicine.distributor_id,
          batchNumber: medicine.batch_number,
          expiryDate: medicine.expiry_date,
          mrp: medicine.mrp
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add medicine')
      }

      toast({
        title: 'Success',
        description: `${medicine.medicine_name} added to inventory`
      })

      // Refresh suppliers
      fetchSuppliers()
    } catch (error: any) {
      console.error('[v0] Error adding medicine:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to add medicine',
        variant: 'destructive'
      })
    } finally {
      setAddingMedicine(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/pharmacy/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Find Suppliers</h1>
          <p className="text-muted-foreground mt-2">
            Browse verified distributors and add medicines to your inventory
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-col md:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search medicines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" onClick={() => {
                setSearchTerm('')
                setSelectedMedicine('')
              }}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading suppliers...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && suppliers.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No suppliers found matching your criteria</p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('')
                setSelectedMedicine('')
              }} className="mt-4">
                Clear and Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Suppliers List */}
        {!loading && suppliers.length > 0 && (
          <div className="space-y-6">
            {suppliers.map((supplier) => (
              <Card key={supplier.distributor_id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl">{supplier.company_name}</CardTitle>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {supplier.city}, {supplier.state_province}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {supplier.phone_number}
                        </div>
                      </div>
                    </div>
                    <Badge variant="default">
                      {supplier.medicines.length} medicines
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr className="text-left">
                          <th className="pb-3 font-semibold">Medicine</th>
                          <th className="pb-3 font-semibold">Strength</th>
                          <th className="pb-3 font-semibold">Batch</th>
                          <th className="pb-3 font-semibold text-right">Unit Price</th>
                          <th className="pb-3 font-semibold text-right">Qty</th>
                          <th className="pb-3 font-semibold">Expiry</th>
                          <th className="pb-3 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {supplier.medicines.map((medicine, index) => (
                          <tr key={index} className="hover:bg-muted/50">
                            <td className="py-3">
                              <div>
                                <p className="font-medium">{medicine.medicine_name}</p>
                                <p className="text-xs text-muted-foreground">{medicine.generic_name}</p>
                              </div>
                            </td>
                            <td className="py-3">{medicine.strength}</td>
                            <td className="py-3 text-xs">{medicine.batch_number || '-'}</td>
                            <td className="py-3 text-right font-medium">₹{medicine.unit_price.toFixed(2)}</td>
                            <td className="py-3 text-right">{medicine.quantity}</td>
                            <td className="py-3">
                              <Badge variant="outline" className="text-xs">
                                {new Date(medicine.expiry_date).toLocaleDateString('en-IN')}
                              </Badge>
                            </td>
                            <td className="py-3 text-right">
                              <Button
                                size="sm"
                                onClick={() => handleAddMedicine(medicine)}
                                disabled={addingMedicine === `${medicine.medicine_id}-${supplier.distributor_id}`}
                                variant="default"
                              >
                                {addingMedicine === `${medicine.medicine_id}-${supplier.distributor_id}` ? 'Adding...' : 'Add'}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
