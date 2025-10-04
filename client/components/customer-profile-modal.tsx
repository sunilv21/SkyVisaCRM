"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Plane,
  FileText,
  Shield,
  AlertCircle,
  CheckCircle,
  Edit,
  Save,
  X,
} from "lucide-react"
import type { Customer } from "@/lib/types"
import { CustomerForm } from "./customer-form"

interface CustomerProfileModalProps {
  customer: Customer | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: () => void
}

export function CustomerProfileModal({ customer, open, onOpenChange, onUpdate }: CustomerProfileModalProps) {
  const [isEditingDocs, setIsEditingDocs] = useState(false)
  const [editedData, setEditedData] = useState({
    passportNumber: customer?.passportNumber || "",
    passportExpiry: customer?.passportExpiry || "",
    visaStatus: customer?.visaStatus || "",
    previousVisits: customer?.previousVisits || "",
    specialRequirements: customer?.specialRequirements || "",
  })

  if (!customer) return null

  const handleUpdate = () => {
    onOpenChange(false)
    if (onUpdate) onUpdate()
  }

  const handleSaveSection = async () => {
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
          ...editedData
        })
      })

      if (response.ok) {
        setIsEditingDocs(false)
        if (onUpdate) onUpdate()
      }
    } catch (error) {
      console.error("Failed to update customer:", error)
    }
  }

  const handleCancelEdit = () => {
    setEditedData({
      passportNumber: customer?.passportNumber || "",
      passportExpiry: customer?.passportExpiry || "",
      visaStatus: customer?.visaStatus || "",
      previousVisits: customer?.previousVisits || "",
      specialRequirements: customer?.specialRequirements || "",
    })
    setIsEditingDocs(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl flex items-center gap-3">
              <User className="h-6 w-6" />
              Customer Profile
            </DialogTitle>
            <CustomerForm
              customer={customer}
              onSuccess={handleUpdate}
              trigger={
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              }
            />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold">{customer.name}</h2>
              <p className="text-muted-foreground">{customer.email}</p>
            </div>
            <div className="flex gap-2">
              <Badge
                variant={
                  customer.status === "active" ? "default" : customer.status === "Dead" ? "secondary" : "outline"
                }
              >
                {customer.status}
              </Badge>
              {customer.isTravelling && (
                <Badge className="bg-purple-600 hover:bg-purple-700">
                  <Plane className="h-3 w-3 mr-1" />
                  Travelling
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="travel">Travel Details</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="history">Trip History</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">
                        {customer.countryCode ? `+${customer.countryCode} ` : ""}
                        {customer.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">{customer.dob || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Gender</p>
                      <p className="font-medium capitalize">{customer.gender || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nationality</p>
                      <p className="font-medium">{customer.nationality || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Assigned To</p>
                      <p className="font-medium">{customer.assignedEmployeeName || "Unassigned"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Name</p>
                    <p className="font-medium">{customer.emergencyContact || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Phone</p>
                    <p className="font-medium">{customer.emergencyPhone || "Not provided"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Travel Documents & Trip History</CardTitle>
                    {!isEditingDocs && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingDocs(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                    {isEditingDocs && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSaveSection}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!isEditingDocs ? (
                    <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Passport Number</p>
                    <p className="font-medium">{customer.passportNumber || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Passport Expiry</p>
                    <p className="font-medium">{customer.passportExpiry || "Not provided"}</p>
                  </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Visa Status</p>
                        <p className="font-medium">{customer.visaStatus || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Previous Visits</p>
                        <p className="font-medium">{customer.previousVisits || "Not provided"}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Passport Number</label>
                          <Input
                            value={editedData.passportNumber}
                            onChange={(e) => setEditedData({...editedData, passportNumber: e.target.value})}
                            placeholder="Enter passport number"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Passport Expiry</label>
                          <Input
                            type="date"
                            value={editedData.passportExpiry}
                            onChange={(e) => setEditedData({...editedData, passportExpiry: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Visa Status</label>
                          <Input
                            value={editedData.visaStatus}
                            onChange={(e) => setEditedData({...editedData, visaStatus: e.target.value})}
                            placeholder="e.g., Approved, Pending"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Previous Visits</label>
                          <Input
                            value={editedData.previousVisits}
                            onChange={(e) => setEditedData({...editedData, previousVisits: e.target.value})}
                            placeholder="e.g., 3 times"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Bookings & Trip History</label>
                        <Textarea
                          value={editedData.specialRequirements}
                          onChange={(e) => setEditedData({...editedData, specialRequirements: e.target.value})}
                          placeholder="Enter bookings, trip history, special requirements..."
                          rows={4}
                        />
                      </div>
                    </div>
                  )}
                  {!isEditingDocs && customer.specialRequirements && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Bookings & Trip History</p>
                      <p className="font-medium whitespace-pre-wrap">{customer.specialRequirements}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Travel Details Tab */}
            <TabsContent value="travel" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Travel Plans</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Destination</p>
                      <p className="font-medium">{customer.destination || "Not set"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Purpose</p>
                      <p className="font-medium capitalize">{customer.purpose || "Not set"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Travel From</p>
                      <p className="font-medium">
                        {customer.travelFrom ? new Date(customer.travelFrom).toLocaleDateString() : "Not set"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Travel To</p>
                      <p className="font-medium">
                        {customer.travelTo ? new Date(customer.travelTo).toLocaleDateString() : "Not set"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-medium">₹{customer.budget || "Not set"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Travel Type</p>
                      <p className="font-medium capitalize">{customer.travelType || "Not set"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Services & Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Service Package</p>
                    <Badge variant="outline" className="capitalize">
                      {customer.service || "Not selected"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Hotel Preference</p>
                    <Badge variant="outline" className="capitalize">
                      {customer.hotel || "Not selected"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Additional Services</p>
                    <div className="flex flex-wrap gap-2">
                      {customer.insurance && (
                        <Badge variant="secondary">
                          <Shield className="h-3 w-3 mr-1" />
                          Travel Insurance
                        </Badge>
                      )}
                      {customer.pickup && (
                        <Badge variant="secondary">
                          <Plane className="h-3 w-3 mr-1" />
                          Airport Pickup
                        </Badge>
                      )}
                      {customer.tours && (
                        <Badge variant="secondary">
                          <MapPin className="h-3 w-3 mr-1" />
                          Local Tours
                        </Badge>
                      )}
                      {!customer.insurance && !customer.pickup && !customer.tours && (
                        <span className="text-sm text-muted-foreground">No additional services</span>
                      )}
                    </div>
                  </div>
                  {customer.specialRequirements && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Special Requirements</p>
                      <p className="text-sm">{customer.specialRequirements}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {customer.previousVisits && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Previous Visits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{customer.previousVisits}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  {customer.upcomingBookings && customer.upcomingBookings.length > 0 ? (
                    <div className="space-y-3">
                      {customer.upcomingBookings.map((booking) => (
                        <div key={booking.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{booking.destination}</h4>
                              <p className="text-sm text-muted-foreground">{booking.packageType}</p>
                            </div>
                            <Badge
                              variant={
                                booking.status === "confirmed"
                                  ? "default"
                                  : booking.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Start:</span>{" "}
                              {new Date(booking.startDate).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="text-muted-foreground">End:</span>{" "}
                              {new Date(booking.endDate).toLocaleDateString()}
                            </div>
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Amount:</span> ₹{booking.amount.toLocaleString()}
                            </div>
                          </div>
                          {booking.notes && <p className="text-sm text-muted-foreground mt-2">{booking.notes}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No upcoming bookings</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trip History Tab */}
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Past Trips</CardTitle>
                </CardHeader>
                <CardContent>
                  {customer.tripHistory && customer.tripHistory.length > 0 ? (
                    <div className="space-y-3">
                      {customer.tripHistory.map((trip) => (
                        <div key={trip.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{trip.destination}</h4>
                              <p className="text-sm text-muted-foreground capitalize">{trip.purpose}</p>
                            </div>
                            <Badge variant={trip.status === "completed" ? "default" : "secondary"}>
                              {trip.status === "completed" ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <AlertCircle className="h-3 w-3 mr-1" />
                              )}
                              {trip.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Start:</span>{" "}
                              {new Date(trip.startDate).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="text-muted-foreground">End:</span>{" "}
                              {new Date(trip.endDate).toLocaleDateString()}
                            </div>
                          </div>
                          {trip.notes && <p className="text-sm text-muted-foreground mt-2">{trip.notes}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No trip history</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
