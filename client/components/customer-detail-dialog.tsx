"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  User, Mail, Phone, Building, Calendar, MapPin, Plane, 
  DollarSign, Hotel, Shield, Users, FileText, Globe, Edit, Save, X
} from "lucide-react"
import type { Customer } from "@/lib/types"
import { formatDate } from "@/lib/storage"
import { CustomerForm } from "./customer-form"

interface CustomerDetailDialogProps {
  customer: Customer
  trigger: React.ReactNode
  onUpdate?: () => void
}

export function CustomerDetailDialog({ customer, trigger, onUpdate }: CustomerDetailDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditingDocs, setIsEditingDocs] = useState(false)
  const [isEditingTrip, setIsEditingTrip] = useState(false)
  const [editedData, setEditedData] = useState({
    passportNumber: customer.passportNumber || "",
    passportExpiry: customer.passportExpiry || "",
    visaStatus: customer.visaStatus || "",
    previousVisits: customer.previousVisits || "",
    specialRequirements: customer.specialRequirements || "",
  })

  const getStatusColor = (status: Customer["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "Dead":
        return "bg-red-100 text-red-800"
      case "prospect":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleUpdate = () => {
    setIsOpen(false)
    if (onUpdate) onUpdate()
  }

  const handleSaveSection = async (section: "docs" | "trip") => {
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
        if (section === "docs") setIsEditingDocs(false)
        if (section === "trip") setIsEditingTrip(false)
        if (onUpdate) onUpdate()
      }
    } catch (error) {
      console.error("Failed to update customer:", error)
    }
  }

  const handleCancelEdit = (section: "docs" | "trip") => {
    setEditedData({
      passportNumber: customer.passportNumber || "",
      passportExpiry: customer.passportExpiry || "",
      visaStatus: customer.visaStatus || "",
      previousVisits: customer.previousVisits || "",
      specialRequirements: customer.specialRequirements || "",
    })
    if (section === "docs") setIsEditingDocs(false)
    if (section === "trip") setIsEditingTrip(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl flex items-center gap-2">
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
          {/* Basic Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{customer.name}</h3>
                  {customer.company && (
                    <p className="text-muted-foreground flex items-center gap-1 mt-1">
                      <Building className="h-4 w-4" />
                      {customer.company}
                    </p>
                  )}
                </div>
                <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {customer.countryCode && `${customer.countryCode} `}
                      {customer.phone}
                    </span>
                  </div>
                )}
                {customer.assignedEmployeeName && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Assigned to: {customer.assignedEmployeeName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Added: {formatDate(customer.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Group Travelers */}
          {customer.groupTravelers && customer.groupTravelers.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Group Travelers
                </h4>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-purple-900 mb-2">
                    Total Travelers: {customer.groupTravelers.length + 1} (including {customer.name})
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm text-purple-800">• {customer.name} (Main Customer)</p>
                    {customer.groupTravelers.map((traveler, index) => (
                      <p key={index} className="text-sm text-purple-800">• {traveler}</p>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Personal Information */}
          {(customer.dob || customer.gender || customer.nationality) && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {customer.dob && (
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">{customer.dob}</p>
                    </div>
                  )}
                  {customer.gender && (
                    <div>
                      <p className="text-sm text-muted-foreground">Gender</p>
                      <p className="font-medium capitalize">{customer.gender}</p>
                    </div>
                  )}
                  {customer.nationality && (
                    <div>
                      <p className="text-sm text-muted-foreground">Nationality</p>
                      <p className="font-medium">{customer.nationality}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Travel Information */}
          {(customer.destination || customer.purpose || customer.travelFrom || customer.travelTo) && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Travel Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.destination && (
                    <div>
                      <p className="text-sm text-muted-foreground">Destination</p>
                      <p className="font-medium flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {customer.destination}
                      </p>
                    </div>
                  )}
                  {customer.purpose && (
                    <div>
                      <p className="text-sm text-muted-foreground">Purpose</p>
                      <p className="font-medium">{customer.purpose}</p>
                    </div>
                  )}
                  {customer.travelFrom && (
                    <div>
                      <p className="text-sm text-muted-foreground">Travel From</p>
                      <p className="font-medium">{customer.travelFrom}</p>
                    </div>
                  )}
                  {customer.travelTo && (
                    <div>
                      <p className="text-sm text-muted-foreground">Travel To</p>
                      <p className="font-medium">{customer.travelTo}</p>
                    </div>
                  )}
                  {customer.budget && (
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-medium flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {customer.budget}
                      </p>
                    </div>
                  )}
                  {customer.travelType && (
                    <div>
                      <p className="text-sm text-muted-foreground">Travel Type</p>
                      <p className="font-medium">{customer.travelType}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Services */}
          {(customer.hotel || customer.service || customer.insurance || customer.pickup || customer.tours) && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Hotel className="h-5 w-5" />
                  Services & Accommodations
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.hotel && (
                    <div>
                      <p className="text-sm text-muted-foreground">Hotel</p>
                      <p className="font-medium">{customer.hotel}</p>
                    </div>
                  )}
                  {customer.service && (
                    <div>
                      <p className="text-sm text-muted-foreground">Service</p>
                      <p className="font-medium">{customer.service}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-4 mt-3">
                  {customer.insurance && (
                    <Badge variant="secondary">
                      <Shield className="h-3 w-3 mr-1" />
                      Insurance
                    </Badge>
                  )}
                  {customer.pickup && (
                    <Badge variant="secondary">
                      <MapPin className="h-3 w-3 mr-1" />
                      Pickup Service
                    </Badge>
                  )}
                  {customer.tours && (
                    <Badge variant="secondary">
                      <Globe className="h-3 w-3 mr-1" />
                      Tours
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Travel Documents & Trip History */}
          <>
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Travel Documents & Trip History
                </h4>
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
                      onClick={() => handleSaveSection("docs")}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelEdit("docs")}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
              
              {!isEditingDocs ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.previousVisits && (
                    <div>
                      <p className="text-sm text-muted-foreground">Previous Visits</p>
                      <p className="font-medium">{customer.previousVisits}</p>
                    </div>
                  )}
                  {customer.passportNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground">Passport Number</p>
                      <p className="font-medium">{customer.passportNumber}</p>
                    </div>
                  )}
                  {customer.passportExpiry && (
                    <div>
                      <p className="text-sm text-muted-foreground">Passport Expiry</p>
                      <p className="font-medium">{customer.passportExpiry}</p>
                    </div>
                  )}
                  {customer.visaStatus && (
                    <div>
                      <p className="text-sm text-muted-foreground">Visa Status</p>
                      <p className="font-medium">{customer.visaStatus}</p>
                    </div>
                  )}
                  {customer.emergencyContact && (
                    <div>
                      <p className="text-sm text-muted-foreground">Emergency Contact</p>
                      <p className="font-medium">{customer.emergencyContact}</p>
                    </div>
                  )}
                  {customer.emergencyPhone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Emergency Phone</p>
                      <p className="font-medium">{customer.emergencyPhone}</p>
                    </div>
                  )}
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
                        placeholder="e.g., Approved, Pending, Not Required"
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
                    <label className="text-sm font-medium">Special Requirements / Trip Notes</label>
                    <Textarea
                      value={editedData.specialRequirements}
                      onChange={(e) => setEditedData({...editedData, specialRequirements: e.target.value})}
                      placeholder="Enter any special requirements, bookings, or trip history notes..."
                      rows={4}
                    />
                  </div>
                </div>
              )}
              
              {!isEditingDocs && customer.specialRequirements && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Special Requirements / Trip Notes</p>
                  <p className="font-medium whitespace-pre-wrap">{customer.specialRequirements}</p>
                </div>
              )}
            </div>
          </>
        </div>
      </DialogContent>
    </Dialog>
  )
}
