"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { authService } from "@/lib/auth"
import type { Profile } from "@/lib/supabase"

interface User {
  id: string
  email: string
  profile?: Profile | null
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ user: any; session: any } | null>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const handleUserSession = async (sessionUser: any) => {
    try {
      console.log("Handling user session for:", sessionUser.email)

      // Try to get profile
      let userProfile: Profile | null = null
      try {
        userProfile = await authService.getProfile(sessionUser.id)
        console.log("Profile found:", userProfile)
      } catch (profileError) {
        console.log("Profile not found, creating new profile...")
        // Create profile if it doesn't exist
        try {
          userProfile = await authService.createProfile(sessionUser.id, {
            full_name: sessionUser.user_metadata?.full_name,
            study_streak: 0,
            total_study_time: 0,
          })
          console.log("Profile created:", userProfile)
        } catch (createError) {
          console.error("Error creating profile:", createError)
          // Continue without profile for now
          userProfile = null
        }
      }

      // Set user and profile together
      setUser({
        id: sessionUser.id,
        email: sessionUser.email || "",
        profile: userProfile,
      })
      setProfile(userProfile)

      // Ensure loading is set to false
      setLoading(false)
    } catch (error) {
      console.error("Error handling user session:", error)
      // Still set the user even if profile fails
      setUser({
        id: sessionUser.id,
        email: sessionUser.email || "",
        profile: null,
      })
      setProfile(null)
      setLoading(false)
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log("Getting initial session...")
        const session = await authService.getCurrentSession()
        if (session?.user) {
          console.log("Initial session found for:", session.user.email)
          await handleUserSession(session.user)
        } else {
          console.log("No initial session found")
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.email)

      if (event === "SIGNED_IN" && session?.user) {
        await handleUserSession(session.user)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
        setLoading(false)
      } else {
        // Handle other events and ensure loading is false
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log("Attempting sign in for:", email)
    try {
      const result = await authService.signIn(email, password)
      console.log("Sign in successful:", result.user?.email)
      // Don't set loading here - let the auth state change handle it
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    console.log("Attempting sign up for:", email)
    try {
      const result = await authService.signUp(email, password, fullName)
      console.log("Sign up result:", result)
      return result
    } catch (error) {
      console.error("Sign up error:", error)
      throw error
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await authService.signOut()
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error("No user logged in")

    try {
      const updatedProfile = await authService.updateProfile(user.id, updates)
      setProfile(updatedProfile)
      setUser({ ...user, profile: updatedProfile })
    } catch (error) {
      throw error
    }
  }

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }
}
