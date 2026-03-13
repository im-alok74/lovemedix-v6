import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { sql } from "@/lib/db"
import { AdminPrescriptionsTable } from "@/components/admin/admin-prescriptions-table"

export default async function AdminPrescriptionsPage() {
  const user = await getCurrentUser()

  if (!user || user.user_type !== "admin") {
    redirect("/signin")
  }

  const prescriptions = await sql`
    SELECT 
      p.id,
      p.prescription_image,
      p.status,
      p.created_at,
      u.full_name as customer_name,
      u.email as customer_email
    FROM prescriptions p
    JOIN users u ON p.customer_id = u.id
    ORDER BY p.created_at DESC
  ` as any[]

  // Format dates on the server to avoid hydration mismatch
  const formattedPrescriptions = (prescriptions || []).map((p: any) => ({
    ...p,
    formatted_date: new Date(p.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }))

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prescriptions</h1>
          <p className="text-muted-foreground">Review and verify prescriptions</p>
        </div>

        <AdminPrescriptionsTable prescriptions={formattedPrescriptions || []} />
      </div>
    </AdminLayout>
  )
}
