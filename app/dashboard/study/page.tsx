"use client"

import { useState } from "react"
import { Brain, BookOpen, Target, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { StudySession } from "@/components/study-session"
import { SessionComplete } from "@/components/session-complete"
import { useTopics } from "@/hooks/use-topics"
import { useStudySession } from "@/hooks/use-study-session"
import { useAuth } from "@/components/auth/auth-provider"
import Link from "next/link"

export default function StudyPage() {
  const { user } = useAuth()
  const { topics, loading: topicsLoading } = useTopics()
  const {
    dueCards,
    currentSession,
    sessionStats,
    loading: sessionLoading,
    isSessionComplete,
    startSession,
    reviewCard,
    getCurrentCard,
    getSessionProgress,
    getAccuracy,
    resetSession,
    loadDueCards,
  } = useStudySession()

  const [hasStarted, setHasStarted] = useState(false)

  const handleStartSession = async () => {
    try {
      await startSession()
      setHasStarted(true)
    } catch (error) {
      console.error("Failed to start session:", error)
    }
  }

  const handleReviewCard = async (quality: number) => {
    const currentCard = getCurrentCard()
    if (!currentCard) return

    try {
      await reviewCard(currentCard.id, quality)
    } catch (error) {
      console.error("Failed to review card:", error)
    }
  }

  const handleRestartSession = async () => {
    resetSession()
    setHasStarted(false)
    await loadDueCards()
  }

  if (topicsLoading || sessionLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loading size="lg" />
          <p className="text-muted-foreground">Loading study session...</p>
        </div>
      </div>
    )
  }

  // If no topics exist, show onboarding
  if (topics.length === 0) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="text-center py-12">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Ready to Start Studying?</h1>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            To begin your study sessions, you'll need to create topics and add flashcards first. Let's get you set up!
          </p>

          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Step 1: Create Topics
                </CardTitle>
                <CardDescription>Organize your study materials by subject or category</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/dashboard/getting-started">
                    <Plus className="h-4 w-4 mr-2" />
                    Get Started
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Step 2: Add Flashcards
                </CardTitle>
                <CardDescription>Create flashcards for each topic to start studying</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/dashboard/topics">View Topics</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // If session is complete, show completion screen
  if (isSessionComplete) {
    return (
      <div className="flex-1 p-6">
        <SessionComplete stats={sessionStats} onRestart={handleRestartSession} />
      </div>
    )
  }

  // If session has started and there's a current card, show study interface
  if (hasStarted && currentSession && getCurrentCard()) {
    const currentCard = getCurrentCard()!
    return (
      <div className="flex-1 p-6">
        <StudySession
          card={currentCard}
          sessionStats={sessionStats}
          progress={getSessionProgress()}
          accuracy={getAccuracy()}
          onRate={handleReviewCard}
          onComplete={() => {}}
        />
      </div>
    )
  }

  // If topics exist but no flashcards or session not started
  if (dueCards.length === 0) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Study Session</h1>
            <p className="text-muted-foreground">No cards are due for review right now</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Study Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cards Reviewed</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Study Time</span>
                  <span className="font-semibold">0m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Accuracy</span>
                  <span className="font-semibold">-</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Topics */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Your Topics
              </CardTitle>
              <CardDescription>You have {topics.length} topics. Add flashcards to start studying.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {topics.slice(0, 3).map((topic) => (
                  <div key={topic.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: topic.color }} />
                      <div>
                        <p className="font-medium">{topic.name}</p>
                        <p className="text-sm text-muted-foreground">0 cards</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/topics/${topic.id}`}>Add Cards</Link>
                    </Button>
                  </div>
                ))}
                {topics.length > 3 && (
                  <div className="text-center pt-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/dashboard/topics">View All Topics</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="text-center py-8">
          <CardContent>
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready to Add Flashcards?</h3>
            <p className="text-gray-600 mb-4">Create flashcards for your topics to start your study sessions.</p>
            <Button asChild>
              <Link href="/dashboard/getting-started">Add Flashcards</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show start session screen when there are due cards
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Session</h1>
          <p className="text-muted-foreground">You have {dueCards.length} cards due for review</p>
        </div>
      </div>

      {/* Session Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Ready to Study?</CardTitle>
          <CardDescription>
            You have {dueCards.length} flashcards ready for review. The spaced repetition algorithm has scheduled these
            cards based on your previous performance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold">{dueCards.length}</div>
              <div className="text-sm text-muted-foreground">Cards Due</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">~{Math.ceil(dueCards.length * 1.5)}m</div>
              <div className="text-sm text-muted-foreground">Estimated Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{new Set(dueCards.map((card) => card.topic_id)).size}</div>
              <div className="text-sm text-muted-foreground">Topics</div>
            </div>
          </div>

          <Button onClick={handleStartSession} size="lg" className="w-full">
            <Brain className="h-4 w-4 mr-2" />
            Start Study Session
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
