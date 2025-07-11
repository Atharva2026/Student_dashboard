"use client"

import { useAuth } from "@/contexts/auth-context"
import { StudentDashboard } from "@/components/student-dashboard"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Access Denied</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Please login to access your dashboard</p>
            <Button asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return <StudentDashboard student={user} />
}
