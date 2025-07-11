import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, BarChart3, Shield } from "lucide-react"
import Link from "next/link"
import { LogoutButton } from "@/components/logout-button"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
          Welcome to Ethicraft Club
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
          A modern college club management system designed for educational institutions. Manage clubs, track events, and
          streamline administrative tasks.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/register">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Student Login</Link>
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl">
          <CardHeader className="text-center">
            <GraduationCap className="w-12 h-12 mx-auto text-blue-600 mb-4" />
            <CardTitle>Student Portal</CardTitle>
            <CardDescription>Register, login, and manage your academic profile</CardDescription>
          </CardHeader>
        </Card>

        <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl">
          <CardHeader className="text-center">
            <Users className="w-12 h-12 mx-auto text-green-600 mb-4" />
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>Comprehensive student management and analytics</CardDescription>
          </CardHeader>
        </Card>

        <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl">
          <CardHeader className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto text-purple-600 mb-4" />
            <CardTitle>Progress Tracking</CardTitle>
            <CardDescription>Monitor academic progress and performance metrics</CardDescription>
          </CardHeader>
        </Card>

        <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto text-orange-600 mb-4" />
            <CardTitle>Secure & Modern</CardTitle>
            <CardDescription>Built with modern technologies and security in mind</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-8">Quick Actions</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/admin/login">Admin Login</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">View Dashboard</Link>
          </Button>
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}
