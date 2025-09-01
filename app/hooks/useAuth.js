'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Authentication Context
const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  isAuthenticated: false,
  isAdmin: false,
  error: null,
})

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Auth check failed:', err)
      setError('Failed to check authentication status')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUser(data.user)
        
        // Redirect based on user role
        if (data.redirectUrl) {
          router.push(data.redirectUrl)
        } else {
          router.push(data.user.role === 'admin' ? '/admin' : '/events')
        }
        
        return { success: true, user: data.user }
      } else {
        const errorMessage = data.error || 'Login failed'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = 'Network error. Please try again.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      // Clear user state regardless of response
      setUser(null)
      
      // Redirect to home page
      router.push('/')
      
      return { success: true }
    } catch (err) {
      console.error('Logout error:', err)
      // Still clear user state on error
      setUser(null)
      router.push('/')
      return { success: false, error: 'Logout failed' }
    } finally {
      setLoading(false)
    }
  }

  // Helper functions
  const isAuthenticated = !!user
  const isAdmin = user?.role === 'admin'
  const isUser = user?.role === 'user'

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    checkAuth,
    isAuthenticated,
    isAdmin,
    isUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Higher-order component for protected routes
export const withAuth = (WrappedComponent, options = {}) => {
  const { requireAdmin = false, requireUser = false, redirectTo = '/' } = options

  return function AuthenticatedComponent(props) {
    const { user, loading, isAuthenticated, isAdmin } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading) {
        if (!isAuthenticated) {
          router.push(redirectTo)
          return
        }

        if (requireAdmin && !isAdmin) {
          router.push('/events?error=admin_access_required')
          return
        }

        if (requireUser && !user) {
          router.push(redirectTo)
          return
        }
      }
    }, [user, loading, isAuthenticated, isAdmin, router])

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null // Will redirect
    }

    if (requireAdmin && !isAdmin) {
      return null // Will redirect
    }

    return <WrappedComponent {...props} />
  }
}

// Hook for protected API calls
export const useAuthenticatedFetch = () => {
  const { user, logout } = useAuth()

  const authenticatedFetch = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    // Handle authentication errors
    if (response.status === 401) {
      console.warn('Authentication expired, logging out')
      await logout()
      throw new Error('Authentication expired')
    }

    return response
  }

  return authenticatedFetch
}

export default AuthProvider