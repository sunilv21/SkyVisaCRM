"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plane, MapPin, Calendar, User, Phone, Mail, X, Eye, CheckCircle } from "lucide-react"
import type { Customer } from "@/lib/types"
import { CustomerProfileModal } from "./customer-profile-modal"

interface TravellingCustomersViewProps {
  customers: Customer[]
  onUpdate: () => void
}

export function TravellingCustomersView({ customers, onUpdate }: TravellingCustomersViewProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  const travellingCustomers = customers.filter((c) => c.isTravelling)

  const handleMarkAsTravelled = async (customer: Customer) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const authSession = localStorage.getItem("crm_auth_session")
      const token = authSession ? JSON.parse(authSession).token : null

      const response = await fetch(`${API_BASE_URL}/customers/${customer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...customer,
          isTravelling: false,
          travellingStartDate: undefined,
          status: "active" // Set to active after travel
        })
      })

      if (response.ok) {
        onUpdate() // Reload customer list
      }
    } catch (error) {
      console.error("Failed to mark as travelled:", error)
    }
  }

  const handleRemoveFromTravelling = async (customer: Customer) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const authSession = localStorage.getItem("crm_auth_session")
      const token = authSession ? JSON.parse(authSession).token : null

      const response = await fetch(`${API_BASE_URL}/customers/${customer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...customer,
          isTravelling: false,
          travellingStartDate: undefined,
        })
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error("Failed to remove from travelling:", error)
    }
  }

  const handleViewProfile = (customer: Customer) => {
    setSelectedCustomer(customer)
    setProfileModalOpen(true)
  }

  const getDaysInTravel = (startDate?: string) => {
    if (!startDate) return 0
    const start = new Date(startDate)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Plane className="h-6 w-6 text-purple-600" />
            Travelling Customers
          </h2>
          <p className="text-muted-foreground">Customers currently on their trips</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {travellingCustomers.length} Active
        </Badge>
      </div>

      {/* Travelling Customers Grid */}
      {travellingCustomers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Plane className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No customers travelling</h3>
            <p className="text-muted-foreground">
              Mark customers as travelling from the Customer Database to track their active trips
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {travellingCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {customer.name}
                      <Badge className="bg-purple-600 hover:bg-purple-700">
                        <Plane className="h-3 w-3 mr-1" />
                        Travelling
                      </Badge>
                    </CardTitle>
                    {customer.travellingStartDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Day {getDaysInTravel(customer.travellingStartDate)} of trip
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFromTravelling(customer)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Destination</p>
                    <p className="font-medium">{customer.destination || "Not specified"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Travel Period</p>
                    <p className="font-medium">
                      {customer.travelFrom && customer.travelTo
                        ? `${new Date(customer.travelFrom).toLocaleDateString()} - ${new Date(customer.travelTo).toLocaleDateString()}`
                        : "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Travel Type</p>
                    <p className="font-medium capitalize">{customer.travelType || "Standard"}</p>
                  </div>
                </div>

                <div className="pt-2 border-t space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <a href={`mailto:${customer.email}`} className="text-xs hover:underline">
                      {customer.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <a href={`tel:${customer.phone}`} className="text-xs hover:underline">
                      {customer.countryCode ? `+${customer.countryCode} ` : ""}
                      {customer.phone}
                    </a>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewProfile(customer)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Profile
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleMarkAsTravelled(customer)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark as Travelled
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Customer Profile Modal */}
      <CustomerProfileModal 
        customer={selectedCustomer} 
        open={profileModalOpen} 
        onOpenChange={setProfileModalOpen}
        onUpdate={onUpdate}
      />
    </div>
  )
}
