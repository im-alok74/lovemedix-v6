import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, PackageOpen } from "lucide-react"
import Link from "next/link"
import { AddMedicineForm, InventoryTable } from "@/components/distributor/inventory-management"

function InventoryManagementSection() {
  return (
    <div className="space-y-8">
      {/* Add Medicine Form */}
      <AddMedicineForm onSuccess={() => {
        // Inventory table will handle its own refresh
      }} />

      {/* Inventory Table */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Inventory</h2>
        <InventoryTable />
      </div>
    </div>
  )
}

export const metadata = {
  title: "Manage Inventory | Distributor Dashboard | LoveMedix",
  description: "Manage your medicine inventory and stock levels",
}

export default async function DistributorInventoryPage() {
  const user = await getCurrentUser()

  if (!user || user.user_type !== "distributor") {
    redirect("/signin")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-secondary/5 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/distributor/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <PackageOpen className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Manage Inventory</h1>
                  <p className="text-muted-foreground mt-1">Add and manage your medicine stock</p>
                </div>
              </div>
            </div>
          </div>

          {/* Add Medicine Form and Inventory Table */}
          <InventoryManagementSection />
        </div>
      </main>
      <Footer />
    </div>
  )
}
