import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Calendar, Target, TrendingUp } from "lucide-react"
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants"

const features = [
  {
    icon: Brain,
    title: "Smart Spaced Repetition",
    description: "Uses the proven SM-2 algorithm to optimize your learning schedule",
  },
  {
    icon: Target,
    title: "Flashcard System",
    description: "Create and study flashcards with intelligent difficulty tracking",
  },
  {
    icon: Calendar,
    title: "Study Scheduling",
    description: "Automated scheduling based on your performance and retention",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Detailed analytics to monitor your learning progress",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Brain className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">{APP_NAME}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            Master Your Learning with
            <span className="text-primary block">{APP_NAME}</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {APP_DESCRIPTION}. Boost your retention and study efficiency with scientifically-proven spaced repetition.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <Link href="/auth/sign-up">
              <Button size="lg" className="px-8">
                Start Learning Free
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Learning?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of students who have improved their retention and study efficiency with our smart spaced
            repetition system.
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="px-8">
              Get Started Today
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <div className="text-center text-gray-600">
          <p>&copy; 2024 {APP_NAME}. Built with Next.js and Supabase.</p>
        </div>
      </footer>
    </div>
  )
}
