"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, Clock, MapPin, Calendar, Users, UserCheck } from "lucide-react"
import Link from "next/link"
import { setAttendance } from "@/lib/supabaseApi"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StudentLoginForm } from "@/components/student-login-form"
import { StudentRegistrationForm } from "@/components/student-registration-form"
import { useAuth } from "@/contexts/auth-context"
import { getSessions, getAttendanceByStudentId } from "@/lib/supabaseApi"

interface AttendanceSession {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    rollNumber: string
    prnNumber: string
  }
  isAuthenticated: boolean
}

export default function AttendancePage() {
  const { user, isAuthenticated, refreshUserData } = useAuth()
  const [sessions, setSessions] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any>({})
  const [selectedSession, setSelectedSession] = useState("")
  const [sessionCode, setSessionCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(!isAuthenticated)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const { toast } = useToast()

  useEffect(() => {
    if (isAuthenticated && user) {
      setShowAuthModal(false)
      fetchSessionsAndAttendance()
    } else {
      setShowAuthModal(true)
    }
  }, [isAuthenticated, user])

  const fetchSessionsAndAttendance = async () => {
    const sessionList = await getSessions()
    setSessions(sessionList)
    if (user && user.id) {
      const att = await getAttendanceByStudentId(user.id)
      setAttendance(att)
    }
  }

  const handleMarkAttendance = async () => {
    if (!selectedSession) {
      toast({ title: "Please Select Session", description: "Choose which session you're attending", variant: "destructive" })
      return
    }
    if (!sessionCode.trim()) {
      toast({ title: "Session Code Required", description: "Please enter the session code provided by your instructor", variant: "destructive" })
      return
    }
    if (!user || !user.id) {
      toast({ title: "Error", description: "User not found.", variant: "destructive" })
      return
    }
    // Find the selected session object
    const sessionObj = sessions.find((s) => s.id === selectedSession)
    console.log('Selected session object:', sessionObj);
    if (!sessionObj || !sessionObj.session_code) {
      console.error('Session object or session_code not found:', { sessionObj, selectedSession });
      toast({ title: "Error", description: "Session code not set for this session. Please contact admin.", variant: "destructive" })
      return
    }
    // Compare codes (case-insensitive, trimmed)
    if (sessionObj.session_code.trim().toLowerCase() !== sessionCode.trim().toLowerCase()) {
      toast({ title: "Incorrect Session Code", description: "The session code you entered is incorrect.", variant: "destructive" })
      return
    }
    // Check if already marked present
    if (attendance[selectedSession] === "present") {
      toast({ title: "Already Marked", description: "You have already marked attendance for this session.", variant: "destructive" })
      return
    }
    setIsLoading(true)
    try {
      // Debug: log what is being sent
      console.log('Marking attendance:', { student_id: user.id, session_id: selectedSession, status: "present" })
      // Mark attendance in Supabase
      await setAttendance({ student_id: user.id, session_id: selectedSession, status: "present" })
      // Debug: log what is returned
      console.log('Attendance marked successfully')
      
      toast({ title: "Attendance Marked!", description: `Attendance for ${sessionObj.name} has been marked as present.` })
      // Always fetch the latest attendance from Supabase
      await fetchSessionsAndAttendance()
      if (refreshUserData) await refreshUserData()
    } catch (error) {
      console.error('Supabase setAttendance error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark attendance';
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Auth Modal */}
      <Dialog open={showAuthModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{authMode === 'login' ? 'Log In to Self-Attendance' : 'Register as New Student'}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {authMode === 'login' ? <StudentLoginForm /> : <StudentRegistrationForm />}
            <div className="flex justify-center gap-2 mt-2">
              <Button variant="link" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
                {authMode === 'login' ? 'New user? Register' : 'Already a user? Log in'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Attendance UI */}
      {isAuthenticated && user && (
        <>
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Welcome, {user.firstName}!
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Mark your attendance for today's session</p>
            <div className="mt-2 inline-block px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm font-mono">{user.email}</div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Mark Your Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <Select value={selectedSession} onValueChange={setSelectedSession}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Choose which session you're attending" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>{session.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Session code input restored */}
                <Input
                  className="w-48"
                  placeholder="Enter session code"
                  value={sessionCode}
                  onChange={e => setSessionCode(e.target.value)}
                  disabled={!selectedSession}
                />
                <Button onClick={handleMarkAttendance} disabled={isLoading || !selectedSession} className="min-w-[120px]">
                  {isLoading ? 'Marking...' : 'I Am Here! ✋'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Attendance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.map((session) => {
                  const status = attendance[session.id] || 'not-attempted'
                  return (
                    <div key={session.id} className={`rounded-lg border p-4 ${status === 'present' ? 'bg-green-50 border-green-200' : status === 'absent' ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="font-semibold text-lg mb-1">{session.name}</div>
                      <div className="text-sm text-slate-500 mb-2">{new Date(session.date).toLocaleDateString()}</div>
                      <Badge className={status === 'present' ? 'bg-green-600 text-white' : status === 'absent' ? 'bg-red-600 text-white' : 'bg-slate-400 text-white'}>
                        {status === 'present' ? 'Present' : status === 'absent' ? 'Absent' : 'Not Marked'}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
