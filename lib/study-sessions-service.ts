import { supabase } from "./supabase"
import type { StudySession } from "./supabase"

// Study Sessions service
export const studySessionsService = {
  // Create a new study session
  async createSession(session: Omit<StudySession, "id" | "created_at">) {
    const { data, error } = await supabase.from("study_sessions").insert(session).select().single()

    if (error) throw error
    return data as StudySession
  },

  // Update session when completed
  async completeSession(
    sessionId: string,
    updates: {
      completed_at: string
      duration_minutes: number
      cards_reviewed: number
      correct_answers: number
    },
  ) {
    const { data, error } = await supabase.from("study_sessions").update(updates).eq("id", sessionId).select().single()

    if (error) throw error
    return data as StudySession
  },

  // Get user's study sessions
  async getUserSessions(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from("study_sessions")
      .select(`
        *,
        topics(name, color)
      `)
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  // Get today's study stats
  async getTodayStats(userId: string) {
    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("study_sessions")
      .select("cards_reviewed, correct_answers, duration_minutes")
      .eq("user_id", userId)
      .gte("started_at", `${today}T00:00:00.000Z`)
      .lt("started_at", `${today}T23:59:59.999Z`)

    if (error) throw error

    // Calculate totals
    const stats = data?.reduce(
      (acc, session) => ({
        cardsReviewed: acc.cardsReviewed + (session.cards_reviewed || 0),
        correctAnswers: acc.correctAnswers + (session.correct_answers || 0),
        studyTime: acc.studyTime + (session.duration_minutes || 0),
      }),
      { cardsReviewed: 0, correctAnswers: 0, studyTime: 0 },
    ) || { cardsReviewed: 0, correctAnswers: 0, studyTime: 0 }

    return {
      ...stats,
      accuracy: stats.cardsReviewed > 0 ? (stats.correctAnswers / stats.cardsReviewed) * 100 : 0,
    }
  },

  // Get study streak
  async getStudyStreak(userId: string) {
    const { data, error } = await supabase
      .from("study_sessions")
      .select("started_at")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })

    if (error) throw error

    if (!data || data.length === 0) return 0

    let streak = 0
    const today = new Date()
    const sessions = data.map((s) => new Date(s.started_at))

    // Check if user studied today or yesterday
    const lastSession = sessions[0]
    const daysDiff = Math.floor((today.getTime() - lastSession.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff > 1) return 0 // Streak broken

    // Count consecutive days
    const studyDates = new Set(sessions.map((date) => date.toISOString().split("T")[0]))

    const currentDate = new Date(today)
    while (true) {
      const dateStr = currentDate.toISOString().split("T")[0]
      if (studyDates.has(dateStr)) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  },
}
