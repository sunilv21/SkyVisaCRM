"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Users, FileText, Calendar, Plus, LogOut, Shield } from "lucide-react"
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
import { authService } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"
import { AdminDashboard } from "@/components/admin-dashboard"
import { EmployeeManagement } from "@/components/employee-management"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { isAuthenticated, user, logout, isLoading } = useAuth()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [users, setUsers] = useState<any[]>([])
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
  const [travelingCustomers, setTravelingCustomers] = useState<Customer[]>([])

  // Admin sees all data
  const { roleFilteredCustomers, roleFilteredLogs } = useMemo(
    () => ({ roleFilteredCustomers: customers, roleFilteredLogs: logs }),
    [customers, logs],
  )

  const loadData = async () => {
    console.log("Admin: Loading data...")
    const loadedCustomers = await getCustomers()
    console.log("Admin: Loaded customers:", loadedCustomers.length)
    setCustomers(loadedCustomers)

    // Load users
    try {
      const loadedUsers = await authService.getAllUsers()
      console.log("Admin: Loaded users:", loadedUsers.length)
      setUsers(loadedUsers)
    } catch (error) {
      console.error("Failed to load users:", error)
    }

    const allLogs: DailyLog[] = []
    for (const customer of loadedCustomers) {
      const customerLogs = await getCustomerLogs(customer.id)
      allLogs.push(...customerLogs)
    }
    setLogs(allLogs)
    console.log("Admin: Data loaded successfully")
  }

  useEffect(() => {
    if (user?.role !== "admin") {
      router.replace("/employee")
    }
  }, [router, user])

  useEffect(() => {
    const newFilteredCustomers = applyFilters(roleFilteredCustomers, filters, "customers")
    const newFilteredLogs = applyFilters(roleFilteredLogs, filters, "logs")
    setFilteredCustomers(newFilteredCustomers)
    setFilteredLogs(newFilteredLogs)

    const today = new Date().toISOString().split("T")[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    // Filter traveling customers
    const traveling = roleFilteredCustomers.filter((c) => c.isTravelling === true)
    setTravelingCustomers(traveling)

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
    await deleteCustomer(id)
    await loadData()
  }

  const handleSaveDailyLog = async (log: DailyLog) => {
    await saveDailyLog(log)
    await loadData()
  }

  const handleDeleteDailyLog = async (id: string) => {
    await deleteDailyLog(id)
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

  // Guard: only admins here; others -> employee dashboard
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Redirecting…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-accent" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage all customers, employees, and system reports</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 mr-4">
                <div className="text-right">
                  <p className="text-sm font-medium flex items-center gap-2">
                    {user?.name}
                    <Badge variant="secondary" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  </p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
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
              <CardTitle className="text-sm font-medium">Today's Logs</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.todayLogs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Week's Activity</CardTitle>
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
              <CardTitle className="text-sm font-medium">All Follow-ups</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingFollowUps}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Traveling Now</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{travelingCustomers.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <div className="flex items-center justify-between w-full">
            <TabsList className="flex-1 w-full">
              <TabsTrigger value="logs">Daily Logs</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="traveling">Traveling</TabsTrigger>
              <TabsTrigger value="employees">Employees</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="enhanced-customers">Customers Database</TabsTrigger>
            </TabsList>

            <AdvancedFilters
              onFiltersChange={handleFiltersChange}
              customers={roleFilteredCustomers}
              logs={roleFilteredLogs}
            />
          </div>

          <TabsContent value="dashboard" className="space-y-6">
            <AdminDashboard customers={customers} logs={logs} users={users} />
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <DashboardCharts customers={customers} logs={logs} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Customer Management</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No customers yet</h3>
                    <p className="text-muted-foreground mb-6">Add your first customer to get started</p>
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

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity Logs</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No activity logs yet</h3>
                    <p className="text-muted-foreground mb-6">Start logging customer interactions</p>
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

          <TabsContent value="traveling">
            <Card>
              <CardHeader>
                <CardTitle>Traveling Customers</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Customers who are currently traveling
                </p>
              </CardHeader>
              <CardContent>
                {travelingCustomers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No customers traveling</h3>
                    <p className="text-muted-foreground mb-6">Mark customers as traveling to see them here</p>
                  </div>
                ) : (
                  <CustomerList
                    customers={travelingCustomers}
                    onUpdate={handleSaveCustomer}
                    onDelete={handleDeleteCustomer}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees">
            <EmployeeManagement logs={logs} />
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <DashboardCharts customers={customers} logs={logs} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enhanced-customers">
            <Card>
              <CardHeader>
                <CardTitle>Travel Agency Customer Management</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Comprehensive customer profiles with travel documents, preferences, and trip history
                </p>
              </CardHeader>
              <CardContent>
                {roleFilteredCustomers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No customers yet</h3>
                    <p className="text-muted-foreground mb-6">Add your first customer to get started</p>
                    <CustomerForm
                      onSuccess={handleSaveCustomer}
                      trigger={
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Travel Customer
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <CustomerList
                    customers={roleFilteredCustomers}
                    onUpdate={handleSaveCustomer}
                    onDelete={handleDeleteCustomer}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
