"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RotateCcw, Eye, Clock, Target } from "lucide-react"
import { QUALITY_RATINGS } from "@/lib/constants"
import type { Flashcard } from "@/lib/supabase"

interface StudySessionProps {
  card: Flashcard
  sessionStats: {
    cardsReviewed: number
    correctAnswers: number
    currentCardIndex: number
    totalCards: number
  }
  progress: number
  accuracy: number
  onRate: (quality: number) => Promise<void>
  onComplete: () => void
}

export function StudySession({ card, sessionStats, progress, accuracy, onRate, onComplete }: StudySessionProps) {
  const [isRevealed, setIsRevealed] = useState(false)
  const [isRating, setIsRating] = useState(false)

  const handleReveal = () => {
    setIsRevealed(true)
  }

  const handleReset = () => {
    setIsRevealed(false)
  }

  const handleRate = async (quality: number) => {
    setIsRating(true)
    try {
      await onRate(quality)
      setIsRevealed(false)
    } catch (error) {
      console.error("Error rating card:", error)
    } finally {
      setIsRating(false)
    }
  }

  const sessionDuration = Math.floor((new Date().getTime() - new Date().getTime()) / 1000 / 60)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Session Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Study Session</h1>
          <p className="text-muted-foreground">
            Card {sessionStats.currentCardIndex + 1} of {sessionStats.totalCards}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {sessionDuration}m
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            {Math.round(accuracy)}% accuracy
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">Flashcard</Badge>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        <Card className="min-h-[300px] cursor-pointer transition-all hover:shadow-lg">
          <CardContent className="p-8 flex flex-col justify-center items-center text-center h-full">
            {!isRevealed ? (
              <div className="space-y-4">
                <div className="text-lg font-medium text-muted-foreground mb-4">Question</div>
                <div className="text-xl leading-relaxed">{card.front}</div>
                <Button onClick={handleReveal} className="mt-6">
                  <Eye className="h-4 w-4 mr-2" />
                  Reveal Answer
                </Button>
              </div>
            ) : (
              <div className="space-y-4 w-full">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Question</div>
                    <div className="text-base text-muted-foreground">{card.front}</div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Answer</div>
                    <div className="text-xl leading-relaxed">{card.back}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rating Buttons */}
        {isRevealed && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">How well did you know this?</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {QUALITY_RATINGS.map((rating) => (
                <Button
                  key={rating.value}
                  onClick={() => handleRate(rating.value)}
                  disabled={isRating}
                  className={`${rating.color} text-white flex flex-col h-auto py-3 px-4`}
                  variant="default"
                >
                  <span className="font-semibold">{rating.label}</span>
                  <span className="text-xs opacity-90 mt-1">{rating.description}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Session Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{sessionStats.cardsReviewed}</div>
              <div className="text-sm text-muted-foreground">Reviewed</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{sessionStats.correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{sessionStats.totalCards - sessionStats.currentCardIndex - 1}</div>
              <div className="text-sm text-muted-foreground">Remaining</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
