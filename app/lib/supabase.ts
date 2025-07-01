import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client-side auth helper
export const getUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Sign out helper
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
