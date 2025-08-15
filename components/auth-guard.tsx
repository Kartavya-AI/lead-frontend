"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AuthGuardProps {
  children: React.ReactNode
}

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  createdAt: string
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/user", {
          method: "GET",
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          router.push("/login")
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        setIsAuthenticated(false)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-800 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
