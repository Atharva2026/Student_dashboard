"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function StudentLoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    prnNumber: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const success = await login(formData.email, formData.prnNumber)
      if (!success) {
        toast({ title: "Error", description: "Invalid credentials", variant: "destructive" })
        setIsSubmitting(false)
        return
      }
      toast({ title: "Success!", description: "Login successful" })
      setTimeout(() => router.push("/dashboard"), 1000)
    } catch (error) {
      toast({ title: "Error", description: "Login failed", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* isAdminAuthenticated check removed as per new_code */}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter your email"
          required
          // disabled={isAdminAuthenticated} // Removed as per new_code
        />
      </div>

      <div>
        <Label htmlFor="prnNumber">PRN Number</Label>
        <Input
          id="prnNumber"
          value={formData.prnNumber}
          onChange={(e) => setFormData({ ...formData, prnNumber: e.target.value })}
          placeholder="Enter your PRN number"
          required
          // disabled={isAdminAuthenticated} // Removed as per new_code
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Login"}
      </Button>
    </form>
  )
}
