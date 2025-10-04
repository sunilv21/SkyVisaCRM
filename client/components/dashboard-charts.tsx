"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Calendar, TrendingUp, Users, Activity } from "lucide-react"
import type { Customer, DailyLog } from "@/lib/types"

interface DashboardChartsProps {
  customers: Customer[]
  logs: DailyLog[]
}

export function DashboardCharts({ customers, logs }: DashboardChartsProps) {
  // Prepare activity data for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split("T")[0]
  })

  const activityData = last7Days.map((date) => {
    const dayLogs = logs.filter((log) => log.date === date)
    return {
      date: new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      activities: dayLogs.length,
      calls: dayLogs.filter((log) => log.type === "call").length,
      emails: dayLogs.filter((log) => log.type === "email").length,
      meetings: dayLogs.filter((log) => log.type === "meeting").length,
    }
  })

  // Customer status breakdown
  const customerStatusData = [
    {
      name: "Active",
      value: customers.filter((c) => c.status === "active").length,
      color: "#22c55e",
    },
    {
      name: "Prospects",
      value: customers.filter((c) => c.status === "prospect").length,
      color: "#3b82f6",
    },
    {
      name: "Dead",
      value: customers.filter((c) => c.status === "Dead").length,
      color: "#6b7280",
    },
  ]

  // Activity type breakdown
  const activityTypeData = [
    {
      name: "Calls",
      value: logs.filter((log) => log.type === "call").length,
      color: "#8b5cf6",
    },
    {
      name: "Emails",
      value: logs.filter((log) => log.type === "email").length,
      color: "#06b6d4",
    },
    {
      name: "Meetings",
      value: logs.filter((log) => log.type === "meeting").length,
      color: "#f59e0b",
    },
    {
      name: "Notes",
      value: logs.filter((log) => log.type === "note").length,
      color: "#ef4444",
    },
  ]

  // Outcome trends
  const outcomeData = [
    {
      name: "Positive",
      value: logs.filter((log) => log.outcome === "positive").length,
      color: "#22c55e",
    },
    {
      name: "Neutral",
      value: logs.filter((log) => log.outcome === "neutral").length,
      color: "#6b7280",
    },
    {
      name: "Negative",
      value: logs.filter((log) => log.outcome === "negative").length,
      color: "#ef4444",
    },
  ]

  // Upcoming follow-ups
  const upcomingFollowUps = logs
    .filter((log) => log.followUpRequired && log.followUpDate)
    .filter((log) => new Date(log.followUpDate!) >= new Date())
    .sort((a, b) => new Date(a.followUpDate!).getTime() - new Date(b.followUpDate!).getTime())
    .slice(0, 5)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Activity Trend Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Activity Trend (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              activities: { label: "Total Activities", color: "hsl(var(--accent))" },
              calls: { label: "Calls", color: "#8b5cf6" },
              emails: { label: "Emails", color: "#06b6d4" },
              meetings: { label: "Meetings", color: "#f59e0b" },
            }}
            className="h-80"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-3">
                          <p className="font-medium mb-2">{label}</p>
                          {payload.map((entry, index) => (
                            <p key={index} className="text-sm" style={{ color: entry.color }}>
                              {entry.dataKey}: {entry.value}
                            </p>
                          ))}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="activities" fill="hsl(var(--accent))" radius={4} />
                <Bar dataKey="calls" fill="#8b5cf6" radius={4} />
                <Bar dataKey="emails" fill="#06b6d4" radius={4} />
                <Bar dataKey="meetings" fill="#f59e0b" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Customer Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Customer Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customerStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {customerStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-2">
                          <p className="font-medium">
                            {data.name}: {data.value}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {customerStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent" />
            Activity Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityTypeData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium">{item.name}</span>
                </div>
                <Badge variant="secondary">{item.value}</Badge>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Total Activities</span>
              <span>{logs.length}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{
                  width: logs.length > 0 ? "100%" : "0%",
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Follow-ups */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            Upcoming Follow-ups
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingFollowUps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming follow-ups</p>
              <p className="text-sm">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingFollowUps.map((log) => {
                const daysUntil = Math.ceil(
                  (new Date(log.followUpDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                )
                const isOverdue = daysUntil < 0
                const isToday = daysUntil === 0
                const isSoon = daysUntil <= 2 && daysUntil > 0

                return (
                  <div
                    key={log.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      isOverdue
                        ? "border-red-200 bg-red-50"
                        : isToday
                          ? "border-orange-200 bg-orange-50"
                          : isSoon
                            ? "border-yellow-200 bg-yellow-50"
                            : "border-border"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{log.customerName}</span>
                        <Badge
                          variant={isOverdue ? "destructive" : isToday ? "default" : "secondary"}
                          className={
                            isOverdue
                              ? ""
                              : isToday
                                ? "bg-orange-100 text-orange-800 hover:bg-orange-100"
                                : isSoon
                                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                  : ""
                          }
                        >
                          {isOverdue ? `${Math.abs(daysUntil)} days overdue` : isToday ? "Today" : `${daysUntil} days`}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{log.subject}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(log.followUpDate!).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Outcome Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Outcome Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {outcomeData.map((item) => {
              const percentage = logs.length > 0 ? Math.round((item.value / logs.length) * 100) : 0
              return (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{percentage}%</span>
                      <Badge variant="secondary">{item.value}</Badge>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: item.color,
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Avg. Activities per Day</span>
              <Badge variant="secondary">{logs.length > 0 ? (logs.length / 7).toFixed(1) : "0"}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Success Rate</span>
              <Badge variant="secondary">
                {logs.length > 0
                  ? `${Math.round((logs.filter((l) => l.outcome === "positive").length / logs.length) * 100)}%`
                  : "0%"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Active Customer Ratio</span>
              <Badge variant="secondary">
                {customers.length > 0
                  ? `${Math.round((customers.filter((c) => c.status === "active").length / customers.length) * 100)}%`
                  : "0%"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Pending Follow-ups</span>
              <Badge variant="secondary">{upcomingFollowUps.length}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
