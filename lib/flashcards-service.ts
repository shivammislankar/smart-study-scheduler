import { supabase } from "./supabase"
import type { Flashcard, FlashcardReview } from "./supabase"

// Flashcards service
export const flashcardsService = {
  // Get all flashcards for a user
  async getFlashcards(userId: string) {
    const { data, error } = await supabase
      .from("flashcards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data as Flashcard[]
  },

  // Get flashcards due for review
  async getDueFlashcards(userId: string) {
    const { data, error } = await supabase
      .from("flashcards")
      .select("*")
      .eq("user_id", userId)
      .lte("next_review_date", new Date().toISOString())
      .order("next_review_date", { ascending: true })

    if (error) throw error
    return data as Flashcard[]
  },

  // Get flashcards by topic
  async getFlashcardsByTopic(userId: string, topicId: string) {
    const { data, error } = await supabase
      .from("flashcards")
      .select("*")
      .eq("user_id", userId)
      .eq("topic_id", topicId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data as Flashcard[]
  },

  // Create a new flashcard
  async createFlashcard(flashcard: Omit<Flashcard, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("flashcards").insert(flashcard).select().single()

    if (error) throw error
    return data as Flashcard
  },

  // Update flashcard after review (SM-2 algorithm)
  async updateFlashcardAfterReview(
    id: string,
    updates: {
      ease_factor: number
      interval_days: number
      repetitions: number
      next_review_date: string
    },
  ) {
    const { data, error } = await supabase
      .from("flashcards")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Flashcard
  },

  // Delete a flashcard
  async deleteFlashcard(id: string) {
    const { error } = await supabase.from("flashcards").delete().eq("id", id)

    if (error) throw error
  },

  // Record a flashcard review
  async recordReview(review: Omit<FlashcardReview, "id" | "reviewed_at">) {
    const { data, error } = await supabase.from("flashcard_reviews").insert(review).select().single()

    if (error) throw error
    return data as FlashcardReview
  },
}
