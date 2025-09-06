"use client"

import type React from "react"

interface Flashcard {
  id: string
  question: string
  answer: string
}

interface FlashcardListProps {
  flashcards: Flashcard[]
  onDelete: (cardId: string) => Promise<void>
}

const FlashcardList: React.FC<FlashcardListProps> = ({ flashcards, onDelete }) => {
  const handleDelete = async (cardId: string) => {
    if (confirm("Are you sure you want to delete this flashcard?")) {
      try {
        await onDelete(cardId)
      } catch (error) {
        console.error("Error deleting flashcard:", error)
      }
    }
  }

  return (
    <div>
      {flashcards.map((card) => (
        <div key={card.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
          <p>
            <strong>Question:</strong> {card.question}
          </p>
          <p>
            <strong>Answer:</strong> {card.answer}
          </p>
          <button onClick={() => handleDelete(card.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}

export default FlashcardList
