"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Plus, MoreHorizontal, Edit, Trash2, UserCheck, UserX, Mail, Building } from "lucide-react"
import type { User, DailyLog } from "@/lib/types"
import { authService } from "@/lib/auth"

interface EmployeeManagementProps {
  logs: DailyLog[]
}

export function EmployeeManagement({ logs }: EmployeeManagementProps) {
  const [employees, setEmployees] = useState<User[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee" as "admin" | "employee",
    department: "",
    isActive: true,
  })

  const loadEmployees = async () => {
    try {
      console.log("Loading employees...")
      const allUsers = await authService.getAllUsers()
      console.log("Loaded employees:", allUsers.length)
      setEmployees(allUsers)
    } catch (err) {
      console.error("Failed to load employees:", err)
      setError("Failed to load employees")
    }
  }

  useEffect(() => {
    void loadEmployees()
  }, [])

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "employee",
      department: "",
      isActive: true,
    })
    setError("")
    setSuccess("")
  }

  const handleAddEmployee = async () => {
    try {
      setError("")

      if (!formData.name || !formData.email || !formData.password) {
        setError("Please fill in all required fields")
        return
      }

      // Check if email already exists
      if (employees.some((emp) => emp.email === formData.email)) {
        setError("An employee with this email already exists")
        return
      }

      console.log("Adding employee:", formData)
      await authService.addUser(formData)
      setSuccess("Employee added successfully")
      await loadEmployees()
      resetForm()
      setIsAddDialogOpen(false)
    } catch (err) {
      console.error("Add employee error:", err)
      setError("Failed to add employee")
    }
  }

  const handleEditEmployee = async () => {
    try {
      setError("")

      if (!selectedEmployee || !formData.name || !formData.email) {
        setError("Please fill in all required fields")
        return
      }

      // Check if email already exists (excluding current employee)
      if (employees.some((emp) => emp.email === formData.email && emp.id !== selectedEmployee.id)) {
        setError("An employee with this email already exists")
        return
      }

      const updateData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        isActive: formData.isActive,
      }
      
      // Only include password if provided
      if (formData.password) {
        updateData.password = formData.password
      }

      await authService.updateUser(selectedEmployee.id, updateData)
      setSuccess("Employee updated successfully")
      await loadEmployees()
      resetForm()
      setIsEditDialogOpen(false)
      setSelectedEmployee(null)
    } catch (err) {
      console.error("Update employee error:", err)
      setError("Failed to update employee")
    }
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
      return
    }

    try {
      console.log("Deleting employee:", employeeId)
      await authService.deleteUser(employeeId)
      setSuccess("Employee deleted successfully")
      await loadEmployees()
    } catch (err) {
      console.error("Delete employee error:", err)
      setError("Failed to delete employee")
    }
  }

  const handleToggleActive = async (employee: User) => {
    try {
      console.log("Toggling active status for:", employee.id)
      await authService.updateUser(employee.id, { isActive: !employee.isActive })
      setSuccess(`Employee ${employee.isActive ? "deactivated" : "activated"} successfully`)
      await loadEmployees()
    } catch (err) {
      console.error("Toggle active error:", err)
      setError("Failed to update employee status")
    }
  }

  const openEditDialog = (employee: User) => {
    setSelectedEmployee(employee)
    setFormData({
      name: employee.name,
      email: employee.email,
      password: "",
      role: employee.role,
      department: employee.department || "",
      isActive: employee.isActive,
    })
    setIsEditDialogOpen(true)
  }

  const getEmployeeStats = (employeeId: string) => {
    const employeeLogs = logs.filter((log) => log.employeeId === employeeId)
    const positiveOutcomes = employeeLogs.filter((log) => log.outcome === "positive").length
    const today = new Date().toISOString().split("T")[0]
    const todayLogs = employeeLogs.filter((log) => log.date === today).length

    return {
      totalLogs: employeeLogs.length,
      positiveOutcomes,
      successRate: employeeLogs.length > 0 ? Math.round((positiveOutcomes / employeeLogs.length) * 100) : 0,
      todayLogs,
    }
  }

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.department || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Separate employees and admins
  const admins = filteredEmployees.filter((emp) => emp.role === "admin")
  const regularEmployees = filteredEmployees.filter((emp) => emp.role === "employee")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Employee Management</h2>
          <p className="text-muted-foreground">Manage employee and admin accounts</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>Create a new employee account with system access.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@company.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "admin" | "employee") => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Sales, Marketing, Support, etc."
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEmployee} className="bg-purple-600 hover:bg-purple-700 text-white">
                Add Employee
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search employees by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md text-center"
          />
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Admins Section */}
      {admins.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Administrators</h3>
            <Badge variant="default">{admins.length}</Badge>
          </div>
          <div className="grid gap-4">
            {admins.map((employee) => {
              const stats = getEmployeeStats(employee.id)
              return (
                <Card key={employee.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-purple-100 p-3 rounded-full">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{employee.name}</h3>
                            <Badge variant="default">{employee.role}</Badge>
                            <Badge variant={employee.isActive ? "default" : "destructive"}>
                              {employee.isActive ? "Active" : "Dead"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {employee.email}
                            </span>
                            {employee.department && (
                              <span className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {employee.department}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Performance Stats */}
                        <div className="text-right">
                          <div className="text-sm font-medium">{stats.totalLogs} logs</div>
                          <div className="text-xs text-muted-foreground">{stats.successRate}% success rate</div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-medium">{stats.todayLogs} today</div>
                          <div className="text-xs text-muted-foreground">{stats.positiveOutcomes} positive</div>
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(employee)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(employee)}>
                              {employee.isActive ? (
                                <>
                                  <UserX className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteEmployee(employee.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Employees Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Employees</h3>
          <Badge variant="secondary">{regularEmployees.length}</Badge>
        </div>
        {regularEmployees.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No employees found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? "No employees match your search criteria" : "Add your first employee to get started"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {regularEmployees.map((employee) => {
            const stats = getEmployeeStats(employee.id)
            return (
              <Card key={employee.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-100 p-3 rounded-full">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{employee.name}</h3>
                          <Badge variant={employee.role === "admin" ? "default" : "secondary"}>{employee.role}</Badge>
                          <Badge variant={employee.isActive ? "default" : "destructive"}>
                            {employee.isActive ? "Active" : "Dead"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {employee.email}
                          </span>
                          {employee.department && (
                            <span className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {employee.department}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Performance Stats */}
                      <div className="text-right">
                        <div className="text-sm font-medium">{stats.totalLogs} logs</div>
                        <div className="text-xs text-muted-foreground">{stats.successRate}% success rate</div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-medium">{stats.todayLogs} today</div>
                        <div className="text-xs text-muted-foreground">{stats.positiveOutcomes} positive</div>
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(employee)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Employee
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(employee)}>
                            {employee.isActive ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Employee
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          </div>
        )}
      </div>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update employee information and permissions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-password">New Password (optional)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave blank to keep current password"
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "admin" | "employee") => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-department">Department</Label>
              <Input
                id="edit-department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-active"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <Label htmlFor="edit-active">Active Employee</Label>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditEmployee} className="bg-purple-600 hover:bg-purple-700 text-white">
              Update Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
