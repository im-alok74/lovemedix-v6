import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Documents | Distributor Dashboard | LoveMedix",
  description: "Manage licenses and certificates",
}

export default async function DistributorDocumentsPage() {
  const user = await getCurrentUser()

  if (!user || user.user_type !== "distributor") {
    redirect("/signin")
  }

  return (
    <main className="min-h-screen bg-secondary/5 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/distributor/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
            <p className="text-muted-foreground mt-1">Coming Soon - Manage your licenses and certificates</p>
          </div>
        </div>

        <Card className="p-12 text-center">
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground">Document management feature is currently in development.</p>
            <p className="text-sm text-muted-foreground">
              You'll soon be able to upload and manage your licenses, certificates, and other documents here.
            </p>
            <Button asChild className="mt-4">
              <Link href="/distributor/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </Card>
      </div>
    </main>
  )
}
