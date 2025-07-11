"use client"

import { AdminLoginForm } from "@/components/admin-login-form"
import { Card } from "@/components/ui/card"

export default function AdminLoginPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            Admin Login
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Access the administrative dashboard</p>
        </div>

        <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl p-6">
          <AdminLoginForm />
        </Card>
      </div>
    </div>
  )
}
