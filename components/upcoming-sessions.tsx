"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Play, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useScheduledSessions } from "@/hooks/use-scheduled-sessions"
import { formatDateTime } from "@/lib/utils"
import Link from "next/link"

export function UpcomingSessions() {
  const { upcomingSessions, loading, deleteScheduledSession } = useScheduledSessions()

  const handleDelete = async (sessionId: string) => {
    if (confirm("Are you sure you want to cancel this scheduled session?")) {
      try {
        await deleteScheduledSession(sessionId)
      } catch (error) {
        console.error("Error deleting session:", error)
      }
    }
  }

  const getSessionStatus = (scheduledDate: string) => {
    const now = new Date()
    const sessionTime = new Date(scheduledDate)
    const diffMinutes = Math.floor((sessionTime.getTime() - now.getTime()) / (1000 * 60))

    if (diffMinutes < 0) return { status: "overdue", label: "Overdue", variant: "destructive" as const }
    if (diffMinutes <= 15) return { status: "starting-soon", label: "Starting Soon", variant: "default" as const }
    if (diffMinutes <= 60) return { status: "upcoming", label: "Upcoming", variant: "secondary" as const }
    return { status: "scheduled", label: "Scheduled", variant: "outline" as const }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (upcomingSessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No upcoming sessions scheduled</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingSessions.map((session) => {
            const statusInfo = getSessionStatus(session.scheduled_date)

            return (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: session.topics?.color || "#3B82F6" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{session.title}</h4>
                      <Badge variant={statusInfo.variant} className="text-xs">
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDateTime(session.scheduled_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.duration_minutes}m
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {statusInfo.status === "starting-soon" && (
                    <Button size="sm" asChild>
                      <Link href="/dashboard/study">
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Link>
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/study">Start Session</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit Session</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(session.id)}>
                        Cancel Session
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
