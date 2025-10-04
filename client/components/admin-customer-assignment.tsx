"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Search, UserCheck, AlertCircle } from "lucide-react"
import type { EnhancedCustomer } from "@/lib/types"
import { EMPLOYEES } from "@/lib/employees"

interface AdminCustomerAssignmentProps {
  customers: EnhancedCustomer[]
  onUpdateCustomer: (customer: EnhancedCustomer) => void
}

export function AdminCustomerAssignment({ customers, onUpdateCustomer }: AdminCustomerAssignmentProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEmployee, setFilterEmployee] = useState<string>("all")

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEmployee =
      filterEmployee === "all" ||
      (filterEmployee === "unassigned" && customer.assignedEmployeeId === "unassigned") ||
      customer.assignedEmployeeId === filterEmployee
    return matchesSearch && matchesEmployee
  })

  const handleAssignEmployee = (customer: EnhancedCustomer, employeeId: string) => {
    const employee = EMPLOYEES.find((emp) => emp.id === employeeId)
    const updatedCustomer = {
      ...customer,
      assignedEmployeeId: employeeId,
      assignedEmployeeName: employee?.name || "",
    }
    onUpdateCustomer(updatedCustomer)
  }

  const unassignedCount = customers.filter((c) => c.assignedEmployeeId === "unassigned").length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Assignment Management
          </CardTitle>
          <CardDescription>Assign customers to employees and manage customer-employee relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search Customers</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Label htmlFor="filter">Filter by Employee</Label>
              <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="unassigned">Unassigned ({unassignedCount})</SelectItem>
                  {EMPLOYEES.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} - {employee.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {unassignedCount > 0 && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800">
                {unassignedCount} customer{unassignedCount > 1 ? "s" : ""} need{unassignedCount === 1 ? "s" : ""} to be
                assigned to an employee
              </span>
            </div>
          )}

          <div className="space-y-3">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="font-medium">{customer.name}</h4>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                      {customer.company && <p className="text-xs text-muted-foreground">{customer.company}</p>}
                    </div>
                    <Badge variant={customer.status === "active" ? "default" : "secondary"}>{customer.status}</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    {customer.assignedEmployeeId === "unassigned" ? (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        Unassigned
                      </Badge>
                    ) : (
                      <div className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3 text-green-600" />
                        <span className="text-sm font-medium">{customer.assignedEmployeeName}</span>
                      </div>
                    )}
                  </div>

                  <Select
                    value={customer.assignedEmployeeId}
                    onValueChange={(value) => handleAssignEmployee(customer, value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Assign employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {EMPLOYEES.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} - {employee.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No customers found matching your criteria</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
