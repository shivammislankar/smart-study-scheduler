// Core types for our application
export interface User {
  id: string
  email: string
  full_name?: string
  study_streak: number
  created_at: string
}

export interface Topic {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface Subtopic {
  id: string
  topic_id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Flashcard {
  id: string
  user_id: string
  topic_id: string
  front: string
  back: string
  ease_factor: number
  interval_days: number
  next_review_date: string
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
