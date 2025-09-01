"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User, Admin } from "./auth"
import { getSupabaseClient, isSupabaseConnected } from "./supabase"

interface AuthContextType {
  user: User | Admin | null
  isLoading: boolean
  isAdmin: boolean
  isUser: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      // Check if Supabase is connected and try Supabase auth first
      if (isSupabaseConnected()) {
        const supabase = getSupabaseClient()
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (session?.user && !error) {
          // Get user profile from our users table
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role,
              batch: profile.batch,
              department: profile.department,
              phone: profile.phone,
              address: profile.address,
              yearOfPassing: profile.year_of_passing,
              registrationDate: profile.registration_date,
              status: profile.status,
            })
            return
          }
        }
      }
      
      // Fallback to JWT authentication
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Failed to refresh user:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: "Login failed" }
    }
  }

  const logout = async () => {
    try {
      // If using Supabase, sign out from Supabase
      if (isSupabaseConnected()) {
        const supabase = getSupabaseClient()
        await supabase.auth.signOut()
      }
      
      // Also clear JWT session
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  useEffect(() => {
    refreshUser()
    
    // Set up Supabase auth state listener if Supabase is connected
    if (isSupabaseConnected()) {
      const supabase = getSupabaseClient()
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: any, session: any) => {
          if (event === 'SIGNED_IN' && session?.user) {
            // Get user profile when signed in
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (profile) {
              setUser({
                id: profile.id,
                email: profile.email,
                name: profile.name,
                role: profile.role,
                batch: profile.batch,
                department: profile.department,
                phone: profile.phone,
                address: profile.address,
                yearOfPassing: profile.year_of_passing,
                registrationDate: profile.registration_date,
                status: profile.status,
              })
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null)
          }
        }
      )
      
      return () => subscription.unsubscribe()
    }
  }, [refreshUser])

  const value = {
    user,
    isLoading,
    isAdmin: user?.role === "admin",
    isUser: user?.role === "user",
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
