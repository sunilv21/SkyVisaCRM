"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Filter, X, RotateCcw } from "lucide-react"
import type { Customer, DailyLog } from "@/lib/types"

export interface FilterOptions {
  dateFrom?: string
  dateTo?: string
  customerStatus?: string
  activityType?: string
  outcome?: string
  followUpRequired?: boolean
  searchTerm?: string
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void
  customers: Customer[]
  logs: DailyLog[]
}

export function AdvancedFilters({ onFiltersChange, customers, logs }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({})
  const [open, setOpen] = useState(false)

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFiltersChange({})
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const presetFilters = [
    {
      name: "Today's Activity",
      filters: { dateFrom: new Date().toISOString().split("T")[0], dateTo: new Date().toISOString().split("T")[0] },
    },
    {
      name: "This Week",
      filters: {
        dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        dateTo: new Date().toISOString().split("T")[0],
      },
    },
    {
      name: "Positive Outcomes",
      filters: { outcome: "positive" },
    },
    {
      name: "Pending Follow-ups",
      filters: { followUpRequired: true },
    },
    {
      name: "Active Customers",
      filters: { customerStatus: "active" },
    },
  ]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative bg-transparent">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Advanced Filters</h4>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>

          <Separator />

          {/* Quick Presets */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Filters</Label>
            <div className="flex flex-wrap gap-2">
              {presetFilters.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters(preset.filters)
                    onFiltersChange(preset.filters)
                  }}
                  className="text-xs"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Date Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="dateFrom" className="text-xs text-muted-foreground">
                  From
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom || ""}
                  onChange={(e) => updateFilter("dateFrom", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dateTo" className="text-xs text-muted-foreground">
                  To
                </Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo || ""}
                  onChange={(e) => updateFilter("dateTo", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Customer Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Customer Status</Label>
            <Select
              value={filters.customerStatus || "all"}
              onValueChange={(value) => updateFilter("customerStatus", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="Dead">Dead</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Activity Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Activity Type</Label>
            <Select
              value={filters.activityType || "all"}
              onValueChange={(value) => updateFilter("activityType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="call">Phone Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="note">Note</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Outcome */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Outcome</Label>
            <Select value={filters.outcome || "all"} onValueChange={(value) => updateFilter("outcome", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All outcomes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All outcomes</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Active Filters</Label>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(filters).map(([key, value]) => {
                    if (!value) return null
                    return (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {key}: {String(value)}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1"
                          onClick={() => updateFilter(key as keyof FilterOptions, undefined)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function applyFilters<T extends Customer | DailyLog>(
  items: T[],
  filters: FilterOptions,
  type: "customers" | "logs",
): T[] {
  return items.filter((item) => {
    // Search term filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      if (type === "customers") {
        const customer = item as Customer
        const matches =
          customer.name.toLowerCase().includes(term) ||
          customer.email.toLowerCase().includes(term) ||
          customer.company.toLowerCase().includes(term) ||
          customer.phone.toLowerCase().includes(term)
        if (!matches) return false
      } else {
        const log = item as DailyLog
        const matches =
          log.customerName.toLowerCase().includes(term) ||
          log.subject.toLowerCase().includes(term) ||
          log.description.toLowerCase().includes(term)
        if (!matches) return false
      }
    }

    if (type === "customers") {
      const customer = item as Customer
      if (filters.customerStatus && customer.status !== filters.customerStatus) return false
    } else {
      const log = item as DailyLog

      // Date range filter
      if (filters.dateFrom && log.date < filters.dateFrom) return false
      if (filters.dateTo && log.date > filters.dateTo) return false

      // Activity type filter
      if (filters.activityType && filters.activityType !== "all" && log.type !== filters.activityType) return false

      // Outcome filter
      if (filters.outcome && filters.outcome !== "all" && log.outcome !== filters.outcome) return false

      // Follow-up filter
      if (filters.followUpRequired !== undefined && log.followUpRequired !== filters.followUpRequired) return false
    }

    return true
  })
}
