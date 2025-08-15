import { useState, useEffect } from 'react'

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  createdAt: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  const checkAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const response = await fetch('/api/auth/user', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setAuthState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
        })
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return {
    ...authState,
    refetch: checkAuth,
    logout,
  }
}
