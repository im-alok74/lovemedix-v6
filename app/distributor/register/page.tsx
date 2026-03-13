import { Card } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DistributorSignUpForm } from "@/components/auth/distributor-signup-form"
import { CheckCircle2, TrendingUp, Users, Zap } from "lucide-react"

export const metadata = {
  title: "Distributor Registration | LoveMedix",
  description: "Register as a pharmaceutical distributor and expand your business with LoveMedix",
}

export default function DistributorRegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-background to-secondary/10 py-8">
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Side - Form */}
          <div className="flex flex-col justify-center">
            <Card className="p-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Join as a Distributor</h1>
                <p className="text-muted-foreground mt-2">Grow your pharmaceutical business with LoveMedix</p>
              </div>

              <DistributorSignUpForm />
            </Card>
          </div>

          {/* Right Side - Benefits & Info */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Benefits Card */}
            <Card className="p-6 bg-primary/5 border-primary/10">
              <h2 className="text-xl font-semibold mb-4">Why Partner With Us?</h2>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Increase Revenue</h3>
                    <p className="text-sm text-muted-foreground">Reach more pharmacies and customers across India</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Large Customer Base</h3>
                    <p className="text-sm text-muted-foreground">Connect with thousands of pharmacies and retailers</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Easy Platform</h3>
                    <p className="text-sm text-muted-foreground">Manage inventory and orders from one dashboard</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Requirements Card */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Requirements</h2>

              <ul className="space-y-3">
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Valid Wholesale License</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">GST Registration (Valid)</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Business Address & Contact Details</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Service Area Coverage</span>
                </li>
              </ul>
            </Card>

            {/* Document Upload Info */}
            <Card className="p-6 bg-amber-50 border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">Document Verification</h3>
              <p className="text-sm text-amber-800">
                After registration, you'll need to upload license documents for verification. Our team typically verifies applications within 2-3 business days.
              </p>
            </Card>
          </div>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  )
}
