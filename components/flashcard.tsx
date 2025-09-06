"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Eye } from "lucide-react"

interface FlashcardProps {
  front: string
  back: string
  topic: string
  onRate: (quality: number) => void
  isRevealed: boolean
  onReveal: () => void
  onReset: () => void
}

const qualityButtons = [
  { quality: 0, label: "Again", color: "bg-red-500 hover:bg-red-600", description: "Complete blackout" },
  { quality: 1, label: "Hard", color: "bg-orange-500 hover:bg-orange-600", description: "Incorrect, but remembered" },
  { quality: 2, label: "Good", color: "bg-yellow-500 hover:bg-yellow-600", description: "Incorrect, seemed easy" },
  { quality: 3, label: "Easy", color: "bg-green-500 hover:bg-green-600", description: "Correct with difficulty" },
  { quality: 4, label: "Perfect", color: "bg-blue-500 hover:bg-blue-600", description: "Correct after hesitation" },
  { quality: 5, label: "Excellent", color: "bg-purple-500 hover:bg-purple-600", description: "Perfect response" },
]

export function Flashcard({ front, back, topic, onRate, isRevealed, onReveal, onReset }: FlashcardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Topic Badge */}
      <div className="flex items-center justify-between">
        <Badge variant="secondary">{topic}</Badge>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Flashcard */}
      <Card className="min-h-[300px] cursor-pointer transition-all hover:shadow-lg">
        <CardContent className="p-8 flex flex-col justify-center items-center text-center h-full">
          {!isRevealed ? (
            <div className="space-y-4">
              <div className="text-lg font-medium text-muted-foreground mb-4">Question</div>
              <div className="text-xl leading-relaxed">{front}</div>
              <Button onClick={onReveal} className="mt-6">
                <Eye className="h-4 w-4 mr-2" />
                Reveal Answer
              </Button>
            </div>
          ) : (
            <div className="space-y-4 w-full">
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Question</div>
                  <div className="text-base text-muted-foreground">{front}</div>
                </div>
                <div className="border-t pt-4">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Answer</div>
                  <div className="text-xl leading-relaxed">{back}</div>
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
            {qualityButtons.map((button) => (
              <Button
                key={button.quality}
                onClick={() => onRate(button.quality)}
                className={`${button.color} text-white flex flex-col h-auto py-3 px-4`}
                variant="default"
              >
                <span className="font-semibold">{button.label}</span>
                <span className="text-xs opacity-90 mt-1">{button.description}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
