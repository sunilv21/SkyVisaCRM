"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { AuthState } from "@/lib/types"
import { authService } from "@/lib/auth"

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    session: null,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const session = authService.getCurrentSession()
    if (session) {
      setAuthState({
        isAuthenticated: true,
        user: session.user,
        session,
      })
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const session = await authService.login({ email, password })
      if (session) {
        setAuthState({
          isAuthenticated: true,
          user: session.user,
          session,
        })
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = () => {
    authService.logout()
    setAuthState({
      isAuthenticated: false,
      user: null,
      session: null,
    })
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
