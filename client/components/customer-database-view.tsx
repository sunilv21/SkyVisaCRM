"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, Eye, Plane, Edit, Trash2, Mail, Phone, MapPin, LayoutGrid, List as ListIcon } from "lucide-react"
import type { Customer } from "@/lib/types"
import { CustomerForm } from "./customer-form"
import { CustomerProfileModal } from "./customer-profile-modal"

interface CustomerDatabaseViewProps {
  customers: Customer[]
  onUpdate: () => void
  onDelete: (id: string) => void
  onMarkTravelling: (customer: Customer) => void
}

export function CustomerDatabaseView({ customers, onUpdate, onDelete, onMarkTravelling }: CustomerDatabaseViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm),
  )

  const handleViewProfile = (customer: Customer) => {
    setSelectedCustomer(customer)
    setProfileModalOpen(true)
  }

  const getStatusColor = (status: Customer["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Dead":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "prospect":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, destination, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {/* View Toggle */}
        <div className="flex border rounded-md">
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="rounded-r-none"
          >
            <ListIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="rounded-l-none"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Customer Display */}
      {filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-lg mb-2 text-muted-foreground">
              {searchTerm ? "No customers found" : "No customers in database"}
            </div>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Add your first customer to get started"}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Travel Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        {customer.assignedEmployeeName && (
                          <p className="text-xs text-muted-foreground">Assigned to: {customer.assignedEmployeeName}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">
                            {customer.countryCode ? `+${customer.countryCode} ` : ""}
                            {customer.phone}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{customer.destination || "Not set"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {customer.travelFrom && customer.travelTo ? (
                          <>
                            <div>{new Date(customer.travelFrom).toLocaleDateString()}</div>
                            <div className="text-xs text-muted-foreground">
                              to {new Date(customer.travelTo).toLocaleDateString()}
                            </div>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Not set</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
                        {customer.isTravelling && (
                          <Badge className="bg-purple-600 hover:bg-purple-700 text-white">
                            <Plane className="h-3 w-3 mr-1" />
                            Travelling
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewProfile(customer)} className="h-8">
                          <Eye className="h-4 w-4 mr-1" />
                          View Profile
                        </Button>
                        {!customer.isTravelling && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onMarkTravelling(customer)}
                            className="h-8 bg-purple-600 hover:bg-purple-700"
                          >
                            <Plane className="h-4 w-4 mr-1" />
                            Mark Travelling
                          </Button>
                        )}
                        <DropdownMenu>
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
                          <DropdownMenuContent align="end" className="z-50">
                            <CustomerForm
                              customer={customer}
                              onSuccess={onUpdate}
                              trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              }
                            />
                            <DropdownMenuItem
                              onClick={() => onDelete(customer.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                    {customer.company && <p className="text-sm text-muted-foreground">{customer.company}</p>}
                  </div>
                  <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs">{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs">{customer.phone}</span>
                    </div>
                  )}
                  {customer.destination && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs">{customer.destination}</span>
                    </div>
                  )}
                  {customer.assignedEmployeeName && (
                    <div className="text-xs text-muted-foreground">
                      Assigned to: {customer.assignedEmployeeName}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={() => handleViewProfile(customer)} className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {!customer.isTravelling && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onMarkTravelling(customer)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      <Plane className="h-4 w-4 mr-1" />
                      Travel
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="z-50">
                      <CustomerForm
                        customer={customer}
                        onSuccess={onUpdate}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        }
                      />
                      <DropdownMenuItem
                        onClick={() => onDelete(customer.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
