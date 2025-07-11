"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function AdminLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { adminLogin, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Check if student is logged in
      if (isAuthenticated) {
        toast({
          title: "Cannot Login",
          description: "Please log out from student account first before logging in as admin",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const success = adminLogin(email, password)

      if (success) {
        toast({ title: "Success!", description: "Admin login successful" })
        router.push("/admin/dashboard")
      } else {
        toast({
          title: "Error",
          description: "Invalid admin credentials",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {isAuthenticated && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Notice:</strong> You are currently logged in as a student. Please log out first to login as admin.
          </p>
        </div>
      )}

      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Demo Credentials:</strong>
          <br />
          Email: admin@ethicraft.com
          <br />
          Password: admin123
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="email">Admin Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter admin email"
            required
            disabled={isAuthenticated}
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            disabled={isAuthenticated}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || isAuthenticated}>
          {isLoading ? "Logging in..." : "Admin Login"}
        </Button>
      </form>
    </div>
  )
}
