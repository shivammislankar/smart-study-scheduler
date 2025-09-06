"use client"

import { useState, useEffect } from "react"
import { flashcardsService } from "@/lib/flashcards-service"
import { useAuth } from "@/components/auth/auth-provider"
import type { Flashcard } from "@/lib/supabase"

export function useFlashcards(topicId?: string) {
  const { user } = useAuth()
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFlashcards = async () => {
    if (!user) return

    try {
      setLoading(true)
      let data
      if (topicId) {
        data = await flashcardsService.getFlashcardsByTopic(user.id, topicId)
      } else {
        data = await flashcardsService.getFlashcards(user.id)
      }
      setFlashcards(data)
      setError(null)
    } catch (err: any) {
      console.error("Error fetching flashcards:", err)
      setError(err.message || "Failed to fetch flashcards")
    } finally {
      setLoading(false)
    }
  }

  const fetchDueFlashcards = async () => {
    if (!user) return []

    try {
      const data = await flashcardsService.getDueFlashcards(user.id)
      return data
    } catch (err: any) {
      console.error("Error fetching due flashcards:", err)
      return []
    }
  }

  useEffect(() => {
    fetchFlashcards()
  }, [user, topicId])

  const createFlashcard = async (flashcardData: Omit<Flashcard, "id" | "created_at" | "updated_at">) => {
    if (!user) throw new Error("No user logged in")

    try {
      const newFlashcard = await flashcardsService.createFlashcard({
        ...flashcardData,
        user_id: user.id,
      })
      setFlashcards((prev) => [newFlashcard, ...prev])
      return newFlashcard
    } catch (err: any) {
      console.error("Error creating flashcard:", err)
      throw err
    }
  }

  const deleteFlashcard = async (cardId: string) => {
    try {
      await flashcardsService.deleteFlashcard(cardId)
      setFlashcards((prev) => prev.filter((card) => card.id !== cardId))
    } catch (err: any) {
      console.error("Error deleting flashcard:", err)
      throw err
    }
  }

  // Add deleteFlashcard to the return statement
  return {
    flashcards,
    loading,
    error,
    createFlashcard,
    deleteFlashcard,
    fetchDueFlashcards,
    refetch: fetchFlashcards,
  }
}
