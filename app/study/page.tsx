'use client'
import { useState, useEffect } from 'react'
import Header from '../components/header'
import { 
  getTopics, 
  getFlashcardsDueForReview, 
  updateFlashcardAfterReview,
  getTopicReviewStats,
  Topic, 
  Flashcard 
} from '../lib/database'

export default function StudyPage() {
  // Data states
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  
  // Session states
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null)
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [cardRatings, setCardRatings] = useState<Array<{cardId: number, rating: 'easy' | 'medium' | 'hard'}>>([])

  // Load data on component mount
  useEffect(() => {
    loadTopics()
  }, [])

  const loadTopics = async () => {
    setLoading(true)
    try {
      const topicsData = await getTopics()
      setTopics(topicsData)
    } catch (error) {
      console.error('Error loading topics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFlashcardCount = async (topicId: number) => {
    const stats = await getTopicReviewStats(topicId)
    return stats.dueCards
  }

  const handleTopicSelect = async (topicId: number) => {
    setSelectedTopic(topicId)
    // Capture the cards that are due RIGHT NOW for this session
    const cardsForSession = await getFlashcardsDueForReview(topicId)
    setSessionCards(cardsForSession)
    console.log(`Starting session with ${cardsForSession.length} cards`)
  }

  const getCurrentTopicCards = () => {
    return sessionCards // Use the captured session cards
  }

  const getCurrentCard = () => {
    const cards = getCurrentTopicCards()
    return cards[currentCardIndex]
  }

  const handleShowAnswer = () => {
    setShowAnswer(true)
  }

  const handleNextCard = async (rating?: 'easy' | 'medium' | 'hard') => {
    // Save the rating and update the card using SM-2 algorithm
    if (rating && getCurrentCard()) {
      console.log(`Rating card as ${rating}`)
      await updateFlashcardAfterReview(getCurrentCard().id, rating)
      console.log('Card updated in database')
      
      // Save rating for session summary
      const newRating = {
        cardId: getCurrentCard().id,
        rating: rating
      }
      setCardRatings([...cardRatings, newRating])
    }

    // Use sessionCards length instead of getCurrentTopicCards()
    if (currentCardIndex < sessionCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setShowAnswer(false)
    } else {
      setSessionComplete(true)
    }
  }

  const resetSession = () => {
    setSelectedTopic(null)
    setSessionCards([])
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setSessionComplete(false)
    setCardRatings([])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">Loading your study topics...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Study Session
        </h2>
        
        {!selectedTopic ? (
          // Topic Selection View
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Choose a Topic to Study
            </h3>
            <p className="text-gray-600 mb-6">
              Select a topic to start your study session
            </p>
            
            <TopicList 
              topics={topics} 
              onTopicSelect={handleTopicSelect}
              getFlashcardCount={getFlashcardCount}
            />
          </div>
        ) : (
          // Study Session View
          <div className="bg-white rounded-lg shadow p-6">
            {!sessionComplete ? (
              // Active Study Session
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Studying: {topics.find(t => t.id === selectedTopic)?.name}
                  </h3>
                  <div className="text-sm text-gray-600">
                    Card {currentCardIndex + 1} of {getCurrentTopicCards().length}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentCardIndex + 1) / getCurrentTopicCards().length) * 100}%` }}
                  ></div>
                </div>

                {/* Flashcard */}
                <div className="bg-gray-50 rounded-lg p-8 mb-6 min-h-[200px] flex flex-col justify-center">
                  <div className="text-center">
                    <h4 className="text-lg font-medium text-gray-700 mb-4">Question:</h4>
                    <p className="text-xl text-gray-900 mb-6">
                      {getCurrentCard()?.question}
                    </p>
                    
                    {showAnswer && (
                      <>
                        <h4 className="text-lg font-medium text-gray-700 mb-4">Answer:</h4>
                        <p className="text-xl text-green-700 font-semibold">
                          {getCurrentCard()?.answer}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                  {!showAnswer ? (
                    <button
                      onClick={handleShowAnswer}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
                    >
                      Show Answer
                    </button>
                  ) : (
                    <div className="flex flex-col items-center space-y-4">
                      <p className="text-gray-700 font-medium">How difficult was this?</p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleNextCard('easy')}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 flex items-center space-x-2"
                        >
                          <span>😊</span>
                          <span>Easy</span>
                        </button>
                        <button
                          onClick={() => handleNextCard('medium')}
                          className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 flex items-center space-x-2"
                        >
                          <span>😐</span>
                          <span>Medium</span>
                        </button>
                        <button
                          onClick={() => handleNextCard('hard')}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 flex items-center space-x-2"
                        >
                          <span>😰</span>
                          <span>Hard</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={resetSession}
                  className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Back to Topics
                </button>
              </>
            ) : (
              // Session Complete
              <div className="text-center">
                <h3 className="text-2xl font-bold text-green-600 mb-4">
                  🎉 Session Complete!
                </h3>
                <p className="text-gray-600 mb-6">
                  You've completed all {getCurrentTopicCards().length} flashcards for {topics.find(t => t.id === selectedTopic)?.name}
                </p>
                
                {/* Ratings Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Your Performance:</h4>
                  <div className="flex justify-center space-x-6 text-sm">
                    <div className="text-center">
                      <div className="text-green-600 font-bold text-lg">
                        {cardRatings.filter(r => r.rating === 'easy').length}
                      </div>
                      <div className="text-gray-600">Easy 😊</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-600 font-bold text-lg">
                        {cardRatings.filter(r => r.rating === 'medium').length}
                      </div>
                      <div className="text-gray-600">Medium 😐</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-600 font-bold text-lg">
                        {cardRatings.filter(r => r.rating === 'hard').length}
                      </div>
                      <div className="text-gray-600">Hard 😰</div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={resetSession}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Study Another Topic
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// Topic List Component
function TopicList({ 
  topics, 
  onTopicSelect, 
  getFlashcardCount 
}: { 
  topics: Topic[]
  onTopicSelect: (topicId: number) => void
  getFlashcardCount: (topicId: number) => Promise<number>
}) {
  const [topicStats, setTopicStats] = useState<Record<number, {dueCards: number, totalCards: number}>>({})

  useEffect(() => {
    const loadStats = async () => {
      const stats: Record<number, {dueCards: number, totalCards: number}> = {}
      for (const topic of topics) {
        const reviewStats = await getTopicReviewStats(topic.id)
        stats[topic.id] = {
          dueCards: reviewStats.dueCards,
          totalCards: reviewStats.totalCards
        }
      }
      setTopicStats(stats)
    }
    
    if (topics.length > 0) {
      loadStats()
    }
  }, [topics])

  if (topics.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">No topics available yet.</p>
        <p className="text-sm text-gray-500">
          Go to the Dashboard to create your first study topic!
        </p>
      </div>
    )
  }

  const hasAnyDueCards = Object.values(topicStats).some(stat => stat.dueCards > 0)

  if (!hasAnyDueCards && Object.keys(topicStats).length > 0) {
    return (
      <div className="text-center py-8">
        <p className="text-green-600 font-semibold text-lg mb-2">🎉 All caught up!</p>
        <p className="text-gray-600 mb-4">
          No cards are due for review right now.
        </p>
        <p className="text-sm text-gray-500">
          Come back later or add more flashcards on the Dashboard.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {topics.map((topic) => {
        const stats = topicStats[topic.id] || { dueCards: 0, totalCards: 0 }
        const cardCount = stats.dueCards
        const totalCards = stats.totalCards
        
        return (
          <div
            key={topic.id}
            onClick={() => cardCount > 0 ? onTopicSelect(topic.id) : null}
            className={`border border-gray-200 rounded-lg p-4 transition-colors ${
              cardCount > 0 
                ? 'hover:border-blue-400 hover:bg-blue-50 cursor-pointer' 
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-gray-900">{topic.name}</h4>
                <p className="text-gray-600 text-sm">{topic.description}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${cardCount > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                  {cardCount} due for review
                </p>
                <p className="text-xs text-gray-500">
                  {totalCards} total cards
                </p>
                <p className="text-xs text-gray-500">
                  {cardCount > 0 ? 'Click to study' : 'All caught up!'}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}