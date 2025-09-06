"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, RotateCcw, Home } from "lucide-react"
import Link from "next/link"

interface SessionCompleteProps {
  stats: {
    cardsReviewed: number
    correctAnswers: number
    startTime: Date
    totalCards: number
  }
  onRestart: () => void
}

export function SessionComplete({ stats, onRestart }: SessionCompleteProps) {
  const sessionDuration = Math.floor((new Date().getTime() - stats.startTime.getTime()) / 1000 / 60)
  const accuracy = stats.cardsReviewed > 0 ? (stats.correctAnswers / stats.cardsReviewed) * 100 : 0

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Session Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.cardsReviewed}</div>
              <div className="text-sm text-muted-foreground">Cards Reviewed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(accuracy)}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{sessionDuration}m</div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
          </div>

          {/* Performance Message */}
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">
              {accuracy >= 80 ? "Excellent work! 🎉" : accuracy >= 60 ? "Good progress! 👍" : "Keep practicing! 💪"}
            </h3>
            <p className="text-sm text-blue-700">
              {accuracy >= 80
                ? "You're mastering this material. The spaced repetition algorithm will schedule these cards for optimal retention."
                : accuracy >= 60
                  ? "You're making good progress. Some cards will be scheduled for earlier review to help strengthen your memory."
                  : "Don't worry, this is part of the learning process. These cards will be scheduled for more frequent review."}
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={onRestart}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Study More Cards
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
