"use client"

import { StudentLoginForm } from "@/components/student-login-form"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Student Login
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Access your student dashboard</p>
        </div>

        <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl p-6">
          <StudentLoginForm />
        </Card>

        <div className="text-center mt-6">
          <p className="text-slate-600 dark:text-slate-400">
            Don't have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
