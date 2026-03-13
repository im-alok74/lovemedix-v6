"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

interface Prescription {
  id: number
  prescription_image: string | null
  status: string
  created_at: string
  customer_name: string
  customer_email: string
  formatted_date?: string
}

export function AdminPrescriptionsTable({ prescriptions }: { prescriptions: Prescription[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded On</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prescriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No prescriptions found.
                </TableCell>
              </TableRow>
            ) : (
              prescriptions.map((p: Prescription) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{p.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{p.customer_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        p.status === "verified"
                          ? "default"
                          : p.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {p.formatted_date || new Date(p.created_at).toLocaleDateString('en-US')}
                  </TableCell>
                  <TableCell>
                    {p.prescription_image ? (
                      <Link 
                        href={p.prescription_image} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline"
                      >
                        View Prescription
                      </Link>
                    ) : (
                      <span className="text-muted-foreground text-sm">No image</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
