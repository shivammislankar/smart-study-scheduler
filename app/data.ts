// Shared data store (we'll upgrade this to a database later)
export interface Topic {
  id: number
  name: string
  description: string
}

export interface Flashcard {
  id: number
  topicId: number
  question: string
  answer: string
  // Spaced repetition data
  nextReviewDate: Date
  interval: number        // Days until next review
  easeFactor: number     // How "easy" this card is (1.3 - 2.5)
  repetitions: number    // How many times reviewed successfully
}

// Helper function to create a new flashcard with spaced repetition defaults
// Helper function to create a new flashcard with spaced repetition defaults
export const createNewFlashcard = (id: number, topicId: number, question: string, answer: string): Flashcard => {
  const now = new Date()
  // Make sure new cards are due immediately by setting the date to now
  return {
    id,
    topicId,
    question,
    answer,
    nextReviewDate: now, // Due right now
    interval: 1,         // Start with 1 day interval
    easeFactor: 2.5,     // Default ease factor
    repetitions: 0       // Haven't been reviewed yet
  }
}
// SM-2 Spaced Repetition Algorithm
export const updateFlashcardAfterReview = (
  flashcardId: number, 
  difficulty: 'easy' | 'medium' | 'hard'
): void => {
  try {
    const cardIndex = flashcards.findIndex(card => card.id === flashcardId)
    if (cardIndex === -1) {
      console.error('Card not found:', flashcardId)
      return
    }

    const card = { ...flashcards[cardIndex] }
    
    // SM-2 Algorithm Logic
    let quality: number
    switch (difficulty) {
      case 'easy':
        quality = 5  // Perfect response
        break
      case 'medium':
        quality = 3  // Correct response with hesitation
        break
      case 'hard':
        quality = 1  // Incorrect response
        break
      default:
        quality = 3
    }

    console.log(`Updating card ${flashcardId} with quality ${quality} (${difficulty})`)

    if (quality >= 3) {
      // Correct answer
      if (card.repetitions === 0) {
        card.interval = 1
      } else if (card.repetitions === 1) {
        card.interval = 6
      } else {
        card.interval = Math.round(card.interval * card.easeFactor)
      }
      card.repetitions += 1
    } else {
      // Incorrect answer - reset
      card.repetitions = 0
      card.interval = 1
    }

    // Update ease factor (with safety checks)
    const oldEaseFactor = card.easeFactor
    card.easeFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    
    // Keep ease factor within bounds
    if (card.easeFactor < 1.3) {
      card.easeFactor = 1.3
    }
    if (card.easeFactor > 2.5) {
      card.easeFactor = 2.5
    }

    console.log(`Ease factor: ${oldEaseFactor.toFixed(2)} → ${card.easeFactor.toFixed(2)}`)

    // Calculate next review date
    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + card.interval)
    card.nextReviewDate = nextReview

    console.log(`Next review: ${card.nextReviewDate.toLocaleString()} (in ${card.interval} days)`)

    // Update the flashcards array
    flashcards[cardIndex] = card
    
    console.log('Card updated successfully')
    
  } catch (error) {
    console.error('Error updating flashcard:', error)
  }
}

// Get review statistics for a topic
export const getTopicReviewStats = (topicId: number) => {
  const topicCards = getFlashcardsByTopic(topicId)
  const now = new Date()
  
  const dueCards = topicCards.filter(card => card.nextReviewDate <= now)
  const totalCards = topicCards.length
  
  return {
    totalCards,
    dueCards: dueCards.length,
    reviewedCards: topicCards.filter(card => card.repetitions > 0).length,
    newCards: topicCards.filter(card => card.repetitions === 0).length
  }
}

// Debug function to see all card schedules (we can remove this later)
export const getCardSchedules = (topicId: number) => {
  return getFlashcardsByTopic(topicId).map(card => ({
    question: card.question.substring(0, 30) + '...',
    nextReview: card.nextReviewDate.toLocaleDateString(),
    interval: card.interval,
    repetitions: card.repetitions,
    easeFactor: card.easeFactor.toFixed(2)
  }))
}

// In-memory storage (temporary solution)
let topics: Topic[] = []
let flashcards: Flashcard[] = []

// Topic functions
export const getTopics = (): Topic[] => {
  return [...topics]
}

export const addTopic = (topic: Topic): void => {
  topics = [...topics, topic]
}

// Flashcard functions
export const getFlashcards = (): Flashcard[] => {
  return [...flashcards]
}

export const addFlashcard = (flashcard: Omit<Flashcard, 'nextReviewDate' | 'interval' | 'easeFactor' | 'repetitions'>): void => {
  const newFlashcard = createNewFlashcard(
    flashcard.id,
    flashcard.topicId,
    flashcard.question,
    flashcard.answer
  )
  flashcards = [...flashcards, newFlashcard]
}

export const getFlashcardsByTopic = (topicId: number): Flashcard[] => {
  return flashcards.filter(card => card.topicId === topicId)
}

// Get flashcards that are due for review
// Get flashcards that are due for review
export const getFlashcardsDueForReview = (topicId: number): Flashcard[] => {
  const now = new Date()
  const cards = flashcards.filter(card => 
    card.topicId === topicId && 
    card.nextReviewDate <= now
  )
  
  // Debug: Let's see what's happening
  console.log(`Getting due cards for topic ${topicId}:`)
  console.log('Current time:', now.toLocaleString())
  flashcards.filter(card => card.topicId === topicId).forEach(card => {
    const isDue = card.nextReviewDate <= now
    console.log(`Card ${card.id}: "${card.question.substring(0, 20)}..." - Due: ${isDue}`)
    console.log(`  Next review: ${card.nextReviewDate.toLocaleString()}`)
    console.log(`  Interval: ${card.interval}, Repetitions: ${card.repetitions}`)
  })
  
  return cards
}

// Debug function to see what's happening with our cards
export const debugCardInfo = () => {
  console.log('=== DEBUG CARD INFO ===')
  console.log('All flashcards:', flashcards.map(card => ({
    id: card.id,
    question: card.question.substring(0, 20) + '...',
    nextReview: card.nextReviewDate.toLocaleString(),
    interval: card.interval,
    repetitions: card.repetitions,
    easeFactor: card.easeFactor
  })))
  
  const now = new Date()
  console.log('Current time:', now.toLocaleString())
  
  flashcards.forEach(card => {
    const isDue = card.nextReviewDate <= now
    console.log(`Card ${card.id}: Due? ${isDue} (Next: ${card.nextReviewDate.toLocaleString()})`)
  })
}

// Initialize with some sample data
topics = [
  { id: 1, name: 'Mathematics', description: 'Basic math concepts' },
  { id: 2, name: 'History', description: 'World history facts' }
]

flashcards = [
  createNewFlashcard(1, 1, 'What is 2 + 2?', '4'),
  createNewFlashcard(2, 1, 'What is 5 × 3?', '15'),
  createNewFlashcard(3, 2, 'When did World War II end?', '1945')
]