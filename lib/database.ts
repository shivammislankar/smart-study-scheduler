import { supabase } from "./supabase"
import type { Topic } from "./supabase"

// Topics service
export const topicsService = {
  // Get all topics for a user
  async getTopics(userId: string) {
    const { data, error } = await supabase
      .from("topics")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data as Topic[]
  },

  // Create a new topic
  async createTopic(topic: Omit<Topic, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("topics").insert(topic).select().single()

    if (error) throw error
    return data as Topic
  },

  // Update a topic
  async updateTopic(id: string, updates: Partial<Topic>) {
    const { data, error } = await supabase
      .from("topics")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Topic
  },

  // Delete a topic
  async deleteTopic(id: string) {
    const { error } = await supabase.from("topics").delete().eq("id", id)

    if (error) throw error
  },

  // Get topic with flashcard counts
  async getTopicWithStats(userId: string) {
    const { data, error } = await supabase
      .from("topics")
      .select(`
        *,
        flashcards(count)
      `)
      .eq("user_id", userId)

    if (error) throw error
    return data
  },
}
