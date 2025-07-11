"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LogOut,
  Moon,
  Sun,
  Menu,
  GraduationCap,
  Home,
  User,
  Settings,
  Shield,
  UserCheck,
  HelpCircle,
  CheckSquare,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function Navbar() {
  const [isDark, setIsDark] = useState(false)
  const { user, isAuthenticated, isAdminAuthenticated, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  const handleLogout = () => {
    const wasAdmin = isAdminAuthenticated
    const wasStudent = isAuthenticated

    try {
      logout() // Call the logout function

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

      // Force redirect to home page
      window.location.href = "/"
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getCurrentUser = () => {
    if (isAdminAuthenticated) {
      return {
        name: "Administrator",
        email: "admin@ethicraft.com",
        type: "Admin",
        avatar: "A",
        color: "bg-orange-600",
      }
    } else if (isAuthenticated && user) {
      return {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        type: "Student",
        avatar: user.firstName[0] + user.lastName[0],
        color: "bg-blue-600",
      }
    }
    return null
  }

  const currentUser = getCurrentUser()

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-white/20 dark:border-slate-700/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Ethicraft Club
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            {/* Self Attendance Link - Always visible */}
            <Link
              href="/attendance"
              className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Self Attendance</span>
            </Link>

            {!isAuthenticated && !isAdminAuthenticated && (
              <>
                <Link
                  href="/register"
                  className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Student Login
                </Link>
                <Link
                  href="/admin/login"
                  className="text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  Admin Login
                </Link>
              </>
            )}

            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Dashboard
              </Link>
            )}

            {isAdminAuthenticated && (
              <Link
                href="/admin/dashboard"
                className="text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-9 h-9 rounded-full">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full">
                  {currentUser ? (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.profilePhoto || "/placeholder.svg"} alt={currentUser.name} />
                      <AvatarFallback className={`text-white text-xs font-semibold ${currentUser.color}`}>
                        {currentUser.avatar}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end">
                {/* Show current user info when logged in */}
                {currentUser && (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-center space-x-3 py-2">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user?.profilePhoto || "/placeholder.svg"} alt={currentUser.name} />
                          <AvatarFallback className={`text-white text-sm font-semibold ${currentUser.color}`}>
                            {currentUser.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none text-slate-900 dark:text-slate-100">
                            {currentUser.name}
                          </p>
                          <p className="text-xs leading-none text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {isAdminAuthenticated ? (
                              <Shield className="w-3 h-3 text-orange-600" />
                            ) : (
                              <UserCheck className="w-3 h-3 text-blue-600" />
                            )}
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              Logged in as {currentUser.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* Dashboard link based on current login */}
                    {isAuthenticated && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">
                          <UserCheck className="mr-2 h-4 w-4" />
                          <span>Student Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {isAdminAuthenticated && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {/* Self Attendance Link in dropdown too */}
                    <DropdownMenuItem asChild>
                      <Link href="/attendance">
                        <CheckSquare className="mr-2 h-4 w-4" />
                        <span>Self Attendance</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Help</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Logout option */}
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </>
                )}

                {/* Show login options when not authenticated */}
                {!isAuthenticated && !isAdminAuthenticated && (
                  <>
                    <DropdownMenuLabel>
                      <div className="flex items-center space-x-3 py-2">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-slate-200 dark:bg-slate-700">
                            <User className="w-5 h-5 text-slate-500" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none text-slate-900 dark:text-slate-100">
                            Not logged in
                          </p>
                          <p className="text-xs leading-none text-slate-500 dark:text-slate-400">
                            Please sign in to continue
                          </p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/login">
                        <UserCheck className="mr-2 h-4 w-4" />
                        <span>Student Login</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/login">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Login</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/register">
                        <User className="mr-2 h-4 w-4" />
                        <span>Register as Student</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/attendance">
                        <CheckSquare className="mr-2 h-4 w-4" />
                        <span>Self Attendance</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden w-9 h-9 rounded-full">
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
