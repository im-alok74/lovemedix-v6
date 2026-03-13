import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { OrdersList } from "@/components/distributor/orders-list"

export const metadata = {
  title: "Orders | Distributor Dashboard | LoveMedix",
  description: "View and manage orders from connected pharmacies",
}

export default async function DistributorOrdersPage() {
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
                <ShoppingCart className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                  <p className="text-muted-foreground mt-1">Track and manage orders from pharmacies</p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <OrdersList />
        </div>
      </main>
      <Footer />
    </div>
  )
}
