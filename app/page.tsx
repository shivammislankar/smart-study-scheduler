import Header from './components/header'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Your Study Journey
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Master your learning with intelligent spaced repetition
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
            Get Started
          </button>
        </div>
      </main>
    </div>
  )
}