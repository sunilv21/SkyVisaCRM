import type { Customer, DailyLog } from "./types"

const CUSTOMERS_KEY = "crm_customers"
const LOGS_KEY = "crm_logs"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Helper to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null
  const authSession = localStorage.getItem("crm_auth_session")
  return authSession ? JSON.parse(authSession).token : null
}

// Customer operations
export const getCustomers = async (): Promise<Customer[]> => {
  if (typeof window === "undefined") return []
  
  try {
    const token = getAuthToken()
    if (!token) {
      console.error("No auth token found")
      return []
    }

    console.log("Fetching customers from:", `${API_BASE_URL}/customers`)
    const response = await fetch(`${API_BASE_URL}/customers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("Customer fetch response status:", response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Failed to fetch customers:", response.status, errorText)
      return []
    }

    const customers = await response.json()
    console.log("Fetched customers:", customers.length)
    return customers
  } catch (error) {
    console.error("Error fetching customers:", error)
    return []
  }
}

export const saveCustomer = async (customer: Customer): Promise<void> => {
  try {
    const token = getAuthToken()
    if (!token) throw new Error("Not authenticated")

    const url = customer.id 
      ? `${API_BASE_URL}/customers/${customer.id}`
      : `${API_BASE_URL}/customers`
    
    const method = customer.id ? "PUT" : "POST"

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(customer),
    })

    if (!response.ok) {
      throw new Error("Failed to save customer")
    }
  } catch (error) {
    console.error("Error saving customer:", error)
    throw error
  }
}

export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    const token = getAuthToken()
    if (!token) throw new Error("Not authenticated")

    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to delete customer")
    }
  } catch (error) {
    console.error("Error deleting customer:", error)
    throw error
  }
}

// Daily log operations
export const getDailyLogs = (): DailyLog[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(LOGS_KEY)
  return stored ? JSON.parse(stored) : []
}

export const saveDailyLog = (log: DailyLog): void => {
  const logs = getDailyLogs()
  const existingIndex = logs.findIndex((l) => l.id === log.id)

  if (existingIndex >= 0) {
    logs[existingIndex] = log
  } else {
    logs.push(log)
  }

  localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
}

export const deleteDailyLog = (id: string): void => {
  const logs = getDailyLogs().filter((l) => l.id !== id)
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
}

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
