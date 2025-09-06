"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { useAuthState } from "@/hooks/use-auth"
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

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuthState()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}
