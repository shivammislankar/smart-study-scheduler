"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
// import { Loading } from "@/components/ui/loading"

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children, redirectTo = "/auth/sign-in" }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [timeoutReached, setTimeoutReached] = useState(false)

  useEffect(() => {
    console.log("ProtectedRoute - user:", user?.email, "loading:", loading)

    if (!loading && !user) {
      console.log("No user found, redirecting to:", redirectTo)
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log("Loading timeout reached")
        setTimeoutReached(true)
      }
    }, 10000) // 10 second timeout

    return () => clearTimeout(timeout)
  }, [loading])

  // Show loading while checking auth
  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          {/* <Loading size="lg" /> */}
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error if timeout reached
  if (timeoutReached && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600">Loading timeout. Please refresh the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!user) {
    return null
  }

  // User is authenticated, show the protected content
  return <>{children}</>
}
