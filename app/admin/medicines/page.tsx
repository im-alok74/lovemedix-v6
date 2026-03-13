import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { sql } from "@/lib/db"
import { AdminMedicinesTable } from "@/components/admin/admin-medicines-table"

export default async function AdminMedicinesPage() {
  const user = await getCurrentUser()

  if (!user || user.user_type !== "admin") {
    redirect("/signin")
  }

  const medicines = await sql`
    SELECT id, name, generic_name, manufacturer, category, form, strength, mrp, requires_prescription, hsn_code
    FROM medicines
    ORDER BY name ASC
  `

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Medicines</h1>
          <p className="text-muted-foreground">Manage medicine catalog - Add, Edit, and Delete medicines</p>
        </div>

        <AdminMedicinesTable initialMedicines={medicines} />
      </div>
    </AdminLayout>
  )
}
