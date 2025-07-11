"use client"

import { StudentRegistrationForm } from "@/components/student-registration-form"
import { QRPaymentSection } from "@/components/qr-payment-section"
import { Card } from "@/components/ui/card"

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Student Registration
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Complete your registration to access the student portal</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Registration Form */}
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl p-6">
              <StudentRegistrationForm />
            </Card>
          </div>

          {/* QR Payment Section */}
          <div className="lg:col-span-1">
            <QRPaymentSection />
          </div>
        </div>
      </div>
    </div>
  )
}
