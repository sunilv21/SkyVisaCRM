import type { DailyLog } from "./types"
import { getDailyLogs } from "./storage"

/**
 * Fetch all logs from the database
 */
export async function getAllLogsFromDB(): Promise<DailyLog[]> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
    const authSession = localStorage.getItem("crm_auth_session")
    const token = authSession ? JSON.parse(authSession).token : null

    const response = await fetch(`${API_BASE_URL}/customers/logs/all`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })

    if (!response.ok) {
      console.error("Failed to fetch logs:", response.statusText)
      return []
    }

    const logs = await response.json()
    console.log("Fetched logs from database:", logs.length)
    return logs
  } catch (error) {
    console.error("getAllLogsFromDB error:", error)
    return []
  }
}

/**
 * Return logs for a specific customer.
 * Kept async to match call sites that await this function.
 */
export async function getCustomerLogs(customerId: string): Promise<DailyLog[]> {
  try {
    const logs = getDailyLogs()
    return logs.filter((l) => l.customerId === customerId)
  } catch (error) {
    console.log("[v0] getCustomerLogs error:", (error as Error)?.message)
    return []
  }
}
