"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Users, FileText, Calendar, Plus, LogOut, Plane } from "lucide-react"
import type { Customer, DailyLog, DashboardStats } from "@/lib/types"
import { getCustomers, saveCustomer, deleteCustomer, saveDailyLog, deleteDailyLog } from "@/lib/storage"
import { getCustomerLogs } from "@/lib/api"
import { CustomerList } from "@/components/customer-list"
import { CustomerForm } from "@/components/customer-form"
import { DailyLogList } from "@/components/daily-log-list"
import { DailyLogForm } from "@/components/daily-log-form"
import { DashboardCharts } from "@/components/dashboard-charts"
import { GlobalSearch } from "@/components/global-search"
import { AdvancedFilters, type FilterOptions, applyFilters } from "@/components/advanced-filters"
import { useAuth } from "@/components/auth-provider"
import { LoginForm } from "@/components/login-form"
import { CustomerDatabaseView } from "@/components/customer-database-view"
import { TravellingCustomersView } from "@/components/travelling-customers-view"

export default function EmployeeDashboardPage() {
  const router = useRouter()
  const { isAuthenticated, user, logout, isLoading } = useAuth()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [filteredLogs, setFilteredLogs] = useState<DailyLog[]>([])
  const [filters, setFilters] = useState<FilterOptions>({})
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    todayLogs: 0,
    weekLogs: 0,
    pendingFollowUps: 0,
  })

  // Employee sees only assigned customers and own logs
  const { roleFilteredCustomers, roleFilteredLogs } = useMemo(() => {
    if (!user) return { roleFilteredCustomers: [], roleFilteredLogs: [] }
    const employeeCustomers = customers.filter((c) => c.assignedEmployeeId === user.id)
    const employeeLogs = logs.filter((l) => l.employeeId === user.id)
    return { roleFilteredCustomers: employeeCustomers, roleFilteredLogs: employeeLogs }
  }, [customers, logs, user])

  const loadData = async () => {
    const loadedCustomers = await getCustomers()
    setCustomers(loadedCustomers)

    const allLogs: DailyLog[] = []
    for (const customer of loadedCustomers) {
      const customerLogs = await getCustomerLogs(customer.id)
      allLogs.push(...customerLogs)
    }
    setLogs(allLogs)
  }

  useEffect(() => {
    if (user?.role === "admin") {
      router.replace("/admin")
    }
  }, [router, user])

  useEffect(() => {
    const newFilteredCustomers = applyFilters(roleFilteredCustomers, filters, "customers")
    const newFilteredLogs = applyFilters(roleFilteredLogs, filters, "logs")
    setFilteredCustomers(newFilteredCustomers)
    setFilteredLogs(newFilteredLogs)

    const today = new Date().toISOString().split("T")[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    setStats({
      totalCustomers: roleFilteredCustomers.length,
      activeCustomers: roleFilteredCustomers.filter((c) => c.status === "active").length,
      todayLogs: roleFilteredLogs.filter((l) => l.date === today).length,
      weekLogs: roleFilteredLogs.filter((l) => l.date >= weekAgo).length,
      pendingFollowUps: roleFilteredLogs.filter((l) => l.followUpRequired && l.followUpDate).length,
    })
  }, [filters, roleFilteredCustomers, roleFilteredLogs])

  useEffect(() => {
    if (isAuthenticated) void loadData()
  }, [isAuthenticated])

  const handleSaveCustomer = async () => {
    await loadData()
  }

  const handleDeleteCustomer = async (id: string) => {
    if (user?.role === "employee") {
      const customer = customers.find((c) => c.id === id)
      if (customer?.assignedEmployeeId !== user.id) {
        alert("You can only delete customers assigned to you.")
        return
      }
    }
    await deleteCustomer(id)
    await loadData()
  }

  const handleSaveDailyLog = async (log: DailyLog) => {
    if (user) {
      log.employeeId = user.id
      log.employeeName = user.name
    }
    await saveDailyLog(log)
    await loadData()
  }

  const handleDeleteDailyLog = async (id: string) => {
    if (user?.role === "employee") {
      const log = logs.find((l) => l.id === id)
      if (log?.employeeId !== user.id) {
        alert("You can only delete your own activity logs.")
        return
      }
    }
    await deleteDailyLog(id)
    await loadData()
  }

  const handleMarkTravelling = async (customer: Customer) => {
    const updatedCustomer = {
      ...customer,
      isTravelling: true,
      travellingStartDate: new Date().toISOString(),
    }
    await saveCustomer(updatedCustomer)
    await loadData()
  }

  const handleFiltersChange = (newFilters: FilterOptions) => setFilters(newFilters)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <LoginForm />

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-accent" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Employee Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage your assigned customers and daily activity logs</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 mr-4">
                <div className="text-right">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
              <GlobalSearch customers={roleFilteredCustomers} logs={roleFilteredLogs} />
              <CustomerForm
                onSuccess={handleSaveCustomer}
                trigger={
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Customer
                  </Button>
                }
              />
              <DailyLogForm
                customers={roleFilteredCustomers}
                onSave={handleSaveDailyLog}
                trigger={
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Log Activity
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              {filteredCustomers.length !== stats.totalCustomers && (
                <p className="text-xs text-muted-foreground">{filteredCustomers.length} filtered</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeCustomers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Today's Logs</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.todayLogs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Week's Activity</CardTitle>
              <Calendar className="h-4 w-4 text-card-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-popover-foreground">{stats.weekLogs}</div>
              {filteredLogs.length !== stats.weekLogs && (
                <p className="text-xs text-muted-foreground">{filteredLogs.length} filtered</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Follow-ups</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingFollowUps}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="database" className="space-y-6">
          <div className="flex items-center justify-between w-full">
            <TabsList className="flex-1 w-full">
              <TabsTrigger value="database">
                <Users className="h-4 w-4 mr-1" />
                Customer Database
              </TabsTrigger>
              <TabsTrigger value="travel">
                <Plane className="h-4 w-4 mr-1" />
                Travelling
              </TabsTrigger>
              <TabsTrigger value="logs">Daily Logs</TabsTrigger>
              <TabsTrigger value="customers">My Customers</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            </TabsList>

            <AdvancedFilters
              onFiltersChange={handleFiltersChange}
              customers={roleFilteredCustomers}
              logs={roleFilteredLogs}
            />
          </div>

          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle>Customer Database - All Customers</CardTitle>
                <p className="text-sm text-muted-foreground">
                  View all customers in the database for queries and reference
                </p>
              </CardHeader>
              <CardContent>
                {customers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No customers in database</h3>
                    <p className="text-muted-foreground mb-6">The customer database is empty</p>
                  </div>
                ) : (
                  <CustomerList
                    customers={customers}
                    onUpdate={handleSaveCustomer}
                    onDelete={handleDeleteCustomer}
                    readOnly={true}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="travel">
            <TravellingCustomersView customers={roleFilteredCustomers} onUpdate={handleSaveCustomer} />
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>My Daily Activity Logs</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No activity logs yet</h3>
                    <p className="text-muted-foreground mb-6">Start logging your customer interactions</p>
                    <DailyLogForm
                      customers={roleFilteredCustomers}
                      onSave={handleSaveDailyLog}
                      trigger={
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          Log New Activity
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <DailyLogList
                    logs={filteredLogs}
                    customers={roleFilteredCustomers}
                    onUpdate={handleSaveDailyLog}
                    onDelete={handleDeleteDailyLog}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>My Assigned Customers</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Customers assigned to you for management
                </p>
              </CardHeader>
              <CardContent>
                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No customers assigned to you</h3>
                    <p className="text-muted-foreground mb-6">
                      Add your first customer or ask admin to assign customers to you
                    </p>
                    <CustomerForm
                      onSuccess={handleSaveCustomer}
                      trigger={
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Customer
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <CustomerList
                    customers={filteredCustomers}
                    onUpdate={handleSaveCustomer}
                    onDelete={handleDeleteCustomer}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardCharts customers={roleFilteredCustomers} logs={roleFilteredLogs} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {roleFilteredLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No activity logs yet</p>
                      <p className="text-sm">Start by adding your first customer interaction</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {roleFilteredLogs
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 5)
                        .map((log) => (
                          <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{log.customerName}</p>
                              <p className="text-sm text-muted-foreground">{log.subject}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  log.outcome === "positive"
                                    ? "default"
                                    : log.outcome === "negative"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {log.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CustomerForm
                    onSuccess={handleSaveCustomer}
                    trigger={
                      <Button
                        className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white"
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Customer
                      </Button>
                    }
                  />
                  <DailyLogForm
                    customers={roleFilteredCustomers}
                    onSave={handleSaveDailyLog}
                    trigger={
                      <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white">
                        <FileText className="h-4 w-4 mr-2" />
                        Log Activity
                      </Button>
                    }
                  />
                  <GlobalSearch
                    customers={roleFilteredCustomers}
                    logs={roleFilteredLogs}
                    onSelectCustomer={() => {}}
                    onSelectLog={() => {}}
                  />
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Follow-ups
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
