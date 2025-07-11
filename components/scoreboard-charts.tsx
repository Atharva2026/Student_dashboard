"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { useAuth } from "@/contexts/auth-context"
import * as supabaseApi from "@/lib/supabaseApi"

function DonutChart({ data, title, centerValue }: { data: any[]; title: string; centerValue: string }) {
  return (
    <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-white text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800 dark:text-white">{centerValue}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{title.split(" ")[0]}</div>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm text-slate-600 dark:text-slate-400">{entry.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function ScoreboardCharts() {
  const { user } = useAuth()
  const [attendanceData, setAttendanceData] = useState([
    { name: "Present", value: 0, color: "#10b981" },
    { name: "Absent", value: 0, color: "#ef4444" },
    { name: "Not Attempted", value: 100, color: "#6b7280" },
  ])
  const [scoreData, setScoreData] = useState([
    { name: "Achieved", value: 0, color: "#3b82f6" },
    { name: "Remaining", value: 100, color: "#e2e8f0" },
  ])
  const [attendanceRate, setAttendanceRate] = useState("0%")
  const [averageScore, setAverageScore] = useState("0%")

  const calculateAttendanceData = async (user: any) => {
    if (user) {
      const { data: attendanceData, error } = await supabaseApi.getAttendanceData(user.id)
      if (error) {
        console.error("Error fetching attendance data:", error)
        return
      }

      if (attendanceData && attendanceData.length > 0) {
        const presentCount = attendanceData.filter((status) => status === "present").length
        const absentCount = attendanceData.filter((status) => status === "absent").length
        const notAttemptedCount = attendanceData.filter((status) => status === "not-attempted").length
        const totalSessions = attendanceData.length

        const presentPercentage = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0
        const absentPercentage = totalSessions > 0 ? (absentCount / totalSessions) * 100 : 0
        const notAttemptedPercentage = totalSessions > 0 ? (notAttemptedCount / totalSessions) * 100 : 100

        setAttendanceData([
          { name: "Present", value: presentPercentage, color: "#10b981" },
          { name: "Absent", value: absentPercentage, color: "#ef4444" },
          { name: "Not Attempted", value: notAttemptedPercentage, color: "#6b7280" },
        ])

        setAttendanceRate(`${Math.round(presentPercentage)}%`)

        // Calculate test scores if available
        const { data: scoreData, error: scoreError } = await supabaseApi.getScoreData(user.id)
        if (scoreError) {
          console.error("Error fetching score data:", scoreError)
          return
        }

        if (scoreData && scoreData.length > 0) {
          const scores = scoreData.filter((score) => score > 0)
          const avgScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
          const achievedPercentage = avgScore
          const remainingPercentage = 100 - avgScore

          setScoreData([
            { name: "Achieved", value: achievedPercentage, color: "#3b82f6" },
            { name: "Remaining", value: remainingPercentage, color: "#e2e8f0" },
          ])

          setAverageScore(`${Math.round(avgScore)}%`)
        }
      }
    }
  }

  useEffect(() => {
    calculateAttendanceData(user)
  }, [user])

  useEffect(() => {
    const handleStorageChange = () => {
      // Reload user data when localStorage changes
      const currentUser = localStorage.getItem("currentUser")
      if (currentUser) {
        const updatedUser = JSON.parse(currentUser)
        // Force re-calculation of attendance and scores
        calculateAttendanceData(updatedUser)
      }
    }

    // Listen for storage changes
    window.addEventListener("storage", handleStorageChange)

    // Also listen for custom events for same-tab updates
    window.addEventListener("attendanceUpdated", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("attendanceUpdated", handleStorageChange)
    }
  }, [])

  return (
    <div className="space-y-6">
      <DonutChart data={attendanceData} title="Attendance Rate" centerValue={attendanceRate} />
      <DonutChart data={scoreData} title="Score Total" centerValue={averageScore} />
    </div>
  )
}
