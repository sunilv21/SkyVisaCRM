"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Search, User, FileText, Calendar, Mail, Building2 } from "lucide-react"
import type { Customer, DailyLog } from "@/lib/types"
import { formatDate } from "@/lib/storage"

interface GlobalSearchProps {
  customers: Customer[]
  logs: DailyLog[]
  onSelectCustomer?: (customer: Customer) => void
  onSelectLog?: (log: DailyLog) => void
}

interface SearchResult {
  type: "customer" | "log"
  item: Customer | DailyLog
  matchedFields: string[]
}

export function GlobalSearch({ customers, logs, onSelectCustomer, onSelectLog }: GlobalSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([])
      return
    }

    const searchResults: SearchResult[] = []
    const term = searchTerm.toLowerCase()

    // Search customers
    customers.forEach((customer) => {
      const matchedFields: string[] = []

      if (customer.name.toLowerCase().includes(term)) matchedFields.push("name")
      if (customer.email.toLowerCase().includes(term)) matchedFields.push("email")
      if (customer.company.toLowerCase().includes(term)) matchedFields.push("company")
      if (customer.phone.toLowerCase().includes(term)) matchedFields.push("phone")

      if (matchedFields.length > 0) {
        searchResults.push({
          type: "customer",
          item: customer,
          matchedFields,
        })
      }
    })

    // Search logs
    logs.forEach((log) => {
      const matchedFields: string[] = []

      if (log.customerName.toLowerCase().includes(term)) matchedFields.push("customer")
      if (log.subject.toLowerCase().includes(term)) matchedFields.push("subject")
      if (log.description.toLowerCase().includes(term)) matchedFields.push("description")
      if (log.type.toLowerCase().includes(term)) matchedFields.push("type")

      if (matchedFields.length > 0) {
        searchResults.push({
          type: "log",
          item: log,
          matchedFields,
        })
      }
    })

    // Sort by relevance (more matched fields = higher relevance)
    searchResults.sort((a, b) => b.matchedFields.length - a.matchedFields.length)
    setResults(searchResults.slice(0, 20)) // Limit to 20 results
  }, [searchTerm, customers, logs])

  const handleSelect = (result: SearchResult) => {
    if (result.type === "customer" && onSelectCustomer) {
      onSelectCustomer(result.item as Customer)
    } else if (result.type === "log" && onSelectLog) {
      onSelectLog(result.item as DailyLog)
    }
    setOpen(false)
    setSearchTerm("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto justify-start text-muted-foreground bg-transparent">
          <Search className="h-4 w-4 mr-2" />
          Search everything...
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search CRM</DialogTitle>
        </DialogHeader>
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder="Search customers, activities, notes..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList className="max-h-96">
            <CommandEmpty>No results found.</CommandEmpty>

            {results.length > 0 && (
              <>
                <CommandGroup heading="Customers">
                  {results
                    .filter((result) => result.type === "customer")
                    .map((result) => {
                      const customer = result.item as Customer
                      return (
                        <CommandItem
                          key={`customer-${customer.id}`}
                          onSelect={() => handleSelect(result)}
                          className="flex items-center gap-3 p-3"
                        >
                          <User className="h-4 w-4 text-accent" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{customer.name}</span>
                              <Badge variant="secondary">{customer.status}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {customer.company && (
                                <div className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  {customer.company}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {result.matchedFields.map((field) => (
                              <Badge key={field} variant="outline" className="text-xs">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        </CommandItem>
                      )
                    })}
                </CommandGroup>

                <CommandGroup heading="Activity Logs">
                  {results
                    .filter((result) => result.type === "log")
                    .map((result) => {
                      const log = result.item as DailyLog
                      return (
                        <CommandItem
                          key={`log-${log.id}`}
                          onSelect={() => handleSelect(result)}
                          className="flex items-center gap-3 p-3"
                        >
                          <FileText className="h-4 w-4 text-accent" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{log.subject}</span>
                              <Badge variant="secondary">{log.type}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {log.customerName}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(log.date)}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {result.matchedFields.map((field) => (
                              <Badge key={field} variant="outline" className="text-xs">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        </CommandItem>
                      )
                    })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
