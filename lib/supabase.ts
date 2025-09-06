import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a safe client that won't crash if env vars are missing
let supabase: SupabaseClient

if (supabaseUrl && supabaseKey) {
  // Real Supabase client when env vars are available
  supabase = createClient(supabaseUrl, supabaseKey)
} else {
  // Mock client for development/preview when env vars are missing
  console.warn("Supabase environment variables not found. Using mock client.")

  supabase = {
    auth: {
      signUp: async () => ({ data: null, error: new Error("Supabase not configured") }),
      signInWithPassword: async () => ({ data: null, error: new Error("Supabase not configured") }),
      signOut: async () => ({ error: new Error("Supabase not configured") }),
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      resetPasswordForEmail: async () => ({ error: new Error("Supabase not configured") }),
      updateUser: async () => ({ error: new Error("Supabase not configured") }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({ data: [], error: null }),
          single: () => ({ data: null, error: new Error("Supabase not configured") }),
        }),
        single: () => ({ data: null, error: new Error("Supabase not configured") }),
      }),
      insert: () => ({
        select: () => ({
          single: () => ({ data: null, error: new Error("Supabase not configured") }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => ({ data: null, error: new Error("Supabase not configured") }),
          }),
        }),
      }),
      delete: () => ({
        eq: () => ({ error: new Error("Supabase not configured") }),
      }),
    }),
  } as any
}

export { supabase }

// Database types
export interface Profile {
  id: string
  username?: string
  full_name?: string
  avatar_url?: string
  study_streak: number
  total_study_time: number
  created_at: string
  updated_at: string
}

export interface Topic {
  id: string
  user_id: string
  name: string
  description?: string
  color: string
  created_at: string
  updated_at: string
}

export interface Flashcard {
  id: string
  user_id: string
  topic_id: string
  subtopic_id?: string
  front: string
  back: string
  ease_factor: number
  interval_days: number
  repetitions: number
  next_review_date: string
  created_at: string
  updated_at: string
}

export interface StudySession {
  id: string
  user_id: string
  topic_id: string
  session_type: "flashcard" | "quiz" | "review"
  duration_minutes?: number
  cards_reviewed: number
  correct_answers: number
  started_at: string
  completed_at?: string
  created_at: string
}

export interface FlashcardReview {
  id: string
  flashcard_id: string
  user_id: string
  session_id: string
  quality: number
  previous_ease_factor: number
  new_ease_factor: number
  previous_interval: number
  new_interval: number
  reviewed_at: string
}

export interface ScheduledSession {
  id: string
  user_id: string
  topic_id: string
  title: string
  description?: string
  scheduled_date: string
  duration_minutes: number
  session_type: "flashcard" | "quiz" | "review"
  reminder_enabled: boolean
  reminder_minutes: number
  status: "scheduled" | "completed" | "cancelled" | "missed"
  completed_session_id?: string
  created_at: string
  updated_at: string
}
