import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

// Minimal user info that works without profiles table
interface UserInfo {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
}

interface AuthContextType {
  session: Session | null
  user: UserInfo | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper to extract user info from session
const getUserInfoFromSession = (session: Session | null): UserInfo | null => {
  if (!session?.user) return null
  return {
    id: session.user.id,
    email: session.user.email || '',
    full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
    avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null,
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
        }

        setSession(currentSession)
        setUser(getUserInfoFromSession(currentSession))
      } catch (error) {
        console.error('Failed to initialize auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event)
      setSession(newSession)
      setUser(getUserInfoFromSession(newSession))
    })

    return () => subscription?.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
      },
    })
    if (error) throw error
  }

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}`,
        data: displayName ? { full_name: displayName } : undefined,
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setSession(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
