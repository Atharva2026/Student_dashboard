"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { createOrUpdateStudent, getStudents } from "@/lib/supabaseApi"

const branches = ["CE", "ENTC", "IT", "ECE", "AIDS"]
const divisions = Array.from({ length: 13 }, (_, i) => (i + 1).toString())

export function StudentRegistrationForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    rollNumber: "",
    prnNumber: "",
    dateOfBirth: undefined as Date | undefined,
    branch: "",
    division: "",
    gender: "",
    address: "",
    sgpaSem1: "",
    sgpaSem2: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.rollNumber ||
      !formData.prnNumber ||
      !formData.dateOfBirth ||
      !formData.branch ||
      !formData.division ||
      !formData.gender ||
      !formData.address
    ) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" })
      return
    }

    setIsSubmitting(true)

    try {
      // Check for duplicates in Supabase
      const existingStudents = await getStudents()
      if (existingStudents.some((s: any) => s.email === formData.email)) {
        toast({ title: "Error", description: "Email already registered", variant: "destructive" })
        setIsSubmitting(false)
        return
      }
      if (existingStudents.some((s: any) => s.prn_number === formData.prnNumber)) {
        toast({ title: "Error", description: "PRN already registered", variant: "destructive" })
        setIsSubmitting(false)
        return
      }

      // Create student in Supabase
      const newStudent = {
        first_name: formData.firstName,
        middle_name: formData.middleName,
        last_name: formData.lastName,
        email: formData.email,
        roll_number: formData.rollNumber,
        prn_number: formData.prnNumber,
        date_of_birth: format(formData.dateOfBirth!, "yyyy-MM-dd"),
        branch: formData.branch,
        division: formData.division,
        gender: formData.gender,
        address: formData.address,
        sgpa_sem1: formData.sgpaSem1,
        sgpa_sem2: formData.sgpaSem2,
        registration_date: new Date().toISOString(),
        is_paid: false,
        mentor: ["Kaushik", "Meghraj", "Shailesh", "Darshan"][Math.floor(Math.random() * 4)],
      }
      await createOrUpdateStudent(newStudent)

      toast({ title: "Success!", description: "Registration completed successfully" })

      // Reset form
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        rollNumber: "",
        prnNumber: "",
        dateOfBirth: undefined,
        branch: "",
        division: "",
        gender: "",
        address: "",
        sgpaSem1: "",
        sgpaSem2: "",
      })

      setTimeout(() => router.push("/login"), 2000)
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="First name"
            required
          />
        </div>
        <div>
          <Label htmlFor="middleName">Middle Name</Label>
          <Input
            id="middleName"
            value={formData.middleName}
            onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
            placeholder="Middle name"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="Last name"
            required
          />
        </div>
      </div>

      {/* Contact & Academic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Email address"
            required
          />
        </div>
        <div>
          <Label htmlFor="rollNumber">Roll Number *</Label>
          <Input
            id="rollNumber"
            value={formData.rollNumber}
            onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
            placeholder="Roll number"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="prnNumber">PRN Number *</Label>
          <Input
            id="prnNumber"
            value={formData.prnNumber}
            onChange={(e) => setFormData({ ...formData, prnNumber: e.target.value })}
            placeholder="PRN number"
            required
          />
        </div>
        <div>
          <Label>Date of Birth *</Label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={formData.dateOfBirth ? format(formData.dateOfBirth, "yyyy-MM-dd") : ""}
              onChange={(e) => {
                if (e.target.value) {
                  setFormData({ ...formData, dateOfBirth: new Date(e.target.value) })
                } else {
                  setFormData({ ...formData, dateOfBirth: undefined })
                }
              }}
              max={format(new Date(), "yyyy-MM-dd")}
              min="1900-01-01"
              className="flex-1"
              placeholder="YYYY-MM-DD"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dateOfBirth}
                  onSelect={(date) => setFormData({ ...formData, dateOfBirth: date })}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <p className="text-xs text-slate-500 mt-1">You can type the date or use the calendar picker</p>
        </div>
      </div>

      {/* Branch & Division */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Branch *</Label>
          <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Division *</Label>
          <Select value={formData.division} onValueChange={(value) => setFormData({ ...formData, division: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select division" />
            </SelectTrigger>
            <SelectContent>
              {divisions.map((div) => (
                <SelectItem key={div} value={div}>
                  Division {div}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* SGPA Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sgpaSem1">SGPA Semester 1 (Optional)</Label>
          <Input
            id="sgpaSem1"
            type="number"
            step="0.01"
            min="0"
            max="10"
            value={formData.sgpaSem1}
            onChange={(e) => setFormData({ ...formData, sgpaSem1: e.target.value })}
            placeholder="e.g., 8.5"
          />
        </div>
        <div>
          <Label htmlFor="sgpaSem2">SGPA Semester 2 (Optional)</Label>
          <Input
            id="sgpaSem2"
            type="number"
            step="0.01"
            min="0"
            max="10"
            value={formData.sgpaSem2}
            onChange={(e) => setFormData({ ...formData, sgpaSem2: e.target.value })}
            placeholder="e.g., 9.0"
          />
        </div>
      </div>

      {/* Gender */}
      <div>
        <Label>Gender *</Label>
        <RadioGroup
          value={formData.gender}
          onValueChange={(value) => setFormData({ ...formData, gender: value })}
          className="flex space-x-6 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male">Male</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female">Female</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="other" id="other" />
            <Label htmlFor="other">Other</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Address */}
      <div>
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Complete address"
          rows={3}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Registering..." : "Register"}
      </Button>
    </form>
  )
}
