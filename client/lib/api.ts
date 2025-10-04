import type { DailyLog } from "./types"
import { getDailyLogs } from "./storage"

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
