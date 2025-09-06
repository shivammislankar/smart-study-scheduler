"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"

interface FlashcardFormProps {
  topicId: string
  topicName: string
  onSubmit: (flashcard: { front: string; back: string; topic_id: string }) => Promise<void>
  onCancel: () => void
}

export function FlashcardForm({ topicId, topicName, onSubmit, onCancel }: FlashcardFormProps) {
  const [front, setFront] = useState("")
  const [back, setBack] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!front.trim() || !back.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        front: front.trim(),
        back: back.trim(),
        topic_id: topicId,
      })
      setFront("")
      setBack("")
    } catch (error) {
      console.error("Error creating flashcard:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Add Flashcard to {topicName}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="front">Question/Front Side</Label>
            <Textarea
              id="front"
              placeholder="Enter the question or front side of the flashcard..."
              value={front}
              onChange={(e) => setFront(e.target.value)}
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="back">Answer/Back Side</Label>
            <Textarea
              id="back"
              placeholder="Enter the answer or back side of the flashcard..."
              value={back}
              onChange={(e) => setBack(e.target.value)}
              required
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || !front.trim() || !back.trim()}>
              {isSubmitting ? "Adding..." : "Add Flashcard"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
