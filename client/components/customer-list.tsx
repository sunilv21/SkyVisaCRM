"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MoreVertical, Edit, Trash2, Mail, Phone, Eye, LayoutGrid, List, UserPlus, FileText, Filter } from "lucide-react"
import type { Customer } from "@/lib/types"
import { CustomerForm } from "./customer-form"
import { CustomerDetailDialog } from "./customer-detail-dialog"
import { DailyLogForm } from "./daily-log-form"
import { formatDate } from "@/lib/storage"
import { authService } from "@/lib/auth"
import { useEffect } from "react"
import type { DailyLog } from "@/lib/types"

interface CustomerListProps {
  customers: Customer[]
  onUpdate: () => void
  onDelete: (id: string) => void
  readOnly?: boolean
}

export function CustomerList({ customers, onUpdate, onDelete, readOnly = false }: CustomerListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [employees, setEmployees] = useState<any[]>([])
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterDateFrom, setFilterDateFrom] = useState<string>("")
  const [filterDateTo, setFilterDateTo] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)

  console.log("CustomerList received customers:", customers.length)

  // Load employees
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const users = await authService.getAllUsers()
        const employeeUsers = users.filter((user: any) => user.role === "employee")
        setEmployees(employeeUsers)
      } catch (error) {
        console.error("Failed to load employees:", error)
      }
    }
    void loadEmployees()
  }, [])

  const handleAssignEmployee = async (customerId: string, employeeId: string) => {
    try {
      const customer = customers.find(c => c.id === customerId)
      if (!customer) return

      const employee = employees.find(e => e.id === employeeId)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const authSession = localStorage.getItem("crm_auth_session")
      const token = authSession ? JSON.parse(authSession).token : null

      const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          ...customer, 
          assignedEmployeeId: employeeId,
          assignedEmployeeName: employee?.name || ""
        })
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error("Failed to assign employee:", error)
    }
  }

  const handleStatusChange = async (customerId: string, newStatus: "prospect" | "active" | "Dead" | "completed") => {
    try {
      const customer = customers.find(c => c.id === customerId)
      if (!customer) return

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const authSession = localStorage.getItem("crm_auth_session")
      const token = authSession ? JSON.parse(authSession).token : null

      const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...customer, status: newStatus })
      })

      if (response.ok) {
        onUpdate() // Reload the customer list
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  const handleTravelingToggle = async (customerId: string, isTravelling: boolean) => {
    try {
      const customer = customers.find(c => c.id === customerId)
      if (!customer) return

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const authSession = localStorage.getItem("crm_auth_session")
      const token = authSession ? JSON.parse(authSession).token : null

      const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          ...customer, 
          isTravelling,
          travellingStartDate: isTravelling ? new Date().toISOString().split('T')[0] : ""
        })
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error("Failed to update traveling status:", error)
    }
  }

  const filteredCustomers = customers.filter(
    (customer) => {
      // Search filter
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.countryCode && customer.countryCode.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Status filter
      const matchesStatus = filterStatus === "all" || customer.status === filterStatus;
      
      // Date filter
      let matchesDate = true;
      if (filterDateFrom || filterDateTo) {
        const customerDate = new Date(customer.createdAt);
        if (filterDateFrom) {
          matchesDate = matchesDate && customerDate >= new Date(filterDateFrom);
        }
        if (filterDateTo) {
          matchesDate = matchesDate && customerDate <= new Date(filterDateTo);
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    }
  )
  
  console.log("Filtered customers:", filteredCustomers.length)

  const handleSaveLog = async (log: DailyLog) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const authSession = localStorage.getItem("crm_auth_session")
      const token = authSession ? JSON.parse(authSession).token : null

      console.log("Saving log for customer:", log.customerId, "Log data:", log)

      const response = await fetch(`${API_BASE_URL}/customers/${log.customerId}/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          note: log.description,
          type: log.type,
          subject: log.subject,
          outcome: log.outcome,
          followUpRequired: log.followUpRequired,
          followUpDate: log.followUpDate,
          duration: log.duration
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Failed to save log:", errorData)
        throw new Error(errorData.message || "Failed to save log")
      }

      const result = await response.json()
      console.log("Log saved successfully:", result)
      
      // Refresh the customer list to show updated data
      onUpdate()
    } catch (error) {
      console.error("Failed to save log:", error)
      alert("Failed to save log. Please try again.")
      throw error
    }
  }

  const getStatusColor = (status: Customer["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Dead":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "prospect":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "completed":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Add */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers (name, email, phone, destination)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {/* Filter Toggle */}
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            {/* View Toggle */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <CustomerForm onSuccess={onUpdate} />
          </div>
        </div>
        
        {/* Filters Panel */}
        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="Dead">Dead</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date From</label>
                  <Input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date To</label>
                  <Input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterStatus("all")
                    setFilterDateFrom("")
                    setFilterDateTo("")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Customer Display */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-lg mb-2">{searchTerm ? "No customers found" : "No customers yet"}</div>
          <p className="mb-4">
            {searchTerm ? "Try adjusting your search terms" : "Add your first customer to get started"}
          </p>
          {!searchTerm && <CustomerForm onSuccess={onUpdate} />}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow overflow-visible">
              <CardHeader className="pb-3 overflow-visible">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                    {customer.company && <p className="text-sm text-muted-foreground">{customer.company}</p>}
                    {customer.destination && (
                      <p className="text-xs text-blue-600 font-medium">
                        📍 {customer.destination}
                        {customer.purpose && ` • ${customer.purpose}`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" sideOffset={5} className="z-[100] bg-white dark:bg-gray-800">
                        <CustomerForm
                          customer={customer}
                          onSuccess={onUpdate}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Profile
                            </DropdownMenuItem>
                          }
                        />
                        {!readOnly && (
                          <>
                            <DropdownMenuItem
                              onClick={() => onDelete(customer.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Customer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(customer.id, "prospect")}>
                              Set as Prospect
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(customer.id, "active")}>
                              Set as Active
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(customer.id, "Dead")}>
                              Set as Dead
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(customer.id, "completed")}>
                              Set as Completed
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${customer.email}`} className="text-accent hover:underline">
                    {customer.email}
                  </a>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${customer.phone}`} className="text-accent hover:underline">
                      {customer.phone}
                    </a>
                  </div>
                )}
                <div className="pt-2 border-t space-y-2">
                  <p className="text-xs text-muted-foreground">Added {formatDate(customer.createdAt)}</p>
                  {customer.groupTravelers && customer.groupTravelers.length > 0 && (
                    <p className="text-xs font-medium text-purple-600">
                      👥 {customer.groupTravelers.length + 1} Travelers
                    </p>
                  )}
                  
                  {/* Quick Actions */}
                  <div className="space-y-2">
                    {readOnly ? (
                      <>
                        {/* Read-only Assigned Employee */}
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Assigned to:</label>
                          <p className="text-sm font-medium">
                            {customer.assignedEmployeeName || "Unassigned"}
                          </p>
                        </div>

                        {/* Read-only Status */}
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Status:</label>
                          <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
                        </div>

                        {/* Read-only Traveling Status */}
                        {customer.isTravelling && (
                          <div className="pt-2 border-t">
                            <p className="text-xs font-medium">Currently Traveling</p>
                            {customer.travellingStartDate && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Since: {new Date(customer.travellingStartDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Assign Employee */}
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Assign to:</label>
                          <Select
                            value={customer.assignedEmployeeId || "unassigned"}
                            onValueChange={(value) => handleAssignEmployee(customer.id, value)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              {employees.map((emp) => (
                                <SelectItem key={emp.id} value={emp.id}>
                                  {emp.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Change Status */}
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Status:</label>
                          <Select
                            value={customer.status}
                            onValueChange={(value: any) => handleStatusChange(customer.id, value)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="prospect">Prospect</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="Dead">Dead</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Traveling Status */}
                        <div className="pt-2 border-t">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={customer.isTravelling || false}
                              onChange={(e) => handleTravelingToggle(customer.id, e.target.checked)}
                              className="w-4 h-4"
                            />
                            <span className="text-xs font-medium">Currently Traveling</span>
                          </label>
                          {customer.isTravelling && customer.travellingStartDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Since: {new Date(customer.travellingStartDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <CustomerDetailDialog
                    customer={customer}
                    onUpdate={onUpdate}
                    trigger={
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    }
                  />
                  {!readOnly && (
                    <DailyLogForm
                      customers={[customer]}
                      onSave={handleSaveLog}
                      trigger={(
                        <Button variant="default" size="sm" className="w-full">
                          <FileText className="h-4 w-4 mr-2" />
                          Add Log
                        </Button>
                      )}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>{readOnly ? "Assigned Employee" : "Assign Employee"}</TableHead>
                  <TableHead>{readOnly ? "Status" : "Change Status"}</TableHead>
                  <TableHead className="text-center">Profile</TableHead>
                  {!readOnly && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        {customer.company && <p className="text-xs text-muted-foreground">{customer.company}</p>}
                        {customer.destination && (
                          <p className="text-xs text-blue-600 font-medium mt-1">
                            📍 {customer.destination}
                            {customer.purpose && ` • ${customer.purpose}`}
                          </p>
                        )}
                        {customer.groupTravelers && customer.groupTravelers.length > 0 && (
                          <p className="text-xs font-medium text-purple-600 mt-1">
                            👥 {customer.groupTravelers.length + 1} Travelers
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{customer.email}</span>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {readOnly ? (
                        <span className="text-sm">{customer.assignedEmployeeName || "Unassigned"}</span>
                      ) : (
                        <Select
                          value={customer.assignedEmployeeId || "unassigned"}
                          onValueChange={(value) => handleAssignEmployee(customer.id, value)}
                        >
                          <SelectTrigger className="h-8 w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {employees.map((emp) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      {readOnly ? (
                        <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
                      ) : (
                        <Select
                          value={customer.status}
                          onValueChange={(value: any) => handleStatusChange(customer.id, value)}
                        >
                          <SelectTrigger className="h-8 w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="prospect">
                              <Badge className="bg-blue-100 text-blue-800">Prospect</Badge>
                            </SelectItem>
                            <SelectItem value="active">
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            </SelectItem>
                            <SelectItem value="Dead">
                              <Badge className="bg-red-100 text-red-800">Dead</Badge>
                            </SelectItem>
                            <SelectItem value="completed">
                              <Badge className="bg-purple-100 text-purple-800">Completed</Badge>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-2 justify-center">
                        <CustomerDetailDialog
                          customer={customer}
                          onUpdate={onUpdate}
                          trigger={(
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          )}
                        />
                        {!readOnly && (
                          <DailyLogForm
                            customers={[customer]}
                            onSave={handleSaveLog}
                            trigger={(
                              <Button variant="default" size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                Log
                              </Button>
                            )}
                          />
                        )}
                      </div>
                    </TableCell>
                    {!readOnly && <TableCell className="text-right">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={5} className="z-[100] bg-white dark:bg-gray-800">
                          <CustomerForm
                            customer={customer}
                            onSuccess={onUpdate}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Profile
                              </DropdownMenuItem>
                            }
                          />
                          <DropdownMenuItem
                            onClick={() => onDelete(customer.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(customer.id, "prospect")}>
                            Set as Prospect
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(customer.id, "active")}>
                            Set as Active
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(customer.id, "Dead")}>
                            Set as Dead
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(customer.id, "completed")}>
                            Set as Completed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
