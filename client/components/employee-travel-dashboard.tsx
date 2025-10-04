"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Calendar, Users, Plane, FileText, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react"
import type { Customer, DailyLog } from "@/lib/types"
import { getCustomers, getDailyLogs } from "@/lib/storage"

interface EmployeeTravelDashboardProps {
  employeeId: string
  employeeName: string
}

interface TravelStats {
  totalTravelCustomers: number
  activeBookings: number
  completedTrips: number
  pendingVisas: number
  upcomingDepartures: number
  totalRevenue: number
}

export default function EmployeeTravelDashboard({ employeeId, employeeName }: EmployeeTravelDashboardProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [stats, setStats] = useState<TravelStats>({
    totalTravelCustomers: 0,
    activeBookings: 0,
    completedTrips: 0,
    pendingVisas: 0,
    upcomingDepartures: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    const allCustomers = getCustomers()
    const allLogs = getDailyLogs()

    // Filter for this employee's travel customers
    const employeeCustomers = allCustomers.filter((c) => c.assignedEmployeeId === employeeId)
    const employeeLogs = allLogs.filter((l) => l.employeeId === employeeId)

    setCustomers(employeeCustomers)
    setLogs(employeeLogs)

    // Calculate travel-specific stats
    const travelCustomers = employeeCustomers.filter((c) => c.destination || c.travelFrom || c.travelTo || c.service)

    const today = new Date().toISOString().split("T")[0]
    const upcomingTrips = employeeCustomers.filter((c) => c.travelFrom && c.travelFrom > today)

    const completedTrips = employeeCustomers.filter((c) => c.travelTo && c.travelTo < today && c.status === "active")

    const pendingVisas = employeeCustomers.filter((c) => c.service === "visa" || c.service === "fullPackage")

    const totalRevenue = employeeCustomers.reduce((sum, c) => sum + (Number.parseFloat(c.budget || "0") || 0), 0)

    setStats({
      totalTravelCustomers: travelCustomers.length,
      activeBookings: employeeCustomers.filter((c) => c.status === "active").length,
      completedTrips: completedTrips.length,
      pendingVisas: pendingVisas.length,
      upcomingDepartures: upcomingTrips.length,
      totalRevenue,
    })
  }, [employeeId])

  const getDestinationStats = () => {
    const destinations: { [key: string]: number } = {}
    customers.forEach((customer) => {
      if (customer.destination) {
        destinations[customer.destination] = (destinations[customer.destination] || 0) + 1
      }
    })
    return Object.entries(destinations)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  }

  const getUpcomingTrips = () => {
    const today = new Date().toISOString().split("T")[0]
    return customers
      .filter((c) => c.travelFrom && c.travelFrom > today)
      .sort((a, b) => (a.travelFrom || "").localeCompare(b.travelFrom || ""))
      .slice(0, 5)
  }

  const getRecentTravelActivity = () => {
    return logs
      .filter(
        (log) =>
          log.type === "booking" ||
          log.type === "visa" ||
          log.subject.toLowerCase().includes("travel") ||
          log.subject.toLowerCase().includes("visa") ||
          log.subject.toLowerCase().includes("booking"),
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Travel Dashboard</h2>
          <p className="text-muted-foreground">Travel bookings and customer management for {employeeName}</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <MapPin className="h-4 w-4 mr-1" />
          Travel Agent
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Travel Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTravelCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.activeBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Trips</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedTrips}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Visas</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingVisas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Trips</CardTitle>
            <Plane className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.upcomingDepartures}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="border-8 text-center">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Trips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Upcoming Departures
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getUpcomingTrips().length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No upcoming trips scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getUpcomingTrips().map((customer) => (
                      <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.destination || "Destination TBD"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {customer.travelFrom ? new Date(customer.travelFrom).toLocaleDateString() : "TBD"}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {customer.travelType || "Standard"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Destinations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Popular Destinations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getDestinationStats().length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No destinations recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getDestinationStats().map(([destination, count]) => (
                      <div key={destination} className="flex items-center justify-between">
                        <span className="font-medium">{destination}</span>
                        <Badge variant="secondary">{count} customers</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {customers.filter((c) => c.status === "active").length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active bookings</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customers
                    .filter((c) => c.status === "active")
                    .map((customer) => (
                      <div key={customer.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{customer.name}</h4>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                          </div>
                          <Badge variant={customer.service === "visa" ? "destructive" : "default"}>
                            {customer.service || "Standard"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Destination:</span>
                            <p className="font-medium">{customer.destination || "TBD"}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Travel Dates:</span>
                            <p className="font-medium">
                              {customer.travelFrom && customer.travelTo
                                ? `${new Date(customer.travelFrom).toLocaleDateString()} - ${new Date(customer.travelTo).toLocaleDateString()}`
                                : "TBD"}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Budget:</span>
                            <p className="font-medium">₹{customer.budget || "0"}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Travel Type:</span>
                            <p className="font-medium">{customer.travelType || "Standard"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="destinations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Destination Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {getDestinationStats().map(([destination, count]) => (
                  <div key={destination} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{destination}</span>
                      <span className="text-sm text-muted-foreground">{count} bookings</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(count / Math.max(...getDestinationStats().map(([, c]) => c))) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Travel Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {getRecentTravelActivity().length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent travel activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getRecentTravelActivity().map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="mt-1">
                        {log.type === "booking" && <Calendar className="h-4 w-4 text-blue-600" />}
                        {log.type === "visa" && <FileText className="h-4 w-4 text-orange-600" />}
                        {!["booking", "visa"].includes(log.type) && (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{log.customerName}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{log.subject}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {log.type}
                          </Badge>
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
