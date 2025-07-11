"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useAuth } from "@/contexts/auth-context"
import { TrendingUp, Calendar } from "lucide-react"
import * as supabaseApi from "@/lib/supabaseApi"

interface DYSSession {
  id: string
  name: string
  description: string
  date: string
  time: string
  venue: string
  status: "upcoming" | "active" | "completed"
  type: "Assessment" | "Test" | "Quiz" | "Workshop"
  duration: string
}

export function PerformanceTrend() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<DYSSession[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [trendStats, setTrendStats] = useState({
    trend: "stable" as "improving" | "declining" | "stable",
    changePercentage: 0,
    totalSessions: 0,
    averageScore: 0,
  })

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    if (user && sessions.length > 0) {
      calculatePerformanceTrend()
    }
  }, [user, sessions])

  // Listen for updates
  useEffect(() => {
    const handleUpdate = () => {
      loadSessions()
    }

    window.addEventListener("sessionsUpdated", handleUpdate)
    window.addEventListener("attendanceUpdated", handleUpdate)

    return () => {
      window.removeEventListener("sessionsUpdated", handleUpdate)
      window.removeEventListener("attendanceUpdated", handleUpdate)
    }
  }, [])

  const loadSessions = async () => {
    try {
      const sessions = await supabaseApi.getSessions()
      setSessions(sessions)
    } catch (error) {
      console.error("Error loading sessions:", error)
    }
  }

  const calculatePerformanceTrend = async () => {
    if (!user) {
      setChartData([])
      setTrendStats({
        trend: "stable",
        changePercentage: 0,
        totalSessions: 0,
        averageScore: 0,
      })
      return
    }
    try {
      const testScores = await supabaseApi.getTestScoresByStudentId(user.id)
      const scores = Object.values(testScores)
      if (scores.length === 0) {
        setChartData([])
        setTrendStats({ trend: "stable", changePercentage: 0, totalSessions: 0, averageScore: 0 })
        return
      }
      setChartData(scores.map((score, idx) => ({ name: `Test ${idx + 1}`, score })))
      // Calculate trend, changePercentage, etc.
      let trend: "improving" | "declining" | "stable" = "stable"
      let changePercentage = 0
      if (scores.length >= 2) {
        const firstScore = scores[0]
        const lastScore = scores[scores.length - 1]
        changePercentage = ((lastScore - firstScore) / firstScore) * 100
        if (changePercentage > 5) trend = "improving"
        else if (changePercentage < -5) trend = "declining"
      }
      const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length
      setTrendStats({
        trend,
        changePercentage: Math.abs(changePercentage),
        totalSessions: scores.length,
        averageScore,
      })
    } catch (error) {
      setChartData([])
      setTrendStats({ trend: "stable", changePercentage: 0, totalSessions: 0, averageScore: 0 })
    }
  }

  const getTrendColor = () => {
    switch (trendStats.trend) {
      case "improving":
        return "text-green-600"
      case "declining":
        return "text-red-600"
      default:
        return "text-blue-600"
    }
  }

  const getTrendIcon = () => {
    switch (trendStats.trend) {
      case "improving":
        return "↗️"
      case "declining":
        return "↘️"
      default:
        return "➡️"
    }
  }

  const getTrendText = () => {
    switch (trendStats.trend) {
      case "improving":
        return `Improving by ${trendStats.changePercentage.toFixed(1)}%`
      case "declining":
        return `Declining by ${trendStats.changePercentage.toFixed(1)}%`
      default:
        return "Stable performance"
    }
  }

  return (
    <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Performance Trend
        </CardTitle>
        <div className="flex items-center gap-4 text-sm">
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            <span>{getTrendIcon()}</span>
            <span className="font-medium">{getTrendText()}</span>
          </div>
          <div className="text-slate-600 dark:text-slate-400">Average: {trendStats.averageScore.toFixed(1)}%</div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="sessionName" tick={{ fontSize: 12 }} className="text-slate-600 dark:text-slate-400" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} className="text-slate-600 dark:text-slate-400" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: any) => [`${value}%`, "Score"]}
                  labelFormatter={(label) => `Session: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: "#3b82f6", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-600 dark:text-slate-400 mb-2">No Performance Data</h3>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Complete some tests to see your performance trend over time.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
