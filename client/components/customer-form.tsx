"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Save, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Customer } from "@/lib/types"
import { authService } from "@/lib/auth"
import { useAuth } from "@/components/auth-provider"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface CustomerFormProps {
  customer?: Customer
  trigger?: React.ReactNode
  onSuccess?: () => void // callback after saving
}

export function CustomerForm({ customer, trigger, onSuccess }: CustomerFormProps) {
  const [open, setOpen] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const { user } = useAuth() // Get logged-in user

  // Load employees when component mounts
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const users = await authService.getAllUsers()
        // Filter to only show employees (not admins)
        const employeeUsers = users.filter((user: any) => user.role === "employee")
        setEmployees(employeeUsers)
      } catch (error) {
        console.error("Failed to load employees:", error)
      }
    }
    void loadEmployees()
  }, [])

  const [formData, setFormData] = useState<Partial<Customer>>({
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    countryCode: customer?.countryCode || "",
    company: customer?.company || "",
    status: customer?.status || "prospect",
    // Auto-assign to logged-in employee if they're an employee and creating new customer
    assignedEmployeeId: customer?.assignedEmployeeId || (user?.role === "employee" && !customer ? user.id : "unassigned"),
    assignedEmployeeName: customer?.assignedEmployeeName || (user?.role === "employee" && !customer ? user.name : ""),
    dob: customer?.dob || "",
    gender: customer?.gender || "",
    nationality: customer?.nationality || "",
    destination: customer?.destination || "",
    purpose: customer?.purpose || "",
    travelFrom: customer?.travelFrom || "",
    travelTo: customer?.travelTo || "",
    budget: customer?.budget || "",
    travelType: customer?.travelType || "",
    hotel: customer?.hotel || "",
    service: customer?.service || "",
    insurance: customer?.insurance || false,
    pickup: customer?.pickup || false,
    tours: customer?.tours || false,
    previousVisits: customer?.previousVisits || "",
    isTravelling: customer?.isTravelling || false,
    travellingStartDate: customer?.travellingStartDate || "",
    groupTravelers: customer?.groupTravelers || [],
  })
  const [newTravelerName, setNewTravelerName] = useState("")
  const [validationError, setValidationError] = useState("")

  // Save customer to API
  const handleSave = async (customerData: Partial<Customer>) => {
    try {
      // Get auth token from localStorage
      const authSession = localStorage.getItem("crm_auth_session")
      const token = authSession ? JSON.parse(authSession).token : null

      if (customer?.id) {
        // update existing
        await fetch(`${API_BASE_URL}/customers/${customer.id}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(customerData),
        })
      } else {
        // create new
        await fetch(`${API_BASE_URL}/customers`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(customerData),
        })
      }

      if (onSuccess) onSuccess()
      setOpen(false)

      if (!customer) {
        // reset form if adding new
        setFormData({
          name: "",
          email: "",
          phone: "",
          countryCode: "",
          company: "",
          status: "prospect",
          assignedEmployeeId: "unassigned",
          assignedEmployeeName: "",
          dob: "",
          gender: "",
          nationality: "",
          destination: "",
          purpose: "",
          travelFrom: "",
          travelTo: "",
          budget: "",
          travelType: "",
          hotel: "",
          service: "",
          insurance: false,
          pickup: false,
          tours: false,
          previousVisits: "",
          isTravelling: false,
          travellingStartDate: "",
          groupTravelers: [],
        })
      }
    } catch (error) {
      console.error("❌ Failed to save customer:", error)
    }
  }

  const handleAddTraveler = () => {
    if (newTravelerName.trim()) {
      setFormData({
        ...formData,
        groupTravelers: [...(formData.groupTravelers || []), newTravelerName.trim()]
      })
      setNewTravelerName("")
    }
  }

  const handleRemoveTraveler = (index: number) => {
    setFormData({
      ...formData,
      groupTravelers: formData.groupTravelers?.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) return

    // Check for duplicate email/phone
    try {
      const authSession = localStorage.getItem("crm_auth_session")
      const token = authSession ? JSON.parse(authSession).token : null
      
      const response = await fetch(`${API_BASE_URL}/customers`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const allCustomers = await response.json()
      
      // Check for duplicates (exclude current customer if editing)
      const duplicate = allCustomers.find((c: Customer) => 
        c.id !== customer?.id && (
          c.email.toLowerCase() === formData.email?.toLowerCase() ||
          (formData.phone && c.phone === formData.phone && c.countryCode === formData.countryCode)
        )
      )
      
      if (duplicate) {
        if (duplicate.email.toLowerCase() === formData.email?.toLowerCase()) {
          setValidationError("This email is already registered")
        } else {
          setValidationError("This phone number is already registered")
        }
        return
      }
      setValidationError("")
    } catch (error) {
      console.error("Error checking duplicates:", error)
    }

    const now = new Date().toISOString()
    const customerData: Partial<Customer> = {
      ...formData,
      createdAt: customer?.createdAt || now,
      lastContact: customer?.lastContact || now,
    }

    if (customer?.id) {
      customerData.id = customer.id
    }

    handleSave(customerData as Customer)
  }

  const handleEmployeeChange = (employeeId: string) => {
    const employee = employees.find((emp: any) => emp.id === employeeId)
    setFormData({
      ...formData,
      assignedEmployeeId: employeeId,
      assignedEmployeeName: employee?.name || "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) {
        setValidationError("")
      }
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-accent hover:bg-accent/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">{customer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
        </DialogHeader>
        {validationError && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {validationError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                const value = e.target.value
                if (/^[a-zA-Z\s]*$/.test(value)) {
                  setFormData({ ...formData, name: value })
                }
              }}
              required
            />
          </div>

          {/* Email + Phone */}
          <div className="flex gap-6">
            <div className="space-y-2 flex-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2 flex-1">
              <div className="space-y-2 w-1/3">
                <Label htmlFor="countryCode">Code *</Label>
                <Input
                  id="countryCode"
                  type="text"
                  value={formData.countryCode}
                  onChange={(e) => {
                    const value = e.target.value
                    if (/^\d{0,3}$/.test(value)) {
                      setFormData({ ...formData, countryCode: value })
                    }
                  }}
                  placeholder="91"
                  required
                />
              </div>

              <div className="space-y-2 flex-1">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value
                    if (/^\d{0,10}$/.test(value)) {
                      setFormData({ ...formData, phone: value })
                    }
                  }}
                  placeholder="9876543210"
                  required
                />
              </div>
            </div>
          </div>

          {/* DOB + Gender */}
          <div className="flex gap-6">
            <div className="space-y-2 flex-1">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
              />
            </div>

            <div className="space-y-2 flex-1">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(val) => setFormData({ ...formData, gender: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="na">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Nationality + Destination */}
          <div className="flex gap-6">
            <div className="space-y-2 flex-1">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) =>
                  setFormData({ ...formData, nationality: e.target.value })
                }
              />
            </div>

            <div className="space-y-2 flex-1">
              <Label htmlFor="destination">Preferred Destination(s)</Label>
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e) =>
                  setFormData({ ...formData, destination: e.target.value })
                }
              />
            </div>
          </div>

          {/* Purpose + Travel Type */}
          <div className="flex gap-6">
            <div className="space-y-2 flex-1">
              <Label htmlFor="purpose">Travel Purpose</Label>
              <Select
                value={formData.purpose}
                onValueChange={(val) => setFormData({ ...formData, purpose: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tourism">Tourism</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="transit">Transit</SelectItem>
                  <SelectItem value="visit">Visit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex-1">
              <Label htmlFor="travelType">Travel Type</Label>
              <Select
                value={formData.travelType}
                onValueChange={(val) =>
                  setFormData({ ...formData, travelType: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solo">Solo</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Travel Dates */}
          <div className="space-y-2">
            <Label>Preferred Travel Dates</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={formData.travelFrom}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  setFormData({ ...formData, travelFrom: e.target.value })
                }
              />
              <Input
                type="date"
                value={formData.travelTo}
                min={formData.travelFrom || new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  setFormData({ ...formData, travelTo: e.target.value })
                }
              />
            </div>
          </div>

          {/* Budget + Hotel */}
          <div className="flex gap-6">
            <div className="space-y-2 w-1/3">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                type="number"
                placeholder="Enter budget"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
              />
            </div>

            <div className="space-y-2 w-2/3">
              <Label htmlFor="hotel">Hotel Preference</Label>
              <Select
                value={formData.hotel}
                onValueChange={(val) => setFormData({ ...formData, hotel: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hotel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-2">
            <Label>Services</Label>
            <div className="flex flex-col gap-1">
              <label className="flex gap-2 items-stretch justify-start mx-0">
                <input
                  type="checkbox"
                  checked={formData.service === "visa"}
                  onChange={() =>
                    setFormData({ ...formData, service: "visa" })
                  }
                />
                Visa
              </label>
              <label className="flex items-center gap-2 text-center">
                <input
                  type="checkbox"
                  checked={formData.service === "fullPackage"}
                  onChange={() =>
                    setFormData({ ...formData, service: "fullPackage" })
                  }
                />
                Full Package With Visa
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.service === "packageOnly"}
                  onChange={() =>
                    setFormData({ ...formData, service: "packageOnly" })
                  }
                />
                Package Only
              </label>
            </div>
          </div>

          {/* Additional Services */}
          <div className="space-y-2">
            <Label>Additional Services</Label>
            <div className="flex flex-col gap-1">
              <label>
                <input
                  type="checkbox"
                  checked={formData.insurance}
                  onChange={(e) =>
                    setFormData({ ...formData, insurance: e.target.checked })
                  }
                />{" "}
                Travel Insurance
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formData.pickup}
                  onChange={(e) =>
                    setFormData({ ...formData, pickup: e.target.checked })
                  }
                />{" "}
                Airport Pickup
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formData.tours}
                  onChange={(e) =>
                    setFormData({ ...formData, tours: e.target.checked })
                  }
                />{" "}
                Local Tours
              </label>
            </div>
          </div>

          {/* Previous Visits */}
          <div className="space-y-2">
            <Label htmlFor="previousVisits">Previous Visits</Label>
            <textarea
              id="previousVisits"
              className="w-full rounded-md border px-3 py-2"
              value={formData.previousVisits}
              onChange={(e) =>
                setFormData({ ...formData, previousVisits: e.target.value })
              }
              placeholder="List previous countries & years visited..."
            />
          </div>

          {/* Group Travelers */}
          <div className="space-y-2 border-t pt-4">
            <Label className="text-base font-semibold">Group Travelers</Label>
            <p className="text-xs text-muted-foreground">Add additional travelers for group bookings</p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter traveler name"
                value={newTravelerName}
                onChange={(e) => setNewTravelerName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTraveler()
                  }
                }}
              />
              <Button type="button" onClick={handleAddTraveler} variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            {formData.groupTravelers && formData.groupTravelers.length > 0 && (
              <div className="space-y-1 mt-2">
                <p className="text-xs text-muted-foreground">
                  Total travelers: {(formData.groupTravelers.length + 1)} (including main customer)
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.groupTravelers.map((traveler, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {traveler}
                      <button
                        type="button"
                        onClick={() => handleRemoveTraveler(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Traveling Status */}
          <div className="space-y-2 border-t pt-4">
            <Label className="text-base font-semibold">Traveling Status</Label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isTravelling}
                  onChange={(e) =>
                    setFormData({ ...formData, isTravelling: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">Customer is currently traveling</span>
              </label>
            </div>
            {formData.isTravelling && (
              <div className="space-y-2 mt-2">
                <Label htmlFor="travellingStartDate">Travel Start Date</Label>
                <Input
                  id="travellingStartDate"
                  type="date"
                  value={formData.travellingStartDate}
                  onChange={(e) =>
                    setFormData({ ...formData, travellingStartDate: e.target.value })
                  }
                />
              </div>
            )}
          </div>

          {/* Status + Assigned Employee */}
          <div className="flex gap-6">
            <div className="flex flex-col gap-2 flex-1">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as Customer["status"] })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="Dead">Dead</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex-1">
              <Label htmlFor="assignedEmployee">
                Assigned Employee
                {user?.role === "employee" && (
                  <span className="text-xs text-muted-foreground ml-2">(Auto-assigned to you)</span>
                )}
              </Label>
              <Select
                value={formData.assignedEmployeeId}
                onValueChange={handleEmployeeChange}
                disabled={user?.role === "employee"} // Employees can't change assignment
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {employees.map((employee: any) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}{employee.department ? ` - ${employee.department}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {customer ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
