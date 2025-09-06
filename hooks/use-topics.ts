"use client"

import { useState, useEffect } from "react"
import { topicsService } from "@/lib/database"
import { useAuth } from "@/components/auth/auth-provider"
import type { Topic } from "@/lib/supabase"

export function useTopics() {
  const { user } = useAuth()
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTopics = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await topicsService.getTopics(user.id)
      setTopics(data)
      setError(null)
    } catch (err: any) {
      console.error("Error fetching topics:", err)
      setError(err.message || "Failed to fetch topics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTopics()
  }, [user])

  const createTopic = async (topicData: Omit<Topic, "id" | "created_at" | "updated_at">) => {
    if (!user) throw new Error("No user logged in")

    try {
      const newTopic = await topicsService.createTopic({
        ...topicData,
        user_id: user.id,
      })
      setTopics((prev) => [newTopic, ...prev])
      return newTopic
    } catch (err: any) {
      console.error("Error creating topic:", err)
      throw err
    }
  }

  const updateTopic = async (id: string, updates: Partial<Topic>) => {
    try {
      const updatedTopic = await topicsService.updateTopic(id, updates)
      setTopics((prev) => prev.map((topic) => (topic.id === id ? updatedTopic : topic)))
      return updatedTopic
    } catch (err: any) {
      console.error("Error updating topic:", err)
      throw err
    }
  }

  const deleteTopic = async (id: string) => {
    try {
      await topicsService.deleteTopic(id)
      setTopics((prev) => prev.filter((topic) => topic.id !== id))
    } catch (err: any) {
      console.error("Error deleting topic:", err)
      throw err
    }
  }

  return {
    topics,
    loading,
    error,
    createTopic,
    updateTopic,
    deleteTopic,
    refetch: fetchTopics,
  }
}
