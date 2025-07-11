"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Calendar, MapPin, GraduationCap, CreditCard } from "lucide-react"

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
  profilePhoto?: string
}

interface StudentProfileProps {
  student: Student
}

export function StudentProfile({ student }: StudentProfileProps) {
  return (
    <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5" />
          Student Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Photo and Basic Info */}
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-32 h-32 ring-4 ring-blue-500/20 mb-4">
              <AvatarImage src={student.profilePhoto || "/placeholder.svg?height=120&width=120"} alt="Student" />
              <AvatarFallback className="text-3xl font-semibold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                {student.firstName[0]}
                {student.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              {student.firstName} {student.middleName} {student.lastName}
            </h3>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-4">
              {student.rollNumber}
            </Badge>
            <Badge
              variant={student.isPaid ? "default" : "destructive"}
              className={student.isPaid ? "bg-green-600" : ""}
            >
              <CreditCard className="w-3 h-3 mr-1" />
              {student.isPaid ? "Payment Complete" : "Payment Pending"}
            </Badge>
          </div>

          {/* Personal Details */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white mb-3 text-lg">Personal Information</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-600 dark:text-slate-400">Email:</span>
                  <span className="text-slate-800 dark:text-white">{student.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-600 dark:text-slate-400">Date of Birth:</span>
                  <span className="text-slate-800 dark:text-white">{student.dateOfBirth}</span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-600 dark:text-slate-400">Gender:</span>
                  <span className="text-slate-800 dark:text-white capitalize">{student.gender}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-600 dark:text-slate-400">Address:</span>
                  <span className="text-slate-800 dark:text-white">{student.address}</span>
                </div>
                {student.mentor && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-600 dark:text-slate-400">Mentor:</span>
                    <Badge variant="outline">{student.mentor}</Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Academic Details */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white mb-3 text-lg">Academic Information</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">PRN Number:</span>
                  <span className="text-slate-800 dark:text-white font-mono">{student.prnNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Roll Number:</span>
                  <span className="text-slate-800 dark:text-white font-mono">{student.rollNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Branch:</span>
                  <span className="text-slate-800 dark:text-white">{student.branch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Division:</span>
                  <span className="text-slate-800 dark:text-white">{student.division}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Registration Date:</span>
                  <span className="text-slate-800 dark:text-white">
                    {new Date(student.registrationDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* SGPA Section */}
            {(student.sgpaSem1 || student.sgpaSem2) && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg">
                <h5 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  SGPA Scores
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {student.sgpaSem1 && (
                    <div className="text-center p-2 bg-white/50 dark:bg-slate-800/50 rounded">
                      <div className="text-lg font-bold text-purple-600">{student.sgpaSem1}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Semester 1</div>
                    </div>
                  )}
                  {student.sgpaSem2 && (
                    <div className="text-center p-2 bg-white/50 dark:bg-slate-800/50 rounded">
                      <div className="text-lg font-bold text-purple-600">{student.sgpaSem2}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Semester 2</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
