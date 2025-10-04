"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, Edit, Trash2, Clock, Calendar, User, Phone, Mail, Users, FileText } from "lucide-react"
import type { DailyLog, Customer } from "@/lib/types"
import { DailyLogForm } from "./daily-log-form"
import { formatDate } from "@/lib/storage"

interface DailyLogListProps {
  logs: DailyLog[]
  customers: Customer[]
  onUpdate: (log: DailyLog) => void
  onDelete: (id: string) => void
}

export function DailyLogList({ logs, customers, onUpdate, onDelete }: DailyLogListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all")
  const [followUpFilter, setFollowUpFilter] = useState<string>("all")
  const [employeeFilter, setEmployeeFilter] = useState<string>("all")

  // Get unique employees from logs
  const uniqueEmployees = Array.from(new Set(logs.map(log => log.employeeId)))
    .map(id => {
      const log = logs.find(l => l.employeeId === id)
      return { id, name: log?.employeeName || "Unknown" }
    })
    .filter(emp => emp.id)

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || log.type === typeFilter
    const matchesOutcome = outcomeFilter === "all" || log.outcome === outcomeFilter
    const matchesEmployee = employeeFilter === "all" || log.employeeId === employeeFilter
    
    // Follow-up filter
    let matchesFollowUp = true
    if (followUpFilter === "required") {
      matchesFollowUp = log.followUpRequired === true
    } else if (followUpFilter === "upcoming") {
      matchesFollowUp = log.followUpRequired === true && !!log.followUpDate && new Date(log.followUpDate) >= new Date()
    } else if (followUpFilter === "overdue") {
      matchesFollowUp = log.followUpRequired === true && !!log.followUpDate && new Date(log.followUpDate) < new Date()
    }

    return matchesSearch && matchesType && matchesOutcome && matchesEmployee && matchesFollowUp
  })

  const sortedLogs = filteredLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const getTypeIcon = (type: DailyLog["type"]) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "meeting":
        return <Users className="h-4 w-4" />
      case "note":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getOutcomeColor = (outcome: DailyLog["outcome"]) => {
    switch (outcome) {
      case "positive":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "negative":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "neutral":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters and Add */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start">
        <div className="flex flex-wrap gap-4 flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="call">Phone Call</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="note">Note</SelectItem>
            </SelectContent>
          </Select>
          <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="All Outcomes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Outcomes</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
            </SelectContent>
          </Select>
          <Select value={followUpFilter} onValueChange={setFollowUpFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Follow-up Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Logs</SelectItem>
              <SelectItem value="required">Follow-up Required</SelectItem>
              <SelectItem value="upcoming">Upcoming Follow-ups</SelectItem>
              <SelectItem value="overdue">Overdue Follow-ups</SelectItem>
            </SelectContent>
          </Select>
          <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All Employees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {uniqueEmployees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(followUpFilter !== "all" || employeeFilter !== "all" || typeFilter !== "all" || outcomeFilter !== "all") && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setTypeFilter("all")
                setOutcomeFilter("all")
                setFollowUpFilter("all")
                setEmployeeFilter("all")
              }}
            >
              Clear All
            </Button>
          )}
        </div>
        <DailyLogForm customers={customers} onSave={onUpdate} />
      </div>

      {/* Logs List */}
      {sortedLogs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-lg mb-2">
            {searchTerm || typeFilter !== "all" || outcomeFilter !== "all" || followUpFilter !== "all" || employeeFilter !== "all" ? "No logs found" : "No activity logs yet"}
          </div>
          <p className="mb-4">
            {searchTerm || typeFilter !== "all" || outcomeFilter !== "all" || followUpFilter !== "all" || employeeFilter !== "all"
              ? "Try adjusting your filters"
              : "Start logging your customer interactions"}
          </p>
          {!searchTerm && typeFilter === "all" && outcomeFilter === "all" && followUpFilter === "all" && employeeFilter === "all" && (
            <DailyLogForm customers={customers} onSave={onUpdate} />
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedLogs.map((log) => (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-accent">
                      {getTypeIcon(log.type)}
                      <span className="font-medium capitalize">{log.type}</span>
                    </div>
                    <Badge className={getOutcomeColor(log.outcome)}>{log.outcome}</Badge>
                    <Badge variant="outline" className="text-purple-600 border-purple-600">
                      {log.employeeName}
                    </Badge>
                    {log.followUpRequired && (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        Follow-up
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{formatDate(log.date)}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DailyLogForm
                          log={log}
                          customers={customers}
                          onSave={onUpdate}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          }
                        />
                        <DropdownMenuItem
                          onClick={() => onDelete(log.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{log.customerName}</span>
                  {log.duration && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {log.duration}m
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">{log.subject}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{log.description}</p>
                </div>

                {log.followUpRequired && log.followUpDate && (
                  <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-orange-800">
                      Follow-up scheduled for {formatDate(log.followUpDate)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
