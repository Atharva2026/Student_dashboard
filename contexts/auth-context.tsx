"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import {
  getStudentById,
  getStudents,
  createOrUpdateStudent,
} from "@/lib/supabaseApi"

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
}

interface AuthContextType {
  user: Student | null
  isAuthenticated: boolean
  isAdminAuthenticated: boolean
  login: (email: string, prnNumber: string) => Promise<boolean>
  adminLogin: (email: string, password: string) => boolean
  logout: () => void
  updateProfile: (updatedData: Partial<Student>) => Promise<void>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Student | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session (Supabase only, no localStorage)
    // Optionally, you can persist user in sessionStorage or use Supabase Auth
    setUser(null)
    setIsAuthenticated(false)
    setIsAdminAuthenticated(false)
  }, [])

  const login = async (email: string, prnNumber: string): Promise<boolean> => {
    if (isAdminAuthenticated) return false
    const students = await getStudents()
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPrn = prnNumber.trim().toLowerCase()
    const student = students.find((s: any) =>
      (s.email?.trim().toLowerCase() === normalizedEmail) &&
      (s.prn_number?.trim().toLowerCase() === normalizedPrn)
    )
    if (student) {
      setUser({
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
      })
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const adminLogin = (email: string, password: string): boolean => {
    if (isAuthenticated) return false
    if (email === "admin@ethicraft.com" && password === "admin123") {
      setIsAdminAuthenticated(true)
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    setIsAdminAuthenticated(false)
    router.push("/")
  }

  const updateProfile = async (updatedData: Partial<Student>) => {
    if (!user) return
    const updatedUser = { ...user, ...updatedData }
    await createOrUpdateStudent({
      ...updatedUser,
      first_name: updatedUser.firstName,
      middle_name: updatedUser.middleName,
      last_name: updatedUser.lastName,
      roll_number: updatedUser.rollNumber,
      prn_number: updatedUser.prnNumber,
      date_of_birth: updatedUser.dateOfBirth,
      sgpa_sem1: updatedUser.sgpaSem1,
      sgpa_sem2: updatedUser.sgpaSem2,
      profile_photo: updatedUser.profilePhoto,
      registration_date: updatedUser.registrationDate,
      is_paid: updatedUser.isPaid,
    })
    setUser(updatedUser)
  }

  const refreshUserData = async () => {
    if (!user) return
    const fresh = await getStudentById(user.id)
    setUser({
      id: fresh.id,
      firstName: fresh.first_name,
      middleName: fresh.middle_name,
      lastName: fresh.last_name,
      email: fresh.email,
      rollNumber: fresh.roll_number,
      prnNumber: fresh.prn_number,
      dateOfBirth: fresh.date_of_birth,
      branch: fresh.branch,
      division: fresh.division,
      gender: fresh.gender,
      address: fresh.address,
      sgpaSem1: fresh.sgpa_sem1,
      sgpaSem2: fresh.sgpa_sem2,
      profilePhoto: fresh.profile_photo,
      registrationDate: fresh.registration_date,
      isPaid: fresh.is_paid,
      mentor: fresh.mentor,
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdminAuthenticated,
        login,
        adminLogin,
        logout,
        updateProfile,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
