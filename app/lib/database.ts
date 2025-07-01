import { supabase } from './supabase'

export interface Topic {
  id: number
  name: string
  description: string
  created_at?: string
}

export interface Flashcard {
  id: number
  topic_id: number
  question: string
  answer: string
  next_review_date: string
  interval_days: number
  ease_factor: number
  repetitions: number
  created_at?: string
}

// Topic functions
export const getTopics = async (): Promise<Topic[]> => {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching topics:', error)
    return []
  }
  
  return data || []
}

export const addTopic = async (topic: Omit<Topic, 'id' | 'created_at'>): Promise<Topic | null> => {
  const { data, error } = await supabase
    .from('topics')
    .insert([topic])
    .select()
    .single()
  
  if (error) {
    console.error('Error adding topic:', error)
    return null
  }
  
  return data
}

// Flashcard functions
export const getFlashcards = async (): Promise<Flashcard[]> => {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching flashcards:', error)
    return []
  }
  
  return data || []
}

export const getFlashcardsByTopic = async (topicId: number): Promise<Flashcard[]> => {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching flashcards by topic:', error)
    return []
  }
  
  return data || []
}

export const addFlashcard = async (flashcard: Omit<Flashcard, 'id' | 'created_at'>): Promise<Flashcard | null> => {
  const { data, error } = await supabase
    .from('flashcards')
    .insert([flashcard])
    .select()
    .single()
  
  if (error) {
    console.error('Error adding flashcard:', error)
    return null
  }
  
  return data
}

export const getFlashcardsDueForReview = async (topicId: number): Promise<Flashcard[]> => {
  const now = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('topic_id', topicId)
    .lte('next_review_date', now)
    .order('next_review_date', { ascending: true })
  
  if (error) {
    console.error('Error fetching due flashcards:', error)
    return []
  }
  
  return data || []
}

export const updateFlashcardAfterReview = async (
  flashcardId: number,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<void> => {
  // First, get the current flashcard
  const { data: card, error: fetchError } = await supabase
    .from('flashcards')
    .select('*')
    .eq('id', flashcardId)
    .single()
  
  if (fetchError || !card) {
    console.error('Error fetching flashcard for update:', fetchError)
    return
  }
  
  // SM-2 Algorithm Logic
  let quality: number
  switch (difficulty) {
    case 'easy':
      quality = 5
      break
    case 'medium':
      quality = 3
      break
    case 'hard':
      quality = 1
      break
  }
  
  let newInterval = card.interval_days
  let newRepetitions = card.repetitions
  let newEaseFactor = card.ease_factor
  
  if (quality >= 3) {
    // Correct answer
    if (newRepetitions === 0) {
      newInterval = 1
    } else if (newRepetitions === 1) {
      newInterval = 6
    } else {
      newInterval = Math.round(newInterval * newEaseFactor)
    }
    newRepetitions += 1
  } else {
    // Incorrect answer - reset
    newRepetitions = 0
    newInterval = 1
  }
  
  // Update ease factor
  newEaseFactor = newEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (newEaseFactor < 1.3) newEaseFactor = 1.3
  if (newEaseFactor > 2.5) newEaseFactor = 2.5
  
  // Calculate next review date
  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)
  
  // Update the flashcard
  const { error: updateError } = await supabase
    .from('flashcards')
    .update({
      interval_days: newInterval,
      repetitions: newRepetitions,
      ease_factor: newEaseFactor,
      next_review_date: nextReviewDate.toISOString()
    })
    .eq('id', flashcardId)
  
  if (updateError) {
    console.error('Error updating flashcard:', updateError)
  } else {
    console.log(`Updated card ${flashcardId}: interval=${newInterval}, repetitions=${newRepetitions}`)
  }
}

export const getTopicReviewStats = async (topicId: number) => {
  const allCards = await getFlashcardsByTopic(topicId)
  const dueCards = await getFlashcardsDueForReview(topicId)
  
  return {
    totalCards: allCards.length,
    dueCards: dueCards.length,
    reviewedCards: allCards.filter(card => card.repetitions > 0).length,
    newCards: allCards.filter(card => card.repetitions === 0).length
  }
}