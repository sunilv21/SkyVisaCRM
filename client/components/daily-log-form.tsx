"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Plus, Save } from "lucide-react"
import type { DailyLog, Customer } from "@/lib/types"

interface DailyLogFormProps {
  log?: DailyLog
  customers: Customer[]
  onSave: (log: DailyLog) => void
  trigger?: React.ReactNode
}

export function DailyLogForm({ log, customers, onSave, trigger }: DailyLogFormProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<DailyLog>>({
    id: log?.id,
    customerId: log?.customerId || (customers.length === 1 ? customers[0].id : ""),
    customerName: log?.customerName || (customers.length === 1 ? customers[0].name : ""),
    date: log?.date || new Date().toISOString().split("T")[0],
    type: log?.type || "call",
    subject: log?.subject || "",
    description: log?.description || "",
    duration: log?.duration || 0,
    outcome: log?.outcome || "neutral",
    followUpRequired: log?.followUpRequired || false,
    followUpDate: log?.followUpDate || "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (log) {
      setFormData({
        id: log.id,
        customerId: log.customerId,
        customerName: log.customerName,
        date: log.date,
        type: log.type,
        subject: log.subject,
        description: log.description,
        duration: log.duration,
        outcome: log.outcome,
        followUpRequired: log.followUpRequired,
        followUpDate: log.followUpDate,
      })
    } else if (customers.length === 1) {
      // Auto-select customer if only one is provided
      setFormData(prev => ({
        ...prev,
        customerId: customers[0].id,
        customerName: customers[0].name,
      }))
    }
  }, [log, customers])

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId)
    setFormData({
      ...formData,
      customerId: customerId,
      customerName: customer?.name || "",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.customerId || !formData.description) return

    setLoading(true)

    const payload = {
        ...formData,
        followUpDate: formData.followUpRequired ? formData.followUpDate : null,
    }

    try {
      await onSave(payload as DailyLog)
      setOpen(false)
      if (!log) {
        // reset form if new log
        setFormData({
          customerId: customers.length === 1 ? customers[0].id : "",
          customerName: customers.length === 1 ? customers[0].name : "",
          date: new Date().toISOString().split("T")[0],
          type: "call",
          subject: "",
          description: "",
          duration: 0,
          outcome: "neutral",
          followUpRequired: false,
          followUpDate: "",
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Log Activity
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">{log ? "Edit Log" : "Log New Activity"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            <Select
              value={formData.customerId}
              onValueChange={handleCustomerChange}
              disabled={customers.length === 1}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-6">
            <div className="space-y-2 flex-1">
              <Label htmlFor="type">Activity Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as DailyLog["type"] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="outcome">Outcome</Label>
              <Select
                value={formData.outcome}
                onValueChange={(value) => setFormData({ ...formData, outcome: value as DailyLog["outcome"] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="followUpRequired"
              checked={formData.followUpRequired}
              onCheckedChange={(checked) => setFormData({ ...formData, followUpRequired: !!checked })}
            />
            <Label htmlFor="followUpRequired">Follow-up required?</Label>
          </div>

          {formData.followUpRequired && (
            <div className="space-y-2">
              <Label htmlFor="followUpDate">Follow-up Date</Label>
              <Input
                id="followUpDate"
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : <><Save className="h-4 w-4 mr-2" />{log ? "Update" : "Save"}</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
