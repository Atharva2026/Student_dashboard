"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Search, Eye, Trash2, Download, CheckCircle, XCircle, Circle, TrendingUp, GraduationCap } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { SessionCodeGenerator } from "@/components/session-code-generator"
// Import the new SessionManagement component at the top
import { SessionManagement } from "@/components/session-management"
import { getSessions, getStudents, createOrUpdateSession, deleteSession, setAttendance, createTest, getTestBySessionId, deleteTest, getQuestionsByTestId, createQuestion, deleteQuestion } from "@/lib/supabaseApi"

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
  profilePhoto?: string
  registrationDate: string
  isPaid: boolean
  mentor?: string
  attendance?: {
    [key: string]: "present" | "absent" | "not-attempted"
  }
  testScores?: {
    [key: string]: number
  }
}

const MENTORS = ["Kaushik", "Meghraj", "Shailesh", "Darshan"]

// Add Test and Question types
interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}
interface Test {
  id: string
  title: string
  questions: Question[]
}

// Add TestEditor component inline
function TestEditor({ sessionId, test, onSave, onCancel }: {
  sessionId: string,
  test: Test | null,
  onSave: (test: Test) => void,
  onCancel: () => void
}) {
  const [title, setTitle] = useState<string>(test?.title || "")
  const [questions, setQuestions] = useState<Question[]>(test?.questions || [])
  const [error, setError] = useState<string>("")

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { id: Date.now().toString(), question: "", options: ["", "", "", ""], correctAnswer: 0 },
    ])
  }
  const handleRemoveQuestion = (qid: string) => {
    setQuestions(questions.filter((q) => q.id !== qid))
  }
  const handleQuestionChange = (qid: string, value: string) => {
    setQuestions(questions.map((q) => (q.id === qid ? { ...q, question: value } : q)))
  }
  const handleOptionChange = (qid: string, idx: number, value: string) => {
    setQuestions(questions.map((q) =>
      q.id === qid ? { ...q, options: q.options.map((opt, i) => (i === idx ? value : opt)) } : q
    ))
  }
  const handleCorrectAnswerChange = (qid: string, idx: number) => {
    setQuestions(questions.map((q) => (q.id === qid ? { ...q, correctAnswer: idx } : q)))
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return setError("Test title is required")
    if (questions.length === 0) return setError("At least one question is required")
    for (const q of questions) {
      if (!q.question.trim() || q.options.some((opt) => !opt.trim())) return setError("All questions and options must be filled")
    }
    setError("")
    onSave({ id: test?.id || Date.now().toString(), title, questions })
  }
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 w-full max-w-2xl relative max-h-[80vh] overflow-y-auto" onSubmit={handleSubmit}>
        <h2 className="text-lg font-bold mb-4">{test ? "Edit Test" : "Create Test"}</h2>
        <label className="block mb-2 font-medium">Test Title</label>
        <input className="w-full mb-4 p-2 border rounded" value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter test title" />
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Questions</span>
            <button type="button" className="btn btn-sm btn-primary" onClick={handleAddQuestion}>+ Add Question</button>
          </div>
          {questions.length === 0 && <div className="text-slate-500">No questions yet.</div>}
          {questions.map((q, qIdx) => (
            <div key={q.id} className="mb-4 p-3 bg-slate-100 dark:bg-slate-700 rounded">
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium">Q{qIdx + 1}</label>
                <button type="button" className="btn btn-xs btn-danger" onClick={() => handleRemoveQuestion(q.id)}>Remove</button>
              </div>
              <input className="w-full mb-2 p-2 border rounded" value={q.question} onChange={e => handleQuestionChange(q.id, e.target.value)} placeholder="Enter question text" />
              <div className="grid grid-cols-2 gap-2 mb-2">
                {q.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input type="radio" name={`correct-${q.id}`} checked={q.correctAnswer === idx} onChange={() => handleCorrectAnswerChange(q.id, idx)} />
                    <input className="flex-1 p-2 border rounded" value={opt} onChange={e => handleOptionChange(q.id, idx, e.target.value)} placeholder={`Option ${idx + 1}`} />
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-500">Select the correct answer</div>
            </div>
          ))}
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save Test</button>
        </div>
      </form>
    </div>
  )
}

// Helper: map Supabase student fields to camelCase for UI
function mapStudentFromSupabase(student: any) {
  if (!student) return student;
  return {
    id: student.id,
    firstName: student.first_name,
    middleName: student.middle_name,
    lastName: student.last_name,
    email: student.email,
    rollNumber: student.roll_number,
    prnNumber: student.prn_number,
    dateOfBirth: student.date_of_birth,
    branch: student.branch,
    division: student.division,
    gender: student.gender,
    address: student.address,
    sgpaSem1: student.sgpa_sem1,
    sgpaSem2: student.sgpa_sem2,
    profilePhoto: student.profile_photo,
    registrationDate: student.registration_date,
    isPaid: student.is_paid,
    mentor: student.mentor,
    // Optionally, add attendance/testScores if you fetch them separately
  };
}

export function EnhancedAdminDashboard() {
  const { isAdminAuthenticated } = useAuth()
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null)
  const [genderFilter, setGenderFilter] = useState<string>("both")
  const [showSessionDetails, setShowSessionDetails] = useState(false)
  const [sessions, setSessions] = useState<any[]>([])
  const { toast } = useToast()
  const [testLinkInput, setTestLinkInput] = useState("")
  const [testLinkLoading, setTestLinkLoading] = useState(false)
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
  // In EnhancedAdminDashboard, add state for test editor modal
  const [showTestEditor, setShowTestEditor] = useState(false)
  const [editingTest, setEditingTest] = useState<Test | null>(null)
  const [sessionTest, setSessionTest] = useState<Test | null>(null)

  useEffect(() => {
    if (!isAdminAuthenticated) {
      router.push("/admin/login")
    }
  }, [isAdminAuthenticated, router])

  useEffect(() => {
    loadSessions()
    loadStudents()
  }, [])

  const loadSessions = async () => {
    const sessionsData = await getSessions()
    setSessions(sessionsData)
  }

  // Fetch students from Supabase
  const loadStudents = async () => {
    try {
      const studentsData = await getStudents()
      setStudents((studentsData || []).map(mapStudentFromSupabase))
    } catch (error) {
      toast({ title: "Error", description: "Failed to load students from Supabase.", variant: "destructive" })
      setStudents([])
    }
  }

  useEffect(() => {
    filterStudents()
  }, [students, searchTerm, activeSession, selectedMentor, genderFilter])

  const filterStudents = () => {
    let filtered = [...students]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.prnNumber.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Gender filter
    if (genderFilter !== "both") {
      filtered = filtered.filter((student) => student.gender.toLowerCase() === genderFilter)
    }

    // Mentor filter
    if (selectedMentor) {
      filtered = filtered.filter((student) => student.mentor === selectedMentor)
    }

    // Session filter
    if (activeSession) {
      filtered = filtered.filter(
        (student) => student.attendance && student.attendance[activeSession] !== "not-attempted",
      )
    }

    setFilteredStudents(filtered)
  }

  // Update the updateAttendance function to use Supabase
  const updateAttendance = async (studentId: string, sessionId: string, status: "present" | "absent" | "not-attempted") => {
    try {
      await setAttendance({ student_id: studentId, session_id: sessionId, status })
      toast({ title: "Attendance Updated", description: `Attendance for session updated to ${status}.` })
      // Optionally, refresh students or attendance data here
    } catch (error) {
      toast({ title: "Error", description: "Failed to update attendance.", variant: "destructive" })
    }
  }

  const deleteStudent = (studentId: string) => {
    const updatedStudents = students.filter((student) => student.id !== studentId)
    setStudents(updatedStudents)
    localStorage.setItem("students", JSON.stringify(updatedStudents))
    toast({ title: "Success!", description: "Student deleted successfully" })
  }

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Email",
      "PRN",
      "Roll Number",
      "Branch",
      "Division",
      "Gender",
      "DOB",
      "SGPA Sem1",
      "SGPA Sem2",
      "Average Score",
      "Mentor",
      "Registration Date",
      "Payment Status",
      ...sessions.map((session) => session.name),
    ]

    const csvData = filteredStudents.map((student) => {
      const scores = Object.values(student.testScores || {}).filter((score) => score > 0)
      const avgScore =
        scores.length > 0 ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1) : "N/A"

      return [
        `${student.firstName} ${student.middleName} ${student.lastName}`.trim(),
        student.email,
        student.prnNumber,
        student.rollNumber,
        student.branch,
        student.division,
        student.gender,
        student.dateOfBirth,
        student.sgpaSem1 || "N/A",
        student.sgpaSem2 || "N/A",
        avgScore,
        student.mentor || "",
        new Date(student.registrationDate).toLocaleDateString(),
        student.isPaid ? "Paid" : "Pending",
        ...sessions.map((session) => student.attendance?.[session.id] || "not-attempted"),
      ]
    })

    const csvContent = [headers, ...csvData].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ethicraft_students_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({ title: "Success!", description: "Student data exported to CSV" })
  }

  const getSessionStats = (sessionId: string) => {
    const sessionData = students.map((s) => s.attendance?.[sessionId] || "not-attempted")
    return {
      present: sessionData.filter((status) => status === "present").length,
      absent: sessionData.filter((status) => status === "absent").length,
      notAttempted: sessionData.filter((status) => status === "not-attempted").length,
      total: students.length,
    }
  }

  const getSessionAnalytics = (sessionId: string) => {
    const stats = getSessionStats(sessionId)
    const attendanceRate = stats.total > 0 ? (stats.present / stats.total) * 100 : 0

    // Gender-based analytics
    const maleStudents = students.filter((s) => s.gender.toLowerCase() === "male")
    const femaleStudents = students.filter((s) => s.gender.toLowerCase() === "female")

    const malePresent = maleStudents.filter((s) => s.attendance?.[sessionId] === "present").length
    const femalePresent = femaleStudents.filter((s) => s.attendance?.[sessionId] === "present").length

    const genderDistribution = [
      { name: "Male", value: maleStudents.length, color: "#3b82f6" },
      { name: "Female", value: femaleStudents.length, color: "#ec4899" },
    ]

    const genderAttendance = [
      { name: "Male Present", value: malePresent, color: "#10b981" },
      { name: "Male Absent", value: maleStudents.length - malePresent, color: "#ef4444" },
      { name: "Female Present", value: femalePresent, color: "#8b5cf6" },
      { name: "Female Absent", value: femaleStudents.length - femalePresent, color: "#f59e0b" },
    ]

    return {
      ...stats,
      attendanceRate,
      genderDistribution,
      genderAttendance,
      maleStats: {
        total: maleStudents.length,
        present: malePresent,
        rate: maleStudents.length > 0 ? (malePresent / maleStudents.length) * 100 : 0,
      },
      femaleStats: {
        total: femaleStudents.length,
        present: femalePresent,
        rate: femaleStudents.length > 0 ? (femalePresent / femaleStudents.length) * 100 : 0,
      },
    }
  }

  const handleSessionClick = (sessionId: string) => {
    if (activeSession === sessionId) {
      setActiveSession(null)
      setShowSessionDetails(false)
    } else {
      setActiveSession(sessionId)
      setShowSessionDetails(true)
    }
  }

  const calculateAverageScore = (student: Student) => {
    if (!student.testScores) return 0
    const scores = Object.values(student.testScores).filter((score) => score > 0)
    return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
  }

  const stats = {
    total: filteredStudents.length,
    male: filteredStudents.filter((s) => s.gender.toLowerCase() === "male").length,
    female: filteredStudents.filter((s) => s.gender.toLowerCase() === "female").length,
    paid: filteredStudents.filter((s) => s.isPaid).length,
    pending: filteredStudents.filter((s) => !s.isPaid).length,
  }

  const sessionAnalytics = activeSession ? getSessionAnalytics(activeSession) : null

  // When activeSession changes, load the test link from localStorage
  useEffect(() => {
    if (activeSession) {
      const foundSession = sessions.find((s) => s.id === activeSession)
      setTestLinkInput(foundSession?.testLink || "")
    }
  }, [activeSession, sessions])

  // When a session is selected, load its test
  useEffect(() => {
    if (activeSession) {
      (async () => {
        try {
          const foundTest = await getTestBySessionId(activeSession);
          setSessionTest(foundTest || null);
        } catch {
          setSessionTest(null);
        }
      })();
    }
  }, [activeSession]);

  if (!isAdminAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Admin Access Required</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Please login with admin credentials</p>
            <Button asChild>
              <Link href="/admin/login">Admin Login</Link>
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            Ethicraft Club Admin Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Comprehensive student and session management</p>
        </div>

        {/* DYS Session Buttons */}
        <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-800 dark:text-white">DYS Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex overflow-x-auto gap-3 pb-2">
              {sessions
                .slice() // copy array
                .sort((a, b) => {
                  // Robustly sort by DYS number (handles DYS1, DYS2, ..., DYS10, etc.)
                  const getNum = (id: string) => {
                    const match = id.match(/DYS(\d+)/i);
                    return match ? parseInt(match[1], 10) : 0;
                  };
                  return getNum(a.id) - getNum(b.id);
                })
                .map((session) => {
                  const sessionStats = getSessionStats(session.id)
                  const isActive = activeSession === session.id
                  const attendanceRate = sessionStats.total > 0 ? (sessionStats.present / sessionStats.total) * 100 : 0

                  return (
                    <Button
                      key={session.id}
                      variant={isActive ? "default" : "outline"}
                      className={`flex flex-col h-24 min-w-[180px] max-w-[200px] p-2 whitespace-normal break-words ${isActive ? "bg-blue-600" : ""}`}
                      onClick={() => handleSessionClick(session.id)}
                    >
                      <span className="text-sm font-semibold line-clamp-2">{session.name}</span>
                      <div className="text-xs mt-1 mb-2">{attendanceRate.toFixed(0)}%</div>
                      <div className="flex gap-1">
                        <div className="flex items-center">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-xs ml-1">{sessionStats.present}</span>
                        </div>
                        <div className="flex items-center">
                          <XCircle className="w-3 h-3 text-red-500" />
                          <span className="text-xs ml-1">{sessionStats.absent}</span>
                        </div>
                        <div className="flex items-center">
                          <Circle className="w-3 h-3 text-gray-400" />
                          <span className="text-xs ml-1">{sessionStats.notAttempted}</span>
                        </div>
                      </div>
                    </Button>
                  )
                })}
            </div>
            {activeSession && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Viewing detailed analytics for <strong>{sessions.find(s => s.id === activeSession)?.name}</strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Analytics (shown when a session is selected) */}
        {showSessionDetails && sessionAnalytics && (
          <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {sessions.find(s => s.id === activeSession)?.name} Session Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Session Code Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Session Code</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    className="flex-1 border rounded px-2 py-1"
                    value={sessions.find(s => s.id === activeSession)?.sessionCode || ''}
                    onChange={e => {
                      const updatedSessions = sessions.map(s =>
                        s.id === activeSession ? { ...s, sessionCode: e.target.value } : s
                      )
                      setSessions(updatedSessions)
                      debounceTimeout.current && clearTimeout(debounceTimeout.current)
                      setTestLinkLoading(true)
                      debounceTimeout.current = setTimeout(async () => {
                        try {
                          await createOrUpdateSession({ id: activeSession, sessionCode: e.target.value })
                          toast({ title: "Session Code Saved", description: "Session code updated for this session." })
                        } catch (error: any) {
                          toast({ title: "Error", description: error?.message || JSON.stringify(error), variant: "destructive" })
                        } finally {
                          setTestLinkLoading(false)
                        }
                      }, 500)
                    }}
                    placeholder="Enter session code (e.g., SELF2024)"
                  />
                  {testLinkLoading && <span className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></span>}
                </div>
              </div>
              {/* Test Link Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Test Link</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    className="flex-1 border rounded px-2 py-1"
                    value={testLinkInput}
                    onChange={e => {
                      setTestLinkInput(e.target.value)
                      if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
                      setTestLinkLoading(true)
                      debounceTimeout.current = setTimeout(async () => {
                        try {
                          await createOrUpdateSession({ id: activeSession, testLink: e.target.value })
                          toast({ title: "Test Link Saved", description: "Test link updated for this session." })
                        } catch (error: any) {
                          toast({ title: "Error", description: error?.message || JSON.stringify(error), variant: "destructive" })
                        } finally {
                          setTestLinkLoading(false)
                        }
                      }, 500)
                    }}
                    placeholder="Paste test link here (e.g., https://...)"
                  />
                  {testLinkLoading && <span className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></span>}
                </div>
              </div>
              {/* Overall Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{sessionAnalytics.present}</div>
                  <div className="text-sm text-green-700 dark:text-green-300">Present</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{sessionAnalytics.absent}</div>
                  <div className="text-sm text-red-700 dark:text-red-300">Absent</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{sessionAnalytics.notAttempted}</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">Not Attempted</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{sessionAnalytics.attendanceRate.toFixed(1)}%</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Attendance Rate</div>
                </div>
              </div>

              {/* Gender Analytics with Donut Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Gender Distribution Chart */}
                <Card className="p-6">
                  <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 text-center">
                    Gender Distribution
                  </h4>
                  <div className="relative h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sessionAnalytics.genderDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {sessionAnalytics.genderDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-800 dark:text-white">
                          {sessionAnalytics.genderDistribution.reduce((sum, item) => sum + item.value, 0)}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Total Students</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                    {sessionAnalytics.genderDistribution.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {entry.name}: {entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Gender-wise Attendance Chart */}
                <Card className="p-6">
                  <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 text-center">
                    Attendance by Gender
                  </h4>
                  <div className="relative h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sessionAnalytics.genderAttendance}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {sessionAnalytics.genderAttendance.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-800 dark:text-white">
                          {sessionAnalytics.attendanceRate.toFixed(0)}%
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Overall Rate</div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {sessionAnalytics.genderAttendance.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {entry.name}: {entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Gender Statistics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Male Students</h5>
                  <div className="space-y-1 text-sm">
                    <p>
                      Total: <span className="font-medium">{sessionAnalytics.maleStats.total}</span>
                    </p>
                    <p>
                      Present: <span className="font-medium text-green-600">{sessionAnalytics.maleStats.present}</span>
                    </p>
                    <p>
                      Attendance Rate:{" "}
                      <span className="font-medium">{sessionAnalytics.maleStats.rate.toFixed(1)}%</span>
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                  <h5 className="font-semibold text-pink-800 dark:text-pink-200 mb-2">Female Students</h5>
                  <div className="space-y-1 text-sm">
                    <p>
                      Total: <span className="font-medium">{sessionAnalytics.femaleStats.total}</span>
                    </p>
                    <p>
                      Present:{" "}
                      <span className="font-medium text-green-600">{sessionAnalytics.femaleStats.present}</span>
                    </p>
                    <p>
                      Attendance Rate:{" "}
                      <span className="font-medium">{sessionAnalytics.femaleStats.rate.toFixed(1)}%</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Management for Session */}
        {showSessionDetails && activeSession && (
          <div className="mb-6 flex flex-col items-center">
            <button className="btn btn-primary text-lg px-8 py-3 rounded-lg shadow-lg mb-2" style={{background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)', color: 'white'}} onClick={() => setShowTestEditor(true)}>
              {sessionTest ? "Edit Test" : "Create Test"} for this Session
            </button>
            {sessionTest && (
              <button className="btn btn-danger ml-2 mt-2 px-6 py-2 rounded-lg" onClick={async () => {
                await deleteTest(activeSession)
                setSessionTest(null)
              }}>
                Delete Test
              </button>
            )}
            {showTestEditor && (
              <TestEditor
                sessionId={activeSession}
                test={sessionTest}
                onSave={async testObj => {
                  try {
                    let testId = sessionTest?.id;
                    if (!sessionTest) {
                      // Create the test (without questions and without id)
                      const { id, ...testData } = testObj; // Remove id if present
                      const created = await createTest({ title: testData.title, session_id: activeSession });
                      testId = created?.[0]?.id;
                    } else {
                      // Optionally, update the test title if changed (implement updateTest if needed)
                      // For now, just delete old questions and re-insert
                    }
                    if (!testId) throw new Error('Failed to create or find test id');
                    // If editing, delete old questions first
                    if (sessionTest) {
                      const oldQuestions = await getQuestionsByTestId(testId);
                      for (const q of oldQuestions) {
                        await deleteQuestion(q.id);
                      }
                    }
                    // Insert new questions
                    for (const q of testObj.questions) {
                      await createQuestion({
                        test_id: testId,
                        question: q.question,
                        options: q.options,
                        correct_answer: q.correctAnswer
                      });
                    }
                    // After saving, reload the test and its questions
                    const savedTest = await getTestBySessionId(activeSession);
                    if (savedTest) {
                      const questions = await getQuestionsByTestId(savedTest.id);
                      setSessionTest({ ...savedTest, questions });
                    } else {
                      setSessionTest(null);
                    }
                    setShowTestEditor(false);
                  } catch (error: any) {
                    toast({ title: "Error", description: error?.message || JSON.stringify(error), variant: "destructive" });
                  }
                }}
                onCancel={() => setShowTestEditor(false)}
              />
            )}
          </div>
        )}

        {/* Session Code Generator (shown when a session is selected) */}
        {showSessionDetails && activeSession && <SessionCodeGenerator sessionId={activeSession} />}

        {/* Session Management */}
        <SessionManagement />

        {/* Mentor Filter Bar */}
        <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-white">Mentor Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedMentor === null ? "default" : "outline"}
                onClick={() => setSelectedMentor(null)}
                className="whitespace-nowrap"
              >
                All Mentors
              </Button>
              {MENTORS.map((mentor) => (
                <Button
                  key={mentor}
                  variant={selectedMentor === mentor ? "default" : "outline"}
                  onClick={() => setSelectedMentor(selectedMentor === mentor ? null : mentor)}
                  className="whitespace-nowrap"
                >
                  {mentor}
                </Button>
              ))}
            </div>
            {selectedMentor && (
              <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Filtering by mentor: <strong>{selectedMentor}</strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search & Gender Filter + Stats */}
        <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search (by name, email, roll no, etc.)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={genderFilter} onValueChange={setGenderFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Both Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Live Stats */}
              <div className="flex gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-blue-600">{stats.total}</div>
                  <div className="text-slate-600 dark:text-slate-400">Total</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-600">{stats.male}</div>
                  <div className="text-slate-600 dark:text-slate-400">Male</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-pink-600">{stats.female}</div>
                  <div className="text-slate-600 dark:text-slate-400">Female</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Table */}
        <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="text-xl font-semibold text-slate-800 dark:text-white">
                Student Management
                {(activeSession || selectedMentor || genderFilter !== "both" || searchTerm) && (
                  <Badge variant="secondary" className="ml-2">
                    Filtered
                  </Badge>
                )}
              </CardTitle>
              <Button onClick={exportToCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Mentor</TableHead>
                    <TableHead className="text-center">Attendance (DYS1-DYS9)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student, index) => (
                    <TableRow key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <TableCell className="font-mono text-sm">{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div>
                            {student.firstName} {student.middleName} {student.lastName}
                          </div>
                          <div className="text-xs text-slate-500">{student.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => setSelectedStudent(student)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {student.mentor}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {sessions.map((session) => {
                            const status = student.attendance?.[session.id] || "not-attempted"
                            return (
                              <div key={session.id} className="flex flex-col items-center">
                                <div className="text-xs text-slate-500 mb-1">{session.name.replace("DYS", "")}</div>
                                <RadioGroup
                                  value={status}
                                  onValueChange={(value) => updateAttendance(student.id, session.id, value as any)}
                                  className="flex gap-1"
                                >
                                  <div className="flex items-center">
                                    <RadioGroupItem
                                      value="present"
                                      id={`${student.id}-${session.id}-present`}
                                      className="w-3 h-3 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                    />
                                    <Label htmlFor={`${student.id}-${session.id}-present`} className="sr-only">
                                      Present
                                    </Label>
                                  </div>
                                  <div className="flex items-center">
                                    <RadioGroupItem
                                      value="absent"
                                      id={`${student.id}-${session.id}-absent`}
                                      className="w-3 h-3 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                                    />
                                    <Label htmlFor={`${student.id}-${session.id}-absent`} className="sr-only">
                                      Absent
                                    </Label>
                                  </div>
                                  <div className="flex items-center">
                                    <RadioGroupItem
                                      value="not-attempted"
                                      id={`${student.id}-${session.id}-not-attempted`}
                                      className="w-3 h-3 data-[state=checked]:bg-gray-400 data-[state=checked]:border-gray-400"
                                    />
                                    <Label htmlFor={`${student.id}-${session.id}-not-attempted`} className="sr-only">
                                      Not Attempted
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </div>
                            )
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Student</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {student.firstName} {student.lastName}? This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteStudent(student.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredStudents.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-600 dark:text-slate-400">
                  {searchTerm || activeSession || selectedMentor || genderFilter !== "both"
                    ? "No students found matching your filters."
                    : "No students registered yet."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Student Detail Modal */}
        {selectedStudent && (
          <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold text-slate-800 dark:text-white">Student Details</CardTitle>
                <Button variant="outline" onClick={() => setSelectedStudent(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Photo Section */}
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-32 h-32 ring-4 ring-blue-500/20 mb-4">
                    <AvatarImage
                      src={selectedStudent.profilePhoto || "/placeholder.svg?height=120&width=120"}
                      alt="Student"
                    />
                    <AvatarFallback className="text-3xl font-semibold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {selectedStudent.firstName[0]}
                      {selectedStudent.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                    {selectedStudent.firstName} {selectedStudent.middleName} {selectedStudent.lastName}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-4"
                  >
                    {selectedStudent.rollNumber}
                  </Badge>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-3 text-lg">Personal Information</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-600 dark:text-slate-400">Name:</span>
                        <span className="text-slate-800 dark:text-white">
                          {selectedStudent.firstName} {selectedStudent.middleName} {selectedStudent.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-600 dark:text-slate-400">Email:</span>
                        <span className="text-slate-800 dark:text-white">{selectedStudent.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-600 dark:text-slate-400">Date of Birth:</span>
                        <span className="text-slate-800 dark:text-white">{selectedStudent.dateOfBirth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-600 dark:text-slate-400">Gender:</span>
                        <span className="text-slate-800 dark:text-white capitalize">{selectedStudent.gender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-600 dark:text-slate-400">Address:</span>
                        <span className="text-slate-800 dark:text-white">{selectedStudent.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-600 dark:text-slate-400">Mentor:</span>
                        <span className="text-slate-800 dark:text-white">{selectedStudent.mentor}</span>
                      </div>
                    </div>
                  </div>

                  {/* SGPA Section */}
                  {(selectedStudent.sgpaSem1 || selectedStudent.sgpaSem2) && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg mb-4">
                      <h5 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        SGPA Scores
                      </h5>
                      <div className="flex gap-4">
                        {selectedStudent.sgpaSem1 && (
                          <span className="text-sm text-slate-700 dark:text-slate-200">Sem 1: <span className="font-bold">{selectedStudent.sgpaSem1}</span></span>
                        )}
                        {selectedStudent.sgpaSem2 && (
                          <span className="text-sm text-slate-700 dark:text-slate-200">Sem 2: <span className="font-bold">{selectedStudent.sgpaSem2}</span></span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Test Scores Section */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                    <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Test Scores
                    </h5>
                    {sessions.length > 0 ? (
                      <div className="space-y-2">
                        {sessions.map((session) => {
                          const score = selectedStudent.testScores?.[session.id]
                          return (
                            <div key={session.id} className="flex items-center justify-between gap-4 py-1 border-b last:border-b-0 border-slate-100 dark:border-slate-800">
                              <span className="text-sm text-slate-700 dark:text-slate-200 flex-1">{session.name}</span>
                              {typeof score === 'number' ? (
                                <span className="inline-flex items-center gap-2">
                                  <span className={`font-bold text-base ${score >= 90 ? 'text-green-600' : score >= 75 ? 'text-blue-600' : score >= 60 ? 'text-yellow-600' : score > 0 ? 'text-orange-600' : 'text-slate-400'}`}>{score}%</span>
                                  <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden">
                                    <div className={`h-2 rounded ${score >= 90 ? 'bg-green-500' : score >= 75 ? 'bg-blue-500' : score >= 60 ? 'bg-yellow-500' : score > 0 ? 'bg-orange-500' : 'bg-slate-400'}`} style={{ width: `${score}%` }}></div>
                                  </div>
                                </span>
                              ) : (
                                <span className="text-slate-400 text-sm">-</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-slate-400 text-sm py-4 text-center">No test scores yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
