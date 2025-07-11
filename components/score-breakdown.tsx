"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { TrendingUp, Award, Target } from "lucide-react"
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

export function ScoreBreakdown() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<DYSSession[]>([])
  const [scoreBreakdown, setScoreBreakdown] = useState<any[]>([])
  const [overallStats, setOverallStats] = useState({
    averageScore: 0,
    totalTests: 0,
    completedTests: 0,
    highestScore: 0,
    lowestScore: 0,
  })

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    if (user && sessions.length > 0) {
      calculateScoreBreakdown()
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

  const calculateScoreBreakdown = async () => {
    if (!user) {
      setScoreBreakdown([])
      setOverallStats({
        averageScore: 0,
        totalTests: 0,
        completedTests: 0,
        highestScore: 0,
        lowestScore: 0,
      })
      return
    }
    try {
      const testScores = await supabaseApi.getTestScoresByStudentId(user.id)
      const attendance = await supabaseApi.getAttendanceByStudentId(user.id)
      const scores = Object.values(testScores)
      if (scores.length === 0) {
        setScoreBreakdown([])
        setOverallStats({ averageScore: 0, totalTests: 0, completedTests: 0, highestScore: 0, lowestScore: 0 })
        return
      }
      setScoreBreakdown(scores.map((score, idx) => ({ name: `Test ${idx + 1}`, value: score })))
      setOverallStats({
        averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        totalTests: sessions.length,
        completedTests: scores.length,
        highestScore: Math.max(...scores),
        lowestScore: Math.min(...scores),
      })
    } catch (error) {
      setScoreBreakdown([])
      setOverallStats({ averageScore: 0, totalTests: 0, completedTests: 0, highestScore: 0, lowestScore: 0 })
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    if (score >= 60) return "text-orange-600"
    return "text-red-600"
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800"
    if (score >= 80) return "bg-blue-100 text-blue-800"
    if (score >= 70) return "bg-yellow-100 text-yellow-800"
    if (score >= 60) return "bg-orange-100 text-orange-800"
    return "bg-red-100 text-red-800"
  }

  const getGrade = (score: number) => {
    if (score >= 90) return "A+"
    if (score >= 80) return "A"
    if (score >= 70) return "B"
    if (score >= 60) return "C"
    if (score > 0) return "D"
    return "-"
  }

  return (
    <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Performance Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Overall Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{overallStats.averageScore.toFixed(1)}%</div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Average Score</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{overallStats.completedTests}</div>
            <div className="text-sm text-green-700 dark:text-green-300">Completed</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{overallStats.highestScore}%</div>
            <div className="text-sm text-purple-700 dark:text-purple-300">Highest</div>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {overallStats.lowestScore > 0 ? `${overallStats.lowestScore}%` : "-"}
            </div>
            <div className="text-sm text-orange-700 dark:text-orange-300">Lowest</div>
          </div>
        </div>

        {/* Individual Session Scores */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4" />
            Session Scores
          </h3>

          {scoreBreakdown.length > 0 ? (
            <div className="space-y-3">
              {scoreBreakdown.map((item) => (
                <div key={item.name} className="p-4 border rounded-lg bg-white dark:bg-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800 dark:text-white">{item.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          Test
                        </Badge>
                        <span className="text-xs text-slate-500">Score: {item.value}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.value > 0 ? (
                        <>
                          <Badge className={getScoreBadgeColor(item.value)}>{getGrade(item.value)}</Badge>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${getScoreColor(item.value)}`}>{item.value}%</div>
                            <div className="text-xs text-slate-500">Max: 100</div>
                          </div>
                        </>
                      ) : (
                        <div className="text-right">
                          <div className="text-lg font-medium text-slate-400">-</div>
                          <div className="text-xs text-slate-500">
                            Not taken
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {item.value > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Progress</span>
                        <span className="text-slate-600 dark:text-slate-400">
                          {item.value}/100
                        </span>
                      </div>
                      <Progress value={item.value} className="h-2" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-600 dark:text-slate-400 mb-2">No Test Scores Yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Your test scores will appear here after you complete assessments.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
