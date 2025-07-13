"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Copy, RefreshCw, Key } from "lucide-react"
import { createOrUpdateSession } from "@/lib/supabaseApi"

const SESSION_CODES = {
  DYS1: "SELF2024",
  DYS2: "EMOT2024",
  DYS3: "COMM2024",
  DYS4: "LEAD2024",
  DYS5: "TEAM2024",
  DYS6: "PROB2024",
  DYS7: "GOAL2024",
  DYS8: "BRAND2024",
  DYS9: "FINAL2024",
}

export function SessionCodeGenerator({ sessionId }: { sessionId: string }) {
  const [showCode, setShowCode] = useState(false)
  const [codes, setCodes] = useState<{ [key: string]: string }>({ ...SESSION_CODES })
  const [editMode, setEditMode] = useState(false)
  const [editValue, setEditValue] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    // Remove all localStorage usage. Use Supabase for all session code operations.
  }, [])

  useEffect(() => {
    setEditValue(codes[sessionId] || "")
  }, [sessionId, codes])

  const currentCode = codes[sessionId] || ""

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentCode)
      toast({
        title: "Code Copied!",
        description: "Session code has been copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy code to clipboard",
        variant: "destructive",
      })
    }
  }

  const generateNewCode = async () => {
    // Generate a random 8-character code
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase()
    const updated = { ...codes, [sessionId]: newCode }
    setCodes(updated)
    setEditValue(newCode)
    try {
      console.log('Attempting to update session code:', { id: sessionId, session_code: newCode })
      await createOrUpdateSession({ id: sessionId, session_code: newCode })
      toast({ title: "Code Saved", description: "Session code has been saved to Supabase." })
    } catch (error) {
      console.error('Supabase error:', error)
      toast({ title: "Error", description: `Failed to save code to Supabase: ${(error as any)?.message || error}`, variant: "destructive" })
    }
    toast({
      title: "Code Regenerated",
      description: "New session code has been generated",
    })
  }

  const saveEdit = async () => {
    const updated = { ...codes, [sessionId]: editValue }
    setCodes(updated)
    try {
      console.log('Attempting to update session code:', { id: sessionId, session_code: editValue })
      await createOrUpdateSession({ id: sessionId, session_code: editValue })
      toast({ title: "Code Saved", description: "Session code has been saved to Supabase." })
    } catch (error) {
      console.error('Supabase error:', error)
      toast({ title: "Error", description: `Failed to save code to Supabase: ${(error as any)?.message || error}`, variant: "destructive" })
    }
    setEditMode(false)
    toast({
      title: "Code Updated",
      description: "Session code has been updated",
    })
  }

  return (
    <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-600" />
          Session Code Generator - {sessionId}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Code Display */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Current Session Code</h3>
              <Badge className="bg-blue-600 text-white">Active</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                {editMode ? (
                  <div className="flex gap-2 items-center">
                    <input
                      className="text-3xl font-mono font-bold text-blue-900 dark:text-blue-100 tracking-wider border rounded px-2 py-1"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value.toUpperCase())}
                      maxLength={12}
                    />
                    <Button size="sm" onClick={saveEdit} className="bg-green-600 text-white">Save</Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditMode(false); setEditValue(currentCode) }}>Cancel</Button>
                  </div>
                ) : (
                <div className="text-3xl font-mono font-bold text-blue-900 dark:text-blue-100 tracking-wider">
                  {showCode ? currentCode : "••••••••"}
                </div>
                )}
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Share this code with students to mark their attendance
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCode(!showCode)}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateNewCode}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(true)}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
                >
                  Edit
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">For Instructors</h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Display this code to students during the session</li>
                <li>• Students need this code to mark attendance</li>
                <li>• Code is session-specific and secure</li>
                <li>• Regenerate if needed for security</li>
              </ul>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">For Students</h4>
              <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                <li>• Go to Self Attendance Portal</li>
                <li>• Select the current session ({sessionId})</li>
                <li>• Enter the session code shown above</li>
                <li>• Click "I Am Here!" to mark attendance</li>
              </ul>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button className="flex-1" onClick={copyToClipboard}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Code
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowCode(!showCode)}>
              {showCode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showCode ? "Hide Code" : "Show Code"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
