import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings as SettingsIcon } from "lucide-react"
import Link from "next/link"
import { SettingsForm } from "@/components/distributor/settings-form"

export const metadata = {
  title: "Settings | Distributor Dashboard | LoveMedix",
  description: "Manage your account settings and preferences",
}

export default async function DistributorSettingsPage() {
  const user = await getCurrentUser()

  if (!user || user.user_type !== "distributor") {
    redirect("/signin")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-secondary/5 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/distributor/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <SettingsIcon className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                  <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Form */}
          <SettingsForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
