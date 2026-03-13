import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getCurrentUser, requireRole } from '@/lib/auth-server'
import { checkSellerVerification, getSellerProfile } from '@/lib/seller-auth'
import { sql } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { FileText, AlertCircle, Eye } from 'lucide-react'

export default async function PharmacyPrescriptionsPage() {
  const user = await requireRole(['pharmacy'])

  if (!user) {
    redirect('/signin')
  }

  const verification = await checkSellerVerification(user.id, 'pharmacy')
  const profile = await getSellerProfile(user.id, 'pharmacy')

  if (!profile) {
    redirect('/pharmacy/register')
  }

  // Get all prescriptions with customer details
  const prescriptions = await sql`
    SELECT 
      p.id,
      p.prescription_image,
      p.status,
      p.created_at,
      p.doctor_name,
      p.hospital_name,
      u.full_name as customer_name,
      u.email as customer_email,
      u.phone as customer_phone
    FROM prescriptions p
    JOIN users u ON p.customer_id = u.id
    ORDER BY p.created_at DESC
  ` as any[]

  const stats = {
    total: prescriptions.length,
    pending: prescriptions.filter(p => p.status === 'pending').length,
    verified: prescriptions.filter(p => p.status === 'verified').length,
    rejected: prescriptions.filter(p => p.status === 'rejected').length
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-6 w-6" />
              <h1 className="text-3xl font-bold text-foreground">Prescriptions</h1>
            </div>
            <p className="text-muted-foreground">View all prescriptions uploaded by customers</p>
          </div>

          {!verification.verified && (
            <Card className="border-destructive/50 bg-destructive/5 mb-8">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Access Limited</h3>
                    <p className="text-sm text-muted-foreground">
                      You need to be a verified pharmacy to view and process prescriptions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Prescriptions</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats.total}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{stats.pending}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Verified</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.verified}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prescriptions Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Prescriptions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {prescriptions.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No prescriptions available yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b">
                        <TableHead className="px-4 py-3">Customer</TableHead>
                        <TableHead className="px-4 py-3">Contact</TableHead>
                        <TableHead className="px-4 py-3">Doctor / Hospital</TableHead>
                        <TableHead className="px-4 py-3">Uploaded</TableHead>
                        <TableHead className="px-4 py-3">Status</TableHead>
                        <TableHead className="px-4 py-3">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prescriptions.map(prescription => (
                        <TableRow key={prescription.id} className="border-b hover:bg-muted/50">
                          <TableCell className="px-4 py-3 font-medium">
                            {prescription.customer_name}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="text-sm">
                              <p className="text-muted-foreground">{prescription.customer_email}</p>
                              {prescription.customer_phone && (
                                <p className="text-muted-foreground">{prescription.customer_phone}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm">
                            {prescription.doctor_name && (
                              <p>Dr. {prescription.doctor_name}</p>
                            )}
                            {prescription.hospital_name && (
                              <p className="text-muted-foreground">{prescription.hospital_name}</p>
                            )}
                            {!prescription.doctor_name && !prescription.hospital_name && (
                              <p className="text-muted-foreground">N/A</p>
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm">
                            {new Date(prescription.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Badge
                              variant={
                                prescription.status === 'verified'
                                  ? 'default'
                                  : prescription.status === 'rejected'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                            >
                              {prescription.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {prescription.prescription_image && (
                              <a href={prescription.prescription_image} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                                  <Eye className="h-4 w-4" />
                                  View
                                </Button>
                              </a>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
