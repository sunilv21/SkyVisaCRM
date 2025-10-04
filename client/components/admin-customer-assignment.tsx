"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, AlertCircle, FileText } from "lucide-react"
import type { Customer } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface AdminCustomerAssignmentProps {
  customers: Customer[]
  onUpdateCustomer: (customer: Customer) => void
}

export function AdminCustomerAssignment({ customers, onUpdateCustomer }: AdminCustomerAssignmentProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerLogs, setCustomerLogs] = useState<any[]>([])
  const [isLogsDialogOpen, setIsLogsDialogOpen] = useState(false)
  
  const unassignedCount = customers.filter((c) => c.assignedEmployeeId === "unassigned").length

  const handleViewLogs = async (customer: Customer) => {
    setSelectedCustomer(customer)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const authSession = localStorage.getItem("crm_auth_session")
      const token = authSession ? JSON.parse(authSession).token : null

      const response = await fetch(`${API_BASE_URL}/customers/${customer.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCustomerLogs(data.logs || [])
        setIsLogsDialogOpen(true)
      }
    } catch (error) {
      console.error("Failed to load logs:", error)
    }
  }

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
            {customers.map((customer) => (
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

                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleViewLogs(customer)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Logs
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {customers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No customers found</div>
          )}
        </CardContent>
      </Card>

      {/* Logs Dialog */}
      <Dialog open={isLogsDialogOpen} onOpenChange={setIsLogsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Customer Logs - {selectedCustomer?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {customerLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No logs found for this customer</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customerLogs.map((log: any) => (
                  <div key={log._id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm font-medium">
                          By: {log.addedBy?.name || "Unknown"}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{log.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
