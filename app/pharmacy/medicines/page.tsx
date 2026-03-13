import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { sql } from "@/lib/db"
import AddMedicineForm from "@/components/pharmacy/add-medicine-form"
import PharmacyMedicinesList from "@/components/pharmacy/pharmacy-medicines-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function PharmacyMedicinesPage() {
  const user = await getCurrentUser()

  if (!user || user.user_type !== "pharmacy") {
    redirect("/signin")
  }

  // Get pharmacy profile
  const pharmacyResult = await sql`
    SELECT p.id, p.pharmacy_name, p.verification_status
    FROM pharmacy_profiles p
    WHERE p.user_id = ${user.id}
  ` as any[]

  if (!pharmacyResult || pharmacyResult.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Pharmacy profile not found. Please complete your registration.</p>
        </div>
      </div>
    )
  }

  const pharmacy = pharmacyResult[0]

  if (pharmacy.verification_status !== "verified") {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700">Your pharmacy is not yet verified. You can manage medicines once your profile is verified.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">Manage Medicines</h1>
        <p className="text-muted-foreground">Upload and manage your pharmacy's medicine inventory</p>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">{pharmacy.pharmacy_name}</h2>
        </div>
        <AddMedicineForm />
      </div>

      <PharmacyMedicinesList />
    </div>
  )
}
