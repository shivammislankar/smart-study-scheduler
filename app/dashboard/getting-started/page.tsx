"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { OnboardingWizard } from "@/components/onboarding-wizard"
import { useTopics } from "@/hooks/use-topics"
import { useFlashcards } from "@/hooks/use-flashcards"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function GettingStartedPage() {
  const router = useRouter()
  const { createTopic } = useTopics()
  const { createFlashcard } = useFlashcards()
  const [isCompleting, setIsCompleting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [createdTopicId, setCreatedTopicId] = useState<string | null>(null)

  const handleComplete = async (data: { topic: any; flashcards: any[] }) => {
    setIsCompleting(true)
    try {
      // Create the topic first
      const newTopic = await createTopic({
        name: data.topic.name,
        description: data.topic.description,
        color: data.topic.color,
        user_id: "", // Will be set in the hook
      })

      setCreatedTopicId(newTopic.id)

      // Create all flashcards for this topic
      for (const flashcard of data.flashcards) {
        await createFlashcard({
          front: flashcard.front,
          back: flashcard.back,
          topic_id: newTopic.id,
          user_id: "", // Will be set in the hook
          ease_factor: 2.5,
          interval_days: 1,
          repetitions: 0,
          next_review_date: new Date().toISOString(),
        })
      }

      setIsComplete(true)

      // Redirect to the new topic after a short delay
      setTimeout(() => {
        router.push(`/dashboard/topics/${newTopic.id}`)
      }, 3000)
    } catch (error) {
      console.error("Error completing setup:", error)
      setIsCompleting(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard")
  }

  if (isComplete) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px] p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">All Set!</h2>
              <p className="text-gray-600">
                Your topic and flashcards have been created successfully. You'll be redirected to your new topic
                shortly.
              </p>
              <div className="text-sm text-muted-foreground">Redirecting in 3 seconds...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to StudyMaster!</h1>
          <p className="text-muted-foreground">
            Let's get you started by creating your first topic and some flashcards.
          </p>
        </div>

        <OnboardingWizard onComplete={handleComplete} onCancel={handleCancel} />
      </div>
    </div>
  )
}
