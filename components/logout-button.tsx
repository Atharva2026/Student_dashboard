"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const { isAuthenticated, isAdminAuthenticated, logout } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Only show the button if someone is logged in
  if (!isAuthenticated && !isAdminAuthenticated) {
    return null
  }

  const handleLogout = () => {
    const wasAdmin = isAdminAuthenticated
    const wasStudent = isAuthenticated

    logout()

    if (wasAdmin) {
      toast({
        title: "Logged out",
        description: "Admin session ended successfully",
      })
    } else if (wasStudent) {
      toast({
        title: "Logged out",
        description: "Student session ended successfully",
      })
    }

    // Refresh the page to update the UI
    window.location.reload()
  }

  return (
    <Button onClick={handleLogout} variant="destructive" size="lg" className="bg-red-600 hover:bg-red-700">
      <LogOut className="w-4 h-4 mr-2" />
      Logout {isAdminAuthenticated ? "(Admin)" : "(Student)"}
    </Button>
  )
}
