"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BookOpen, Brain, Target, Clock, Flame, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { useTopics } from "@/hooks/use-topics"
import { Loading } from "@/components/ui/loading"
import { UpcomingSessions } from "@/components/upcoming-sessions"

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const { topics, loading: topicsLoading } = useTopics()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Show loading if auth is still loading
  if (authLoading || topicsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loading size="lg" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Get user's first name for greeting
  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Student"

  // Mock data for now - we'll replace this with real data from the database later
  const mockData = {
    todayStats: {
      cardsReviewed: 0,
      studyTime: 0,
      accuracy: 0,
      streak: profile?.study_streak || 0,
    },
  }

  // Show getting started flow for new users
  if (topics.length === 0) {
    return (
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {firstName}!</h1>
            <p className="text-muted-foreground">Let's get you started with your first topic and flashcards.</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-2xl font-bold">
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Getting Started Hero */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-blue-900 mb-2">Ready to Start Learning?</h2>
                  <p className="text-blue-700 max-w-2xl">
                    StudyMaster uses spaced repetition to help you learn more effectively. Let's create your first topic
                    and add some flashcards to get started!
                  </p>
                </div>
                <Button size="lg" asChild>
                  <Link href="/dashboard/getting-started">
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
              <div className="hidden md:block">
                <div className="w-32 h-32 bg-blue-200 rounded-full flex items-center justify-center">
                  <Brain className="h-16 w-16 text-blue-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                1. Create Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Organize your study materials by subject. Topics help you keep different areas of study separate and
                focused.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-green-600" />
                2. Add Flashcards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create flashcards with questions and answers. Our system will automatically schedule them for optimal
                learning.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                3. Start Studying
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Begin your study sessions and watch your knowledge grow with our scientifically-proven spaced repetition
                algorithm.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{user?.email}</p>
              </div>
              {profile?.full_name && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-sm">{profile.full_name}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Study Streak</p>
                <p className="text-sm flex items-center gap-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  {mockData.todayStats.streak} days
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                <p className="text-sm">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "Today"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Regular dashboard for users with topics
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Good morning, {firstName}!</h1>
          <p className="text-muted-foreground">Ready to continue your learning journey?</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            {currentTime.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-2xl font-bold">
            {currentTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cards Reviewed</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.todayStats.cardsReviewed}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.todayStats.studyTime}m</div>
            <p className="text-xs text-muted-foreground">Total: {profile?.total_study_time || 0} minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Topics</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topics.length}</div>
            <p className="text-xs text-muted-foreground">Active topics</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.todayStats.streak} days</div>
            <p className="text-xs text-muted-foreground">Keep it up! 🔥</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Topics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Topics</CardTitle>
            <Button variant="outline" asChild>
              <Link href="/dashboard/topics">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topics.slice(0, 3).map((topic) => (
              <Card key={topic.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: topic.color }} />
                    <h3 className="font-medium">{topic.name}</h3>
                  </div>
                  {topic.description && <p className="text-sm text-muted-foreground mb-3">{topic.description}</p>}
                  <div className="flex gap-2">
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/topics/${topic.id}`}>View Cards</Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/dashboard/study">Study</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button asChild>
            <Link href="/dashboard/getting-started">
              <BookOpen className="h-4 w-4 mr-2" />
              Add New Topic
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/study">
              <Brain className="h-4 w-4 mr-2" />
              Start Studying
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/calendar">
              <Clock className="h-4 w-4 mr-2" />
              View Calendar
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      <UpcomingSessions />
    </div>
  )
}
