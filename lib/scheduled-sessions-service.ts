import { supabase } from "./supabase"
import type { ScheduledSession } from "./supabase"

export const scheduledSessionsService = {
  // Get all scheduled sessions for a user
  async getScheduledSessions(userId: string) {
    const { data, error } = await supabase
      .from("scheduled_sessions")
      .select(`
        *,
        topics(name, color)
      `)
      .eq("user_id", userId)
      .order("scheduled_date", { ascending: true })

    if (error) throw error
    return data
  },

  // Get upcoming scheduled sessions
  async getUpcomingSessions(userId: string, limit = 5) {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("scheduled_sessions")
      .select(`
        *,
        topics(name, color)
      `)
      .eq("user_id", userId)
      .eq("status", "scheduled")
      .gte("scheduled_date", now)
      .order("scheduled_date", { ascending: true })
      .limit(limit)

    if (error) throw error
    return data
  },

  // Get sessions for a specific date
  async getSessionsForDate(userId: string, date: string) {
    const startOfDay = `${date}T00:00:00.000Z`
    const endOfDay = `${date}T23:59:59.999Z`

    const { data, error } = await supabase
      .from("scheduled_sessions")
      .select(`
        *,
        topics(name, color)
      `)
      .eq("user_id", userId)
      .gte("scheduled_date", startOfDay)
      .lte("scheduled_date", endOfDay)
      .order("scheduled_date", { ascending: true })

    if (error) throw error
    return data
  },

  // Create a new scheduled session
  async createScheduledSession(session: Omit<ScheduledSession, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("scheduled_sessions")
      .insert(session)
      .select(`
        *,
        topics(name, color)
      `)
      .single()

    if (error) throw error
    return data
  },

  // Update a scheduled session
  async updateScheduledSession(id: string, updates: Partial<ScheduledSession>) {
    const { data, error } = await supabase
      .from("scheduled_sessions")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(`
        *,
        topics(name, color)
      `)
      .single()

    if (error) throw error
    return data
  },

  // Delete a scheduled session
  async deleteScheduledSession(id: string) {
    const { error } = await supabase.from("scheduled_sessions").delete().eq("id", id)

    if (error) throw error
  },

  // Mark session as completed
  async completeScheduledSession(id: string, completedSessionId: string) {
    const { data, error } = await supabase
      .from("scheduled_sessions")
      .update({
        status: "completed",
        completed_session_id: completedSessionId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get overdue sessions (missed)
  async getOverdueSessions(userId: string) {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("scheduled_sessions")
      .select(`
        *,
        topics(name, color)
      `)
      .eq("user_id", userId)
      .eq("status", "scheduled")
      .lt("scheduled_date", now)

    if (error) throw error
    return data
  },
}
