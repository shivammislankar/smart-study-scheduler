export interface SM2Result {
  easeFactor: number
  interval: number
  repetitions: number
  nextReviewDate: Date
}

export interface SM2Input {
  quality: number // 0-5 scale (0 = complete blackout, 5 = perfect response)
  easeFactor: number
  interval: number
  repetitions: number
}

/**
 * SM-2 Spaced Repetition Algorithm Implementation
 * Based on the original algorithm by Piotr Wozniak
 */
export function calculateSM2(input: SM2Input): SM2Result {
  const { quality, easeFactor, interval, repetitions } = input

  let newEaseFactor = easeFactor
  let newInterval = interval
  let newRepetitions = repetitions

  // Update ease factor based on quality of response
  newEaseFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))

  // If quality < 3, reset repetitions and set interval to 1
  if (quality < 3) {
    newRepetitions = 0
    newInterval = 1
  } else {
    newRepetitions = repetitions + 1

    // Calculate new interval based on repetitions
    if (newRepetitions === 1) {
      newInterval = 1
    } else if (newRepetitions === 2) {
      newInterval = 6
    } else {
      newInterval = Math.round(interval * newEaseFactor)
    }
  }

  // Calculate next review date
  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)

  return {
    easeFactor: Math.round(newEaseFactor * 100) / 100, // Round to 2 decimal places
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewDate,
  }
}
