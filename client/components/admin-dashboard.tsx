"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Activity, Calendar, Target, Award, AlertTriangle, CheckCircle, Clock, BarChart3 } from "lucide-react"
import type { Customer, DailyLog } from "@/lib/types"
import { DashboardCharts } from "./dashboard-charts"

interface AdminDashboardProps {
  customers: Customer[]
  logs: DailyLog[]
  users?: any[] // Added users prop to show actual employee count
}

export function AdminDashboard({ customers, logs, users = [] }: AdminDashboardProps) {
  const adminStats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]
    const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    const thisMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    // Employee performance metrics
    const employeeStats = logs.reduce(
      (acc, log) => {
        if (!acc[log.employeeId]) {
          acc[log.employeeId] = {
            name: log.employeeName,
            totalLogs: 0,
            positiveOutcomes: 0,
            todayLogs: 0,
            weekLogs: 0,
            followUpsCreated: 0,
          }
        }

        acc[log.employeeId].totalLogs++
        if (log.outcome === "positive") acc[log.employeeId].positiveOutcomes++
        if (log.date === today) acc[log.employeeId].todayLogs++
        if (log.date >= thisWeek) acc[log.employeeId].weekLogs++
        if (log.followUpRequired) acc[log.employeeId].followUpsCreated++

        return acc
      },
      {} as Record<string, any>,
    )

    // Customer status distribution
    const customerStatusStats = Array.isArray(customers) ? customers.reduce(
      (acc, customer) => {
        acc[customer.status] = (acc[customer.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) : {}

    // Activity type distribution
    const activityTypeStats = logs.reduce(
      (acc, log) => {
        acc[log.type] = (acc[log.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Outcome distribution
    const outcomeStats = logs.reduce(
      (acc, log) => {
        acc[log.outcome] = (acc[log.outcome] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalEmployees: users.length > 0 ? users.length : Object.keys(employeeStats).length,
      totalCustomers: Array.isArray(customers) ? customers.length : 0,
      totalLogs: logs.length,
      todayLogs: logs.filter((l) => l.date === today).length,
      weekLogs: logs.filter((l) => l.date >= thisWeek).length,
      monthLogs: logs.filter((l) => l.date >= thisMonth).length,
      pendingFollowUps: logs.filter((l) => l.followUpRequired && l.followUpDate).length,
      overdueFollowUps: logs.filter(
        (l) => l.followUpRequired && l.followUpDate && new Date(l.followUpDate) < new Date(),
      ).length,
      employeeStats: Object.values(employeeStats),
      customerStatusStats,
      activityTypeStats,
      outcomeStats,
      conversionRate: logs.length > 0 ? Math.round(((outcomeStats.positive || 0) / logs.length) * 100) : 0,
    }
  }, [customers, logs, users])

  return (
    <div className="space-y-6">
      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active system users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Activity</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{adminStats.totalLogs}</div>
            <p className="text-xs text-muted-foreground">+{adminStats.weekLogs} this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{adminStats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">Positive outcomes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-ups</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{adminStats.pendingFollowUps}</div>
            <p className="text-xs text-muted-foreground">{adminStats.overdueFollowUps} overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <DashboardCharts customers={customers} logs={logs} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Employee Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {adminStats.employeeStats.slice(0, 5).map((employee: any, index) => (
                <div key={employee.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{employee.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{employee.totalLogs} logs</p>
                      <p className="text-xs text-muted-foreground">{employee.positiveOutcomes} positive</p>
                    </div>
                  </div>
                  <Progress
                    value={employee.totalLogs > 0 ? (employee.positiveOutcomes / employee.totalLogs) * 100 : 0}
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      Success Rate:{" "}
                      {employee.totalLogs > 0 ? Math.round((employee.positiveOutcomes / employee.totalLogs) * 100) : 0}%
                    </span>
                    <span>This week: {employee.weekLogs}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Customer Status Distribution */}
              <div>
                <h4 className="font-medium mb-2">Customer Status</h4>
                <div className="space-y-2">
                  {Object.entries(adminStats.customerStatusStats).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={status === "active" ? "default" : status === "prospect" ? "secondary" : "outline"}
                          className="capitalize"
                        >
                          {status}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Types */}
              <div>
                <h4 className="font-medium mb-2">Activity Distribution</h4>
                <div className="space-y-2">
                  {Object.entries(adminStats.activityTypeStats).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="capitalize text-sm">{type}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(count / adminStats.totalLogs) * 100} className="w-16 h-2" />
                        <span className="text-sm font-medium w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {adminStats.overdueFollowUps > 0 && (
              <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Overdue Follow-ups</p>
                  <p className="text-sm text-muted-foreground">
                    {adminStats.overdueFollowUps} follow-ups are past due and need attention
                  </p>
                </div>
              </div>
            )}

            {adminStats.todayLogs === 0 && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-600">Low Activity Today</p>
                  <p className="text-sm text-muted-foreground">
                    No activity logs recorded today. Consider checking with your team.
                  </p>
                </div>
              </div>
            )}

            {adminStats.conversionRate >= 70 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium text-green-600">Excellent Performance</p>
                  <p className="text-sm text-muted-foreground">
                    Your team is achieving a {adminStats.conversionRate}% positive outcome rate!
                  </p>
                </div>
              </div>
            )}

            {adminStats.overdueFollowUps === 0 && adminStats.todayLogs > 0 && adminStats.conversionRate < 70 && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">System Running Smoothly</p>
                  <p className="text-sm text-muted-foreground">
                    No critical alerts at this time. All systems operational.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
