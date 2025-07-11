"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/contexts/auth-context"
import { CheckCircle, XCircle, Clock, Calendar } from "lucide-react"
import { getSessions, getAttendanceByStudentId, getTestScoresByStudentId } from "@/lib/supabaseApi"

export function AttendanceTable() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any>({})
  const [testScores, setTestScores] = useState<any>({})

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  const loadData = async () => {
    const sessionsData = await getSessions()
    setSessions(sessionsData)
    const attendanceData = await getAttendanceByStudentId(user!.id)
    setAttendance(attendanceData)
    const testScoresData = await getTestScoresByStudentId(user!.id)
    setTestScores(testScoresData)
  }

  const getAttendanceStatus = (sessionId: string) => {
    return attendance[sessionId] || "not-attempted"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "absent":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-600 text-white">Present</Badge>
      case "absent":
        return <Badge className="bg-red-600 text-white">Absent</Badge>
      default:
        return <Badge variant="secondary">Not Attempted</Badge>
    }
  }

  const getTestScore = (sessionId: string) => {
    return testScores[sessionId] || null
  }

  // Calculate attendance statistics
  const totalSessions = sessions.length
  const presentCount = sessions.filter((session) => getAttendanceStatus(session.id) === "present").length
  const absentCount = sessions.filter((session) => getAttendanceStatus(session.id) === "absent").length
  const attendanceRate = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0

  return (
    <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Attendance Record
        </CardTitle>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span>Present: {presentCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span>Absent: {absentCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
            <span>Rate: {attendanceRate.toFixed(1)}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead>Session Code</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => {
                const status = getAttendanceStatus(session.id)
                const score = getTestScore(session.id)

                return (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{session.name}</div>
                        <div className="text-sm text-slate-500">{session.type}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-mono text-slate-700 dark:text-slate-200">
                        {session.code ? session.code : "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{new Date(session.date).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        {getStatusBadge(status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {score ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-800">
                          {score}%
                        </Badge>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-600 dark:text-slate-400 mb-2">No Sessions Available</h3>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Attendance records will appear here when sessions are scheduled.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
