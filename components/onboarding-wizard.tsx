"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, BookOpen, Brain, ArrowRight, ArrowLeft } from "lucide-react"
import { getRandomTopicColor } from "@/lib/utils"

interface OnboardingWizardProps {
  onComplete: (data: { topic: any; flashcards: any[] }) => Promise<void>
  onCancel: () => void
}

interface TopicData {
  name: string
  description: string
  color: string
}

interface FlashcardData {
  front: string
  back: string
}

export function OnboardingWizard({ onComplete, onCancel }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Topic data
  const [topicData, setTopicData] = useState<TopicData>({
    name: "",
    description: "",
    color: getRandomTopicColor(),
  })

  // Flashcards data
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([
    { front: "", back: "" },
    { front: "", back: "" },
    { front: "", back: "" },
  ])

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAddFlashcard = () => {
    setFlashcards([...flashcards, { front: "", back: "" }])
  }

  const handleRemoveFlashcard = (index: number) => {
    if (flashcards.length > 1) {
      setFlashcards(flashcards.filter((_, i) => i !== index))
    }
  }

  const handleFlashcardChange = (index: number, field: "front" | "back", value: string) => {
    const updated = flashcards.map((card, i) => (i === index ? { ...card, [field]: value } : card))
    setFlashcards(updated)
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    try {
      const validFlashcards = flashcards.filter((card) => card.front.trim() && card.back.trim())
      await onComplete({
        topic: topicData,
        flashcards: validFlashcards,
      })
    } catch (error) {
      console.error("Error completing onboarding:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceedFromStep1 = topicData.name.trim().length > 0
  const canProceedFromStep2 = flashcards.some((card) => card.front.trim() && card.back.trim())
  const canComplete = canProceedFromStep1 && canProceedFromStep2

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Let's set up your first topic and flashcards</CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
      </Card>

      {/* Step 1: Create Topic */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Step 1: Create Your Topic
            </CardTitle>
            <CardDescription>
              Topics help you organize your study materials. Think of subjects like "JavaScript", "History", or "Spanish
              Vocabulary".
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic-name">Topic Name *</Label>
              <Input
                id="topic-name"
                placeholder="e.g., JavaScript Fundamentals, World History, Spanish Verbs"
                value={topicData.name}
                onChange={(e) => setTopicData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic-description">Description (Optional)</Label>
              <Textarea
                id="topic-description"
                placeholder="Brief description of what you'll study in this topic..."
                value={topicData.description}
                onChange={(e) => setTopicData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Choose a Color</Label>
              <div className="flex gap-2">
                {["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#F97316", "#84CC16"].map(
                  (color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        topicData.color === color ? "border-gray-900 scale-110" : "border-gray-300 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setTopicData((prev) => ({ ...prev, color }))}
                    />
                  ),
                )}
              </div>
            </div>

            {/* Preview */}
            {topicData.name && (
              <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Preview:</h4>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: topicData.color }} />
                  <div>
                    <div className="font-medium">{topicData.name}</div>
                    {topicData.description && (
                      <div className="text-sm text-muted-foreground">{topicData.description}</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Add Flashcards */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Step 2: Add Flashcards to "{topicData.name}"
            </CardTitle>
            <CardDescription>
              Create flashcards with questions on the front and answers on the back. Add at least one to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {flashcards.map((card, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Flashcard {index + 1}</h4>
                  {flashcards.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFlashcard(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`front-${index}`}>Question/Front Side</Label>
                    <Textarea
                      id={`front-${index}`}
                      placeholder="Enter the question..."
                      value={card.front}
                      onChange={(e) => handleFlashcardChange(index, "front", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`back-${index}`}>Answer/Back Side</Label>
                    <Textarea
                      id={`back-${index}`}
                      placeholder="Enter the answer..."
                      value={card.back}
                      onChange={(e) => handleFlashcardChange(index, "back", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={handleAddFlashcard} className="w-full bg-transparent">
              Add Another Flashcard
            </Button>

            {/* Progress indicator */}
            <div className="text-sm text-muted-foreground">
              {flashcards.filter((card) => card.front.trim() && card.back.trim()).length} of {flashcards.length}{" "}
              flashcards completed
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review and Confirm */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Step 3: Review and Create
            </CardTitle>
            <CardDescription>Review your topic and flashcards before creating them.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Topic Summary */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Topic Summary</h4>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: topicData.color }} />
                <div>
                  <div className="font-medium">{topicData.name}</div>
                  {topicData.description && (
                    <div className="text-sm text-muted-foreground">{topicData.description}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Flashcards Summary */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">
                Flashcards ({flashcards.filter((card) => card.front.trim() && card.back.trim()).length})
              </h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {flashcards
                  .filter((card) => card.front.trim() && card.back.trim())
                  .map((card, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm">
                        <div className="font-medium mb-1">Q: {card.front}</div>
                        <div className="text-muted-foreground">A: {card.back}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your topic will be created and added to your dashboard</li>
                <li>• All flashcards will be ready for studying</li>
                <li>• You can start your first study session immediately</li>
                <li>• The spaced repetition algorithm will schedule future reviews</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          {currentStep > 1 && (
            <Button variant="outline" onClick={handlePrevious}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}
        </div>

        <div>
          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={(currentStep === 1 && !canProceedFromStep1) || (currentStep === 2 && !canProceedFromStep2)}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={!canComplete || isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Topic & Flashcards"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
