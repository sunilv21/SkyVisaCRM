"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Clock, Activity } from "lucide-react"
import type { DailyLog, EmployeeActivity } from "@/lib/types"

interface EmployeeActivityProps {
  logs: DailyLog[]
}

export default function EmployeeActivityComponent({ logs }: EmployeeActivityProps) {
  // Calculate employee activity statistics
  const employeeStats = logs.reduce(
    (acc, log) => {
      const employeeId = log.employeeId || log.employeeName.toLowerCase().replace(/\s+/g, "")

      if (!acc[employeeId]) {
        acc[employeeId] = {
          employeeId,
          employeeName: log.employeeName,
          totalLogs: 0,
          lastActivity: log.createdAt,
          pendingFollowUps: 0,
        }
      }

      acc[employeeId].totalLogs++

      if (new Date(log.createdAt) > new Date(acc[employeeId].lastActivity)) {
        acc[employeeId].lastActivity = log.createdAt
      }

      if (log.followUpRequired && (!log.followUpDate || new Date(log.followUpDate) >= new Date())) {
        acc[employeeId].pendingFollowUps++
      }

      return acc
    },
    {} as Record<string, EmployeeActivity>,
  )

  const employees = Object.values(employeeStats).sort((a, b) => b.totalLogs - a.totalLogs)

  // Get recent activity by employee
  const recentActivity = logs
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Employee Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Employee Activity Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No employee activity recorded yet.</p>
            ) : (
              employees.map((employee) => (
                <div key={employee.employeeId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{employee.employeeName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Last active: {new Date(employee.lastActivity).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">{employee.totalLogs}</div>
                      <div className="text-xs text-muted-foreground">Total Logs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-orange-600">{employee.pendingFollowUps}</div>
                      <div className="text-xs text-muted-foreground">Follow-ups</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent activity to display.</p>
            ) : (
              recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 border-l-2 border-purple-200 bg-gray-50 rounded-r-lg"
                >
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {log.employeeName}
                      </Badge>
                      <span className="text-sm font-medium">{log.subject}</span>
                      <Badge
                        variant={
                          log.outcome === "positive"
                            ? "default"
                            : log.outcome === "negative"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {log.outcome}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {log.customerName} • {log.type}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(log.createdAt).toLocaleString()}
                      {log.followUpRequired && (
                        <Badge variant="outline" className="text-xs text-orange-600">
                          Follow-up required
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
