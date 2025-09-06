"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Edit, Trash2, MoreHorizontal, Brain, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Loading } from "@/components/ui/loading"
import { FlashcardForm } from "@/components/flashcard-form"
import { useTopics } from "@/hooks/use-topics"
import { useFlashcards } from "@/hooks/use-flashcards"
import Link from "next/link"

export default function TopicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = React.use(params)
  const topicId = resolvedParams.id
  const { topics, loading: topicsLoading } = useTopics()
  const { flashcards, loading: flashcardsLoading, createFlashcard, deleteFlashcard } = useFlashcards(topicId)
  const [showAddForm, setShowAddForm] = useState(false)

  const topic = topics.find((t) => t.id === topicId)

  // If topic not found and not loading, redirect back
  useEffect(() => {
    if (!topicsLoading && !topic) {
      router.push("/dashboard/topics")
    }
  }, [topic, topicsLoading, router])

  const handleCreateFlashcard = async (flashcardData: { front: string; back: string; topic_id: string }) => {
    try {
      await createFlashcard({
        ...flashcardData,
        user_id: "", // Will be set in the hook
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 0,
        next_review_date: new Date().toISOString(),
      })
      setShowAddForm(false)
    } catch (error) {
      console.error("Failed to create flashcard:", error)
    }
  }

  const handleDeleteFlashcard = async (cardId: string) => {
    if (confirm("Are you sure you want to delete this flashcard?")) {
      try {
        await deleteFlashcard(cardId)
      } catch (error) {
        console.error("Failed to delete flashcard:", error)
      }
    }
  }

  if (topicsLoading || flashcardsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loading size="lg" />
          <p className="text-muted-foreground">Loading topic details...</p>
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-red-600">Topic not found</p>
          <Button asChild>
            <Link href="/dashboard/topics">Back to Topics</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/topics">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: topic.color }} />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{topic.name}</h1>
            {topic.description && <p className="text-muted-foreground">{topic.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {flashcards.length > 0 && (
            <Button asChild>
              <Link href="/dashboard/study">
                <Brain className="h-4 w-4 mr-2" />
                Study Now
              </Link>
            </Button>
          )}
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Flashcard
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flashcards.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due for Review</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flashcards.filter((card) => new Date(card.next_review_date) <= new Date()).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mastered</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flashcards.filter((card) => card.repetitions >= 3 && card.ease_factor >= 2.5).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Ease</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flashcards.length > 0
                ? (flashcards.reduce((sum, card) => sum + card.ease_factor, 0) / flashcards.length).toFixed(1)
                : "0.0"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Flashcard Form */}
      {showAddForm && (
        <FlashcardForm
          topicId={topicId}
          topicName={topic.name}
          onSubmit={handleCreateFlashcard}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Flashcards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Flashcards ({flashcards.length})</h2>
        </div>

        {flashcards.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No flashcards yet</h3>
              <p className="text-gray-600 mb-4">Add your first flashcard to start studying this topic.</p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Flashcard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flashcards.map((flashcard) => {
              const isDue = new Date(flashcard.next_review_date) <= new Date()
              const isMastered = flashcard.repetitions >= 3 && flashcard.ease_factor >= 2.5

              return (
                <Card key={flashcard.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {isDue && <Badge variant="destructive">Due</Badge>}
                        {isMastered && <Badge variant="default">Mastered</Badge>}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Card
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteFlashcard(flashcard.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Card
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Question</h4>
                      <p className="text-sm">{flashcard.front}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Answer</h4>
                      <p className="text-sm">{flashcard.back}</p>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>Ease: {flashcard.ease_factor}</span>
                      <span>Reps: {flashcard.repetitions}</span>
                      <span>Next: {isDue ? "Now" : new Date(flashcard.next_review_date).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
