"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { Clock, Calendar, MapPin, ExternalLink, CheckCircle, AlertCircle } from "lucide-react"
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
  testLink?: string
}

interface StudentWithAttendance {
  attendance?: { [key: string]: string }
  testScores?: { [key: string]: number }
}

export function UpcomingTests() {
  const { user } = useAuth() as { user: StudentWithAttendance | null }
  const [sessions, setSessions] = useState<DYSSession[]>([])
  const [upcomingTests, setUpcomingTests] = useState<DYSSession[]>([])
  const [completedTests, setCompletedTests] = useState<DYSSession[]>([])
  const [takeTestLoading, setTakeTestLoading] = useState<string | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    if (user && sessions.length > 0) {
      categorizeTests()
    }
  }, [user, sessions])

  // Listen for session updates
  useEffect(() => {
    const handleSessionUpdate = () => {
      loadSessions()
    }

    window.addEventListener("sessionsUpdated", handleSessionUpdate)
    return () => window.removeEventListener("sessionsUpdated", handleSessionUpdate)
  }, [])

  const loadSessions = async () => {
    try {
      const sessions = await supabaseApi.getSessions()
      setSessions(sessions)
    } catch (error) {
      console.error("Error loading sessions:", error)
    }
  }

  const categorizeTests = () => {
    if (!user || !user.attendance) return

    const upcoming: DYSSession[] = []
    const active: DYSSession[] = []
    const completed: DYSSession[] = []

    sessions.forEach((session) => {
      if (session.status === "completed") {
        completed.push(session)
      } else if (session.status === "active") {
        active.push(session)
      } else {
        upcoming.push(session)
      }
    })

    // Sort by date
    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    active.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    completed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setUpcomingTests([...active, ...upcoming]) // Show active first, then upcoming
    setCompletedTests(completed)
  }

  const getStatusColor = (session: DYSSession) => {
    switch (session.status) {
      case "active":
        return "bg-yellow-500"
      case "completed":
        return "bg-green-500"
      case "upcoming":
      default:
        return "bg-blue-500"
    }
  }

  const getStatusText = (session: DYSSession) => {
    switch (session.status) {
      case "active":
        return "Active"
      case "completed":
        // If user missed, show Missed, else Completed
        if (user && user.attendance?.[session.id] === "absent") return "Missed"
        return "Completed"
      case "upcoming":
      default:
        return "Upcoming"
    }
  }

  const getStatusIcon = (session: DYSSession) => {
    switch (session.status) {
      case "active":
        return <Clock className="w-4 h-4" />
      case "completed":
        if (user && user.attendance?.[session.id] === "absent") return <AlertCircle className="w-4 h-4" />
        return <CheckCircle className="w-4 h-4" />
      case "upcoming":
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const TestCard = ({ session, showScore = false }: { session: DYSSession; showScore?: boolean }) => {
    const testScore = user?.testScores?.[session.id]

    return (
      <div className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-slate-800">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-slate-800 dark:text-white mb-1">{session.name}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{session.description}</p>

            <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(session.date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {session.time}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {session.venue}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge className={`${getStatusColor(session)} text-white text-xs`}>
              <span className="flex items-center gap-1">
                {getStatusIcon(session)}
                {getStatusText(session)}
              </span>
            </Badge>

            <Badge variant="outline" className="text-xs">
              {session.type}
            </Badge>
          </div>
        </div>

        {showScore && testScore && (
          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Score:</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{testScore}%</span>
            </div>
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{session.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Test Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Type:</span>
                      <span>{session.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Duration:</span>
                      <span>{session.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Date:</span>
                      <span>{new Date(session.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Time:</span>
                      <span>{session.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Venue:</span>
                      <span>{session.venue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Status:</span>
                      <Badge className={`${getStatusColor(session)} text-white`}>{getStatusText(session)}</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{session.description}</p>
                </div>

                {showScore && testScore && (
                  <div>
                    <h4 className="font-semibold mb-2">Your Performance</h4>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-blue-800 dark:text-blue-200">Test Score:</span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{testScore}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Show Take Test button only if session is active */}
          {session.status === "active" && (
            <Button
              size="sm"
              className="flex-1 flex items-center justify-center"
              disabled={takeTestLoading === session.id}
              onClick={() => {
                localStorage.setItem("allowed_test_id", session.id)
                window.location.href = `/take-test/${session.id}`
              }}
            >
              {takeTestLoading === session.id ? (
                <span className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></span>
              ) : (
                <>
                  <ExternalLink className="w-3 h-3 mr-1" /> Take Test
                </>
              )}
            </Button>
          )}
          {/* Optionally, show a disabled button for non-active sessions */}
          {session.status !== "active" && (
            <Button size="sm" className="flex-1" disabled>
              <ExternalLink className="w-3 h-3 mr-1" />
              Take Test
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Show skeleton loader if sessions are loading
  if (!sessions || sessions.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-slate-200 dark:bg-slate-700 h-24 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-800 dark:text-white">Tests & Assessments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Upcoming Tests */}
          {upcomingTests.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Upcoming Tests ({upcomingTests.length})
              </h3>
              <div className="space-y-3">
                {upcomingTests.map((session) => (
                  <TestCard key={session.id} session={session} />
                ))}
              </div>
            </div>
          )}

          {/* Completed Tests */}
          {completedTests.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Completed Tests ({completedTests.length})
              </h3>
              <div className="space-y-3">
                {completedTests.map((session) => (
                  <TestCard key={session.id} session={session} showScore={true} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {upcomingTests.length === 0 && completedTests.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-600 dark:text-slate-400 mb-2">No Tests Available</h3>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Tests and assessments will appear here when they are scheduled.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
