"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Users, GraduationCap, Search, Eye, Trash2, Download, UserCheck, UserX } from "lucide-react"

interface Student {
  id: string
  firstName: string
  middleName: string
  lastName: string
  email: string
  rollNumber: string
  prnNumber: string
  dateOfBirth: string
  department: string
  division: string
  gender: string
  address: string
  registrationDate: string
  isPaid: boolean
}

export function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, searchTerm])

  const loadStudents = () => {
    // const savedStudents = JSON.parse(localStorage.getItem("students") || "[]")
    // setStudents(savedStudents)
  }

  const filterStudents = () => {
    if (!searchTerm) {
      setFilteredStudents(students)
      return
    }

    const filtered = students.filter(
      (student) =>
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.prnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.department.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredStudents(filtered)
  }

  const deleteStudent = (studentId: string) => {
    // const updatedStudents = students.filter((student) => student.id !== studentId)
    // setStudents(updatedStudents)
    // localStorage.setItem("students", JSON.stringify(updatedStudents))
    toast({ title: "Success!", description: "Student deleted successfully" })
  }

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Email",
      "PRN",
      "Roll Number",
      "Department",
      "Division",
      "Gender",
      "DOB",
      "Registration Date",
      "Payment Status",
    ]

    const csvData = filteredStudents.map((student) => [
      `${student.firstName} ${student.middleName} ${student.lastName}`.trim(),
      student.email,
      student.prnNumber,
      student.rollNumber,
      student.department,
      student.division,
      student.gender,
      student.dateOfBirth,
      new Date(student.registrationDate).toLocaleDateString(),
      student.isPaid ? "Paid" : "Pending",
    ])

    const csvContent = [headers, ...csvData].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `students_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({ title: "Success!", description: "Student data exported to CSV" })
  }

  const stats = {
    total: students.length,
    paid: students.filter((s) => s.isPaid).length,
    pending: students.filter((s) => !s.isPaid).length,
    departments: [...new Set(students.map((s) => s.department))].length,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Manage students and monitor system activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <div className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Students</div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl">
            <CardContent className="p-6 text-center">
              <UserCheck className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <div className="text-2xl font-bold text-slate-800 dark:text-white">{stats.paid}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Paid Students</div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl">
            <CardContent className="p-6 text-center">
              <UserX className="w-12 h-12 mx-auto text-orange-600 mb-4" />
              <div className="text-2xl font-bold text-slate-800 dark:text-white">{stats.pending}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Pending Payment</div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl">
            <CardContent className="p-6 text-center">
              <GraduationCap className="w-12 h-12 mx-auto text-purple-600 mb-4" />
              <div className="text-2xl font-bold text-slate-800 dark:text-white">{stats.departments}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Departments</div>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="text-xl font-semibold text-slate-800 dark:text-white">Student Management</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Button onClick={exportToCSV} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>PRN</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Division</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <TableCell className="font-medium">
                        {student.firstName} {student.middleName} {student.lastName}
                      </TableCell>
                      <TableCell>{student.prnNumber}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.department}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.division}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={student.isPaid ? "default" : "destructive"}
                          className={student.isPaid ? "bg-green-600" : ""}
                        >
                          {student.isPaid ? "Paid" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedStudent(student)}>
                            <Eye className="w-4 h-4" />
                          </Button>
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredStudents.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-600 dark:text-slate-400">
                    {searchTerm ? "No students found matching your search." : "No students registered yet."}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Student Detail Modal */}
        {selectedStudent && (
          <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Student Details</CardTitle>
                <Button variant="outline" onClick={() => setSelectedStudent(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Personal Information</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Name:</strong> {selectedStudent.firstName} {selectedStudent.middleName}{" "}
                        {selectedStudent.lastName}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedStudent.email}
                      </p>
                      <p>
                        <strong>Date of Birth:</strong> {selectedStudent.dateOfBirth}
                      </p>
                      <p>
                        <strong>Gender:</strong> {selectedStudent.gender}
                      </p>
                      <p>
                        <strong>Address:</strong> {selectedStudent.address}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Academic Information</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>PRN:</strong> {selectedStudent.prnNumber}
                      </p>
                      <p>
                        <strong>Roll Number:</strong> {selectedStudent.rollNumber}
                      </p>
                      <p>
                        <strong>Department:</strong> {selectedStudent.department}
                      </p>
                      <p>
                        <strong>Division:</strong> {selectedStudent.division}
                      </p>
                      <p>
                        <strong>Registration Date:</strong>{" "}
                        {new Date(selectedStudent.registrationDate).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Payment Status:</strong>
                        <Badge
                          variant={selectedStudent.isPaid ? "default" : "destructive"}
                          className={`ml-2 ${selectedStudent.isPaid ? "bg-green-600" : ""}`}
                        >
                          {selectedStudent.isPaid ? "Paid" : "Pending"}
                        </Badge>
                      </p>
                    </div>
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
