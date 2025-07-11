"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
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
import { Plus, Edit, Trash2, Calendar, Clock, MapPin, Settings } from "lucide-react"
import * as supabaseApi from "@/lib/supabaseApi"

interface DYSSession {
  id: string
  name: string
  description: string
  date: string
  time: string
  venue: string
  status: "upcoming" | "active" | "completed"
  type: "Assessment" | "Test" | "Quiz" | "Workshop"
  duration: string
  testLink?: string
  sessionCode?: string // Now optional, managed by automated generator
}

const SESSION_TYPES = ["Assessment", "Test", "Quiz", "Workshop"]
const SESSION_STATUSES = ["upcoming", "active", "completed"]

export function SessionManagement() {
  const [sessions, setSessions] = useState<DYSSession[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<DYSSession | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    status: "upcoming" as string,
    type: "Assessment" as string,
    duration: "",
    testLink: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const sessions = await supabaseApi.getSessions()
      setSessions(sessions || [])
    } catch (error: any) {
      toast({
        title: "Error loading sessions",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      date: "",
      time: "",
      venue: "",
      status: "upcoming",
      type: "Assessment",
      duration: "",
      testLink: "",
    })
  }

  const generateSessionId = () => {
    const existingIds = sessions.map((s) => s.id)
    let counter = 1
    let newId = `DYS${counter}`

    while (existingIds.includes(newId)) {
      counter++
      newId = `DYS${counter}`
    }

    return newId
  }

  const handleAddSession = async () => {
    if (!formData.name || !formData.date || !formData.time || !formData.venue) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const newSession: DYSSession = {
      id: generateSessionId(),
      ...formData,
      status: formData.status as 'upcoming' | 'active' | 'completed',
      type: formData.type as 'Assessment' | 'Test' | 'Quiz' | 'Workshop',
    }

    const { error } = await supabaseApi.addSession(newSession)
    if (error) {
      toast({
        title: "Error adding session",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    setSessions([...sessions, newSession])

    // Update all students to include the new session
    const students = JSON.parse(localStorage.getItem("students") || "[]")
    const updatedStudents = students.map((student: any) => ({
      ...student,
      attendance: {
        ...student.attendance,
        [newSession.id]: "not-attempted",
      },
    }))
    localStorage.setItem("students", JSON.stringify(updatedStudents))

    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent("sessionsUpdated"))

    toast({
      title: "Success!",
      description: `Session ${newSession.id} has been created`,
    })

    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEditSession = async () => {
    if (!editingSession || !formData.name || !formData.date || !formData.time || !formData.venue) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const updatedSession: DYSSession = {
      ...editingSession,
      ...formData,
      status: formData.status as 'upcoming' | 'active' | 'completed',
      type: formData.type as 'Assessment' | 'Test' | 'Quiz' | 'Workshop',
    }

    const { error } = await supabaseApi.updateSession(updatedSession)
    if (error) {
      toast({
        title: "Error updating session",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    const updatedSessions = sessions.map((s) => (s.id === editingSession.id ? updatedSession : s))
    setSessions(updatedSessions)

    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent("sessionsUpdated"))

    toast({
      title: "Success!",
      description: `Session ${editingSession.id} has been updated`,
    })

    resetForm()
    setEditingSession(null)
    setIsEditDialogOpen(false)
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await supabaseApi.deleteSession(sessionId)
    } catch (error: any) {
      toast({
        title: "Error deleting session",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    const updatedSessions = sessions.filter((s) => s.id !== sessionId)
    setSessions(updatedSessions)

    // Remove session from all students' attendance records
    const students = JSON.parse(localStorage.getItem("students") || "[]")
    const updatedStudents = students.map((student: any) => {
      const { [sessionId]: removed, ...remainingAttendance } = student.attendance || {}
      const { [sessionId]: removedScore, ...remainingScores } = student.testScores || {}

      return {
        ...student,
        attendance: remainingAttendance,
        testScores: remainingScores,
      }
    })
    localStorage.setItem("students", JSON.stringify(updatedStudents))

    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent("sessionsUpdated"))

    toast({
      title: "Success!",
      description: `Session ${sessionId} has been deleted`,
    })
  }

  const openEditDialog = (session: DYSSession) => {
    setEditingSession(session)
    setFormData({
      name: session.name,
      description: session.description,
      date: session.date,
      time: session.time,
      venue: session.venue,
      status: session.status,
      type: session.type,
      duration: session.duration,
      testLink: session.testLink || "",
    })
    setIsEditDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "active":
        return "bg-blue-500"
      case "upcoming":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Assessment":
        return "bg-purple-100 text-purple-800"
      case "Test":
        return "bg-red-100 text-red-800"
      case "Quiz":
        return "bg-blue-100 text-blue-800"
      case "Workshop":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Session Management
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Session Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., DYS 10 - Advanced Topics"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the session"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      placeholder="e.g., 10:00 AM - 11:30 AM"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="venue">Venue *</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g., Seminar Hall A"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SESSION_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SESSION_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 90 minutes"
                  />
                </div>
                <div>
                  <Label htmlFor="testLink">Test Link (Optional)</Label>
                  <Input
                    id="testLink"
                    value={formData.testLink}
                    onChange={(e) => setFormData({ ...formData, testLink: e.target.value })}
                    placeholder="e.g., https://example.com/test"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSession}>Add Session</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{session.name}</div>
                      <div className="text-sm text-slate-500">{session.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getTypeColor(session.type)}>
                      {session.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3" />
                        {new Date(session.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-3 h-3" />
                        {session.time}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="w-3 h-3" />
                      {session.venue}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(session.status)} text-white`}>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(session)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Session</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {session.name}? This will also remove all related
                              attendance and test score data. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteSession(session.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-600 dark:text-slate-400">No sessions configured yet.</p>
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Session Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., DYS 10 - Advanced Topics"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the session"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-date">Date *</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-time">Time *</Label>
                <Input
                  id="edit-time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="e.g., 10:00 AM - 11:30 AM"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-venue">Venue *</Label>
              <Input
                id="edit-venue"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g., Seminar Hall A"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SESSION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SESSION_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-duration">Duration</Label>
              <Input
                id="edit-duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 90 minutes"
              />
            </div>
            <div>
              <Label htmlFor="edit-testLink">Test Link (Optional)</Label>
              <Input
                id="edit-testLink"
                value={formData.testLink}
                onChange={(e) => setFormData({ ...formData, testLink: e.target.value })}
                placeholder="e.g., https://example.com/test"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSession}>Update Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
