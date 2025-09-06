"use client"

import { useState, useEffect } from "react"
import { studySessionsService } from "@/lib/study-sessions-service"
import { flashcardsService } from "@/lib/flashcards-service"
import { calculateSM2 } from "@/lib/sm2-algorithm"
import { useAuth } from "@/components/auth/auth-provider"
import type { Flashcard, StudySession } from "@/lib/supabase"

interface StudySessionStats {
  cardsReviewed: number
  correctAnswers: number
  startTime: Date
  totalCards: number
  currentCardIndex: number
}

export function useStudySession() {
  const { user } = useAuth()
  const [dueCards, setDueCards] = useState<Flashcard[]>([])
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null)
  const [sessionStats, setSessionStats] = useState<StudySessionStats>({
    cardsReviewed: 0,
    correctAnswers: 0,
    startTime: new Date(),
    totalCards: 0,
    currentCardIndex: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isSessionComplete, setIsSessionComplete] = useState(false)

  // Load due cards when component mounts
  useEffect(() => {
    loadDueCards()
  }, [user])

  const loadDueCards = async () => {
    if (!user) return

    try {
      setLoading(true)
      const cards = await flashcardsService.getDueFlashcards(user.id)
      setDueCards(cards)
      setSessionStats((prev) => ({
        ...prev,
        totalCards: cards.length,
        startTime: new Date(),
      }))
    } catch (error) {
      console.error("Error loading due cards:", error)
    } finally {
      setLoading(false)
    }
  }

  const startSession = async (topicId?: string) => {
    if (!user) throw new Error("No user logged in")

    try {
      // Create a new study session
      const session = await studySessionsService.createSession({
        user_id: user.id,
        topic_id: topicId || dueCards[0]?.topic_id || "",
        session_type: "flashcard",
        cards_reviewed: 0,
        correct_answers: 0,
        started_at: new Date().toISOString(),
      })

      setCurrentSession(session)
      setSessionStats((prev) => ({
        ...prev,
        startTime: new Date(),
        cardsReviewed: 0,
        correctAnswers: 0,
        currentCardIndex: 0,
      }))
      setIsSessionComplete(false)

      return session
    } catch (error) {
      console.error("Error starting session:", error)
      throw error
    }
  }

  const reviewCard = async (cardId: string, quality: number) => {
    if (!user || !currentSession) throw new Error("No active session")

    try {
      const card = dueCards.find((c) => c.id === cardId)
      if (!card) throw new Error("Card not found")

      // Calculate SM-2 algorithm results
      const sm2Result = calculateSM2({
        quality,
        easeFactor: card.ease_factor,
        interval: card.interval_days,
        repetitions: card.repetitions,
      })

      // Update the flashcard with new SM-2 values
      await flashcardsService.updateFlashcardAfterReview(cardId, {
        ease_factor: sm2Result.easeFactor,
        interval_days: sm2Result.interval,
        repetitions: sm2Result.repetitions,
        next_review_date: sm2Result.nextReviewDate.toISOString(),
      })

      // Record the review
      await flashcardsService.recordReview({
        flashcard_id: cardId,
        user_id: user.id,
        session_id: currentSession.id,
        quality,
        previous_ease_factor: card.ease_factor,
        new_ease_factor: sm2Result.easeFactor,
        previous_interval: card.interval_days,
        new_interval: sm2Result.interval,
      })

      // Update session stats
      const isCorrect = quality >= 3
      setSessionStats((prev) => ({
        ...prev,
        cardsReviewed: prev.cardsReviewed + 1,
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
        currentCardIndex: prev.currentCardIndex + 1,
      }))

      // Check if session is complete
      if (sessionStats.currentCardIndex + 1 >= dueCards.length) {
        await completeSession()
      }

      return sm2Result
    } catch (error) {
      console.error("Error reviewing card:", error)
      throw error
    }
  }

  const completeSession = async () => {
    if (!currentSession || !user) return

    try {
      const duration = Math.floor((new Date().getTime() - sessionStats.startTime.getTime()) / 1000 / 60)

      await studySessionsService.completeSession(currentSession.id, {
        completed_at: new Date().toISOString(),
        duration_minutes: duration,
        cards_reviewed: sessionStats.cardsReviewed,
        correct_answers: sessionStats.correctAnswers,
      })

      setIsSessionComplete(true)
    } catch (error) {
      console.error("Error completing session:", error)
      throw error
    }
  }

  const getCurrentCard = () => {
    if (sessionStats.currentCardIndex >= dueCards.length) return null
    return dueCards[sessionStats.currentCardIndex]
  }

  const getSessionProgress = () => {
    if (dueCards.length === 0) return 0
    return (sessionStats.currentCardIndex / dueCards.length) * 100
  }

  const getAccuracy = () => {
    if (sessionStats.cardsReviewed === 0) return 0
    return (sessionStats.correctAnswers / sessionStats.cardsReviewed) * 100
  }

  const resetSession = () => {
    setCurrentSession(null)
    setIsSessionComplete(false)
    setSessionStats({
      cardsReviewed: 0,
      correctAnswers: 0,
      startTime: new Date(),
      totalCards: dueCards.length,
      currentCardIndex: 0,
    })
  }

  return {
    dueCards,
    currentSession,
    sessionStats,
    loading,
    isSessionComplete,
    startSession,
    reviewCard,
    completeSession,
    getCurrentCard,
    getSessionProgress,
    getAccuracy,
    resetSession,
    loadDueCards,
  }
}
