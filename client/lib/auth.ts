import type { User, AuthSession, LoginCredentials } from "./types"
import { cookieService } from "./cookies"

const AUTH_STORAGE_KEY = "crm_auth_session"
const AUTH_COOKIE_KEY = "crm_session"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export const authService = {
  // Login function
  login: async (credentials: LoginCredentials): Promise<AuthSession | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()

      // Map backend response to frontend User type
      const user: User = {
        id: data._id,
        email: data.email,
        name: data.name,
        role: data.role,
        password: "", // Never store password
        department: data.department || "",
        createdAt: data.createdAt || new Date().toISOString(),
        isActive: true,
      }

      const session: AuthSession = {
        user,
        token: data.token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      }

      // Store session in both localStorage and cookies for faster access
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
      cookieService.set(AUTH_COOKIE_KEY, JSON.stringify(session), 7) // 7 days

      return session
    } catch (error) {
      console.error("Login API error:", error)
      return null
    }
  },

  // Logout function
  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    cookieService.delete(AUTH_COOKIE_KEY)
  },

  // Get current session (try cookie first for faster access, fallback to localStorage)
  getCurrentSession: (): AuthSession | null => {
    try {
      // Try cookie first (faster)
      let stored = cookieService.get(AUTH_COOKIE_KEY)
      
      // Fallback to localStorage if cookie not found
      if (!stored) {
        stored = localStorage.getItem(AUTH_STORAGE_KEY)
      }
      
      if (!stored) return null

      const session: AuthSession = JSON.parse(stored)

      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        localStorage.removeItem(AUTH_STORAGE_KEY)
        cookieService.delete(AUTH_COOKIE_KEY)
        return null
      }

      // Sync cookie and localStorage if one is missing
      if (!cookieService.get(AUTH_COOKIE_KEY)) {
        cookieService.set(AUTH_COOKIE_KEY, JSON.stringify(session), 7)
      }
      if (!localStorage.getItem(AUTH_STORAGE_KEY)) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
      }

      return session
    } catch {
      return null
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return authService.getCurrentSession() !== null
  },

  // Get current user
  getCurrentUser: (): User | null => {
    const session = authService.getCurrentSession()
    return session?.user || null
  },

  // Check if current user is admin
  isAdmin: (): boolean => {
    const user = authService.getCurrentUser()
    return user?.role === "admin"
  },

  // Get all users (admin only) - These should be implemented via API calls when needed
  getAllUsers: async (): Promise<User[]> => {
    const session = authService.getCurrentSession()
    if (!session) {
      throw new Error("Not authenticated")
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      return await response.json()
    } catch (error) {
      console.error("Get users error:", error)
      throw error
    }
  },

  // Add new user (admin only)
  addUser: async (userData: Omit<User, "id" | "createdAt">): Promise<User> => {
    const session = authService.getCurrentSession()
    if (!session) {
      throw new Error("Not authenticated")
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        throw new Error("Failed to add user")
      }

      return await response.json()
    } catch (error) {
      console.error("Add user error:", error)
      throw error
    }
  },

  // Update user (admin only)
  updateUser: async (userId: string, updates: Partial<User>): Promise<User> => {
    const session = authService.getCurrentSession()
    if (!session) {
      throw new Error("Not authenticated")
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error("Failed to update user")
      }

      return await response.json()
    } catch (error) {
      console.error("Update user error:", error)
      throw error
    }
  },

  // Delete user (admin only)
  deleteUser: async (userId: string): Promise<boolean> => {
    const session = authService.getCurrentSession()
    if (!session) {
      throw new Error("Not authenticated")
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      })

      return response.ok
    } catch (error) {
      console.error("Delete user error:", error)
      return false
    }
  },
}
