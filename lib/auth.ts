import { supabase } from "./supabase"
import type { Profile } from "./supabase"

// Auth service
export const authService = {
  // Sign up new user
  async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) throw error

    // Return the full result so we can check if email verification is needed
    return data
  },

  // Sign in user
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Create profile if it doesn't exist (for existing users)
    if (data.user && data.session) {
      try {
        await this.getProfile(data.user.id)
      } catch (profileError) {
        // Profile doesn't exist, create it
        await this.createProfile(data.user.id, {
          full_name: data.user.user_metadata?.full_name,
          study_streak: 0,
          total_study_time: 0,
        })
      }
    }

    return data
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Get current session
  async getCurrentSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // Create user profile
  async createProfile(userId: string, profileData: Partial<Profile>) {
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        ...profileData,
      })
      .select()
      .single()

    if (error) throw error
    return data as Profile
  },

  // Get user profile
  async getProfile(userId: string) {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) throw error
    return data as Profile
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error
    return data as Profile
  },

  // Reset password
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) throw error
  },

  // Update password
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },
}
