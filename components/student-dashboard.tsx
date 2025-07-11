"use client"

import { StudentProfile } from "@/components/student-profile"
import { ScoreBreakdown } from "@/components/score-breakdown"
import { PerformanceTrend } from "@/components/performance-trend"
import { ScoreboardCharts } from "@/components/scoreboard-charts"
import { AttendanceTable } from "@/components/attendance-table"
import { UpcomingTests } from "@/components/upcoming-tests"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import * as supabaseApi from "@/lib/supabaseApi"

interface Student {
  id: string
  firstName: string
  middleName: string
  lastName: string
  email: string
  rollNumber: string
  prnNumber: string
  dateOfBirth: string
  branch: string
  division: string
  gender: string
  address: string
  sgpaSem1?: string
  sgpaSem2?: string
  registrationDate: string
  isPaid: boolean
  mentor?: string
}

interface StudentDashboardProps {
  student: Student | null
}

export function StudentDashboard({ student }: StudentDashboardProps) {
  const [activeSessions, setActiveSessions] = useState<any[]>([])
  const router = useRouter()
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const sessions = await supabaseApi.getSessions()
        // Optionally, filter sessions for the student if needed
        setActiveSessions(sessions.filter((s: any) => s.status === "active" && s.test))
      } catch (error) {
        console.error("Error fetching sessions:", error)
      }
    }
    fetchSessions()
  }, [student?.id])

  if (!student) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">No student data found</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Please login to view your dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Welcome, {student.firstName}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Track your academic progress and performance</p>
        </div>

        {/* Student Profile - Now uses actual student data */}
        <StudentProfile student={student} />

        {/* Performance Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ScoreBreakdown />
          </div>
          <div>
            <ScoreboardCharts />
          </div>
        </div>

        {/* Performance Trend */}
        <PerformanceTrend />

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AttendanceTable />
          <UpcomingTests />
        </div>
      </div>
    </div>
  )
}
