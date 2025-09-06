"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon, Clock, Brain, Target, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loading } from "@/components/ui/loading"
import { useAuth } from "@/components/auth/auth-provider"
import { studySessionsService } from "@/lib/study-sessions-service"
import Link from "next/link"
import { ScheduleSessionDialog } from "@/components/schedule-session-dialog"
import { useScheduledSessions } from "@/hooks/use-scheduled-sessions"

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default function CalendarPage() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [studySessions, setStudySessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [todayStats, setTodayStats] = useState({
    cardsReviewed: 0,
    correctAnswers: 0,
    studyTime: 0,
    accuracy: 0,
  })
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const { createScheduledSession } = useScheduledSessions()

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Load recent study sessions
      const sessions = await studySessionsService.getUserSessions(user.id, 30)
      setStudySessions(sessions || [])

      // Load today's stats
      const stats = await studySessionsService.getTodayStats(user.id)
      setTodayStats(stats)
    } catch (error) {
      console.error("Error loading calendar data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  // Get calendar days for current month
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const calendarDays = []
  const currentCalendarDate = new Date(startDate)

  for (let i = 0; i < 42; i++) {
    calendarDays.push(new Date(currentCalendarDate))
    currentCalendarDate.setDate(currentCalendarDate.getDate() + 1)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    setCurrentDate(newDate)
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const getSessionsForDate = (date: string) => {
    return studySessions.filter((session) => session.started_at.split("T")[0] === date)
  }

  const selectedDateSessions = selectedDate ? getSessionsForDate(selectedDate) : []
  const todayString = formatDate(new Date())
  const todaySessions = getSessionsForDate(todayString)

  const handleScheduleSession = async (sessionData: any) => {
    try {
      await createScheduledSession(sessionData)
      // Refresh the calendar data
      loadData()
    } catch (error) {
      console.error("Error scheduling session:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loading size="lg" />
          <p className="text-muted-foreground">Loading your study calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Calendar</h1>
          <p className="text-muted-foreground">Track your study sessions and plan your learning schedule.</p>
        </div>
        <Button onClick={() => setShowScheduleDialog(true)}>
          <CalendarIcon className="h-4 w-4 mr-2" />
          Schedule Session
        </Button>
      </div>

      {/* Today's Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Cards</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.cardsReviewed}</div>
            <p className="text-xs text-muted-foreground">Cards reviewed today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.studyTime}m</div>
            <p className="text-xs text-muted-foreground">Minutes studied today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(todayStats.accuracy)}%</div>
            <p className="text-xs text-muted-foreground">Today's accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySessions.length}</div>
            <p className="text-xs text-muted-foreground">Study sessions today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {months[month]} {year}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {daysOfWeek.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                const dateString = formatDate(day)
                const daySessions = getSessionsForDate(dateString)
                const isCurrentMonth = day.getMonth() === month
                const isToday = dateString === todayString
                const isSelected = dateString === selectedDate

                return (
                  <div
                    key={index}
                    className={`
                      p-2 min-h-[80px] border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors
                      ${!isCurrentMonth ? "text-gray-300 bg-gray-50" : ""}
                      ${isToday ? "bg-blue-50 border-blue-200" : ""}
                      ${isSelected ? "bg-blue-100 border-blue-300" : ""}
                    `}
                    onClick={() => setSelectedDate(isCurrentMonth ? dateString : null)}
                  >
                    <div className="text-sm font-medium mb-1">{day.getDate()}</div>
                    <div className="space-y-1">
                      {daySessions.length > 0 && (
                        <div className="text-xs p-1 rounded bg-green-100 text-green-800">
                          {daySessions.length} session{daySessions.length > 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Session Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {selectedDate ? `Sessions for ${new Date(selectedDate).toLocaleDateString()}` : "Today's Sessions"}
            </CardTitle>
            <CardDescription>
              {selectedDate ? selectedDateSessions.length : todaySessions.length} sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(selectedDate ? selectedDateSessions : todaySessions).map((session) => (
                <div key={session.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{session.topics?.name || "Study Session"}</h4>
                    <Badge variant="secondary">{session.session_type}</Badge>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(session.started_at).toLocaleTimeString()}
                        {session.duration_minutes && ` (${session.duration_minutes} min)`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Brain className="h-3 w-3" />
                      <span>
                        {session.cards_reviewed} cards • {session.correct_answers} correct
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {(selectedDate ? selectedDateSessions : todaySessions).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No study sessions for this day</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent" asChild>
                    <Link href="/dashboard/study">Start Studying</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      {studySessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Study Sessions</CardTitle>
            <CardDescription>Your latest study activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {studySessions.slice(0, 4).map((session) => (
                <div key={session.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{session.session_type}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(session.started_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="font-medium">{session.topics?.name || "Study Session"}</h4>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {session.duration_minutes || 0}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      {session.cards_reviewed} cards
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {studySessions.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No study sessions yet</h3>
            <p className="text-gray-600 mb-4">Start studying to see your progress on the calendar.</p>
            <Button asChild>
              <Link href="/dashboard/study">
                <Plus className="h-4 w-4 mr-2" />
                Start Your First Session
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Schedule Session Dialog */}
      <ScheduleSessionDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        onSchedule={handleScheduleSession}
        initialDate={selectedDate || todayString}
      />
    </div>
  )
}
