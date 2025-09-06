"use client"

import { useState, useEffect } from "react"
import { scheduledSessionsService } from "@/lib/scheduled-sessions-service"
import { useAuth } from "@/components/auth/auth-provider"
import type { ScheduledSession } from "@/lib/supabase"

export function useScheduledSessions() {
  const { user } = useAuth()
  const [scheduledSessions, setScheduledSessions] = useState<any[]>([])
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchScheduledSessions = async () => {
    if (!user) return

    try {
      setLoading(true)
      const [sessions, upcoming] = await Promise.all([
        scheduledSessionsService.getScheduledSessions(user.id),
        scheduledSessionsService.getUpcomingSessions(user.id),
      ])

      setScheduledSessions(sessions || [])
      setUpcomingSessions(upcoming || [])
      setError(null)
    } catch (err: any) {
      console.error("Error fetching scheduled sessions:", err)
      setError(err.message || "Failed to fetch scheduled sessions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScheduledSessions()
  }, [user])

  const createScheduledSession = async (sessionData: Omit<ScheduledSession, "id" | "created_at" | "updated_at">) => {
    if (!user) throw new Error("No user logged in")

    try {
      const newSession = await scheduledSessionsService.createScheduledSession({
        ...sessionData,
        user_id: user.id,
      })

      setScheduledSessions((prev) => [newSession, ...prev])
      setUpcomingSessions((prev) => {
        const updated = [newSession, ...prev].sort(
          (a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime(),
        )
        return updated.slice(0, 5)
      })

      return newSession
    } catch (err: any) {
      console.error("Error creating scheduled session:", err)
      throw err
    }
  }

  const updateScheduledSession = async (id: string, updates: Partial<ScheduledSession>) => {
    try {
      const updatedSession = await scheduledSessionsService.updateScheduledSession(id, updates)

      setScheduledSessions((prev) => prev.map((session) => (session.id === id ? updatedSession : session)))

      setUpcomingSessions((prev) => prev.map((session) => (session.id === id ? updatedSession : session)))

      return updatedSession
    } catch (err: any) {
      console.error("Error updating scheduled session:", err)
      throw err
    }
  }

  const deleteScheduledSession = async (id: string) => {
    try {
      await scheduledSessionsService.deleteScheduledSession(id)

      setScheduledSessions((prev) => prev.filter((session) => session.id !== id))
      setUpcomingSessions((prev) => prev.filter((session) => session.id !== id))
    } catch (err: any) {
      console.error("Error deleting scheduled session:", err)
      throw err
    }
  }

  const getSessionsForDate = async (date: string) => {
    if (!user) return []

    try {
      return await scheduledSessionsService.getSessionsForDate(user.id, date)
    } catch (err: any) {
      console.error("Error fetching sessions for date:", err)
      return []
    }
  }

  return {
    scheduledSessions,
    upcomingSessions,
    loading,
    error,
    createScheduledSession,
    updateScheduledSession,
    deleteScheduledSession,
    getSessionsForDate,
    refetch: fetchScheduledSessions,
  }
}
