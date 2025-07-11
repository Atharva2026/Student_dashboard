"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { QrCode, IndianRupee } from "lucide-react"

export function QRPaymentSection() {
  const [isPaid, setIsPaid] = useState(false)

  return (
    <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <IndianRupee className="w-5 h-5" />
          Payment Required
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        {/* QR Code Placeholder */}
        <div className="flex justify-center">
          <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-300 dark:border-blue-700">
            <div className="text-center">
              <QrCode className="w-16 h-16 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-400">QR Code</p>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="space-y-2">
          <p className="text-2xl font-bold text-slate-800 dark:text-white">Pay ₹500 to complete registration</p>
          <p className="text-slate-600 dark:text-slate-400">Scan to Pay</p>
        </div>

        {/* Mock Payment Confirmation */}
        <div className="flex items-center space-x-2 justify-center">
          <Checkbox id="payment-confirmation" checked={isPaid} onCheckedChange={setIsPaid} />
          <label
            htmlFor="payment-confirmation"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Mark as Paid (Mock Confirmation)
          </label>
        </div>

        {isPaid && (
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
            <p className="text-green-800 dark:text-green-200 text-sm font-medium">
              ✓ Payment confirmed! You can now access your dashboard after login.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
