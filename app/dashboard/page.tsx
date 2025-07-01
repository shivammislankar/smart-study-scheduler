'use client'
import { useState, useEffect } from 'react'
import Header from '../components/header'
import { getTopics, addTopic, getFlashcards, addFlashcard, Topic, Flashcard } from '../lib/database'

export default function DashboardPage() {
  // Form states
  const [topicName, setTopicName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  
  // Data states
  const [topics, setTopics] = useState<Topic[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [topicsData, flashcardsData] = await Promise.all([
        getTopics(),
        getFlashcards()
      ])
      setTopics(topicsData)
      setFlashcards(flashcardsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newTopic = await addTopic({
      name: topicName,
      description: description
    })
    
    if (newTopic) {
      // Reload data to get the latest
      await loadData()
      // Clear form
      setTopicName('')
      setDescription('')
    } else {
      alert('Error adding topic. Please try again.')
    }
  }

  const handleFlashcardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedTopicId) {
      alert('Please select a topic first!')
      return
    }
    
    const newFlashcard = await addFlashcard({
      topic_id: selectedTopicId,
      question: question,
      answer: answer,
      next_review_date: new Date().toISOString(), // Due immediately
      interval_days: 1,
      ease_factor: 2.5,
      repetitions: 0
    })
    
    if (newFlashcard) {
      // Reload data to get the latest
      await loadData()
      // Clear form
      setQuestion('')
      setAnswer('')
    } else {
      alert('Error adding flashcard. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">Loading your study materials...</p>
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
          Study Dashboard
        </h2>
        
        {/* Add Topic Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Study Topic</h3>
          <form onSubmit={handleTopicSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic Name
              </label>
              <input
                type="text"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="e.g., Mathematics, History, Spanish"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this topic"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700"
            >
              Add Topic
            </button>
          </form>
        </div>
        
        {/* Topics List */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Your Study Topics</h3>
          {topics.length === 0 ? (
            <p className="text-gray-700">
              No topics yet. Add your first study topic above!
            </p>
          ) : (
            <div className="space-y-6">
              {topics.map((topic) => {
                const topicFlashcards = flashcards.filter(card => card.topic_id === topic.id)
                return (
                  <div key={topic.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 text-lg">{topic.name}</h4>
                    {topic.description && (
                      <p className="text-gray-600 mt-2">{topic.description}</p>
                    )}
                    
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-700 mb-2">
                        Flashcards ({topicFlashcards.length})
                      </h5>
                      {topicFlashcards.length === 0 ? (
                        <p className="text-gray-500 text-sm">No flashcards yet</p>
                      ) : (
                        <div className="grid gap-3">
                          {topicFlashcards.map((card) => (
                            <div key={card.id} className="bg-gray-50 rounded p-3 border-l-4 border-blue-400">
                              <p className="font-medium text-gray-800">Q: {card.question}</p>
                              <p className="text-gray-600 mt-1">A: {card.answer}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Add Flashcard Form */}
        {topics.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Flashcard</h3>
            <form onSubmit={handleFlashcardSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Topic
                </label>
                <select
                  value={selectedTopicId || ''}
                  onChange={(e) => setSelectedTopicId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  required
                >
                  <option value="">Choose a topic...</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., What is 2 + 2?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer
                </label>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="e.g., 4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-700"
              >
                Add Flashcard
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}