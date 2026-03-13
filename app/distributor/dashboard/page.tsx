import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { sql } from "@/lib/db"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Clock, FileText } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Distributor Dashboard | LoveMedix",
  description: "Manage your distributor account and profile",
}

async function getDistributorProfile(userId: number) {
  const result = await sql`
    SELECT * FROM distributor_profiles WHERE user_id = ${userId}
  `
  return result[0] || null
}

export default async function DistributorDashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/signin")
  }

  if (user.user_type !== "distributor") {
    redirect("/dashboard")
  }

  const distributorProfile = await getDistributorProfile(user.id)

  if (!distributorProfile) {
    redirect("/distributor/register")
  }

  const isVerified = distributorProfile.verification_status === "verified"
  const isPending = distributorProfile.verification_status === "pending"
  const isRejected = distributorProfile.verification_status === "rejected"

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-secondary/5 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Distributor Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your business and connect with pharmacies</p>
        </div>

        {/* Verification Status Banner */}
        {isPending && (
          <Card className="p-6 mb-6 border-amber-200 bg-amber-50">
            <div className="flex gap-4 items-start">
              <Clock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h2 className="font-semibold text-amber-900">Verification Pending</h2>
                <p className="text-sm text-amber-800 mt-1">
                  Your account is under review. We'll verify your documents within 2-3 business days.
                </p>
                <p className="text-xs text-amber-700 mt-2">
                  You can start using the platform immediately, but some features may be limited until verification is complete.
                </p>
              </div>
            </div>
          </Card>
        )}

        {isRejected && (
          <Card className="p-6 mb-6 border-red-200 bg-red-50">
            <div className="flex gap-4 items-start">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h2 className="font-semibold text-red-900">Verification Rejected</h2>
                <p className="text-sm text-red-800 mt-1">
                  Unfortunately, your account could not be verified. Please contact support for more details.
                </p>
              </div>
            </div>
          </Card>
        )}

        {isVerified && (
          <Card className="p-6 mb-6 border-green-200 bg-green-50">
            <div className="flex gap-4 items-start">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold text-green-900">Account Verified</h2>
                <p className="text-sm text-green-800 mt-1">Your account is verified and fully active.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Profile Information */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Company Info Card */}
          <Card className="p-6 md:col-span-2">
            <h2 className="text-lg font-semibold mb-6">Company Information</h2>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground">Company Name</p>
                <p className="text-lg font-medium">{distributorProfile.company_name}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">License Number</p>
                  <p className="font-medium">{distributorProfile.license_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">GST Number</p>
                  <p className="font-medium">{distributorProfile.gst_number}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">
                  {distributorProfile.address}
                  <br />
                  {distributorProfile.city}, {distributorProfile.state} {distributorProfile.pincode}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Service Areas</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {distributorProfile.service_areas && distributorProfile.service_areas.length > 0 ? (
                    distributorProfile.service_areas.map((area: string, index: number) => (
                      <span key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        {area}
                      </span>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No service areas configured</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Account Status</h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Verification Status</p>
                <div className="mt-2 flex items-center gap-2">
                  {isVerified && (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Verified</span>
                    </>
                  )}
                  {isPending && (
                    <>
                      <Clock className="w-5 h-5 text-amber-600" />
                      <span className="text-sm font-medium text-amber-600">Pending</span>
                    </>
                  )}
                  {isRejected && (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium text-red-600">Rejected</span>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Commission Rate</p>
                <p className="text-lg font-semibold text-primary">{distributorProfile.commission_rate}%</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Joined</p>
                <p className="text-sm">
                  {new Date(distributorProfile.created_at).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold mb-2">Manage Inventory</h3>
                <p className="text-sm text-muted-foreground">Update your medicine catalog and stock levels</p>
              </div>
            </div>
            <Button variant="link" className="mt-4 p-0 h-auto" asChild>
              <Link href="/distributor/inventory">View Inventory →</Link>
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold mb-2">View Orders</h3>
                <p className="text-sm text-muted-foreground">Track orders from connected pharmacies</p>
              </div>
            </div>
            <Button variant="link" className="mt-4 p-0 h-auto" asChild>
              <Link href="/distributor/orders">View Orders →</Link>
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold mb-2">Documents</h3>
                <p className="text-sm text-muted-foreground">Manage licenses and certificates</p>
              </div>
            </div>
            <Button variant="link" className="mt-4 p-0 h-auto" asChild>
              <Link href="/distributor/documents">View Documents →</Link>
            </Button>
          </Card>
        </div>

        {/* Profile Edit Section */}
        <Card className="p-6 mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Account Settings</h3>
              <p className="text-sm text-muted-foreground mt-1">Update your profile and preferences</p>
            </div>
            <Button asChild>
              <Link href="/distributor/settings">Edit Settings</Link>
            </Button>
          </div>
        </Card>
      </div>
      </main>
      <Footer />
    </div>
  )
}
