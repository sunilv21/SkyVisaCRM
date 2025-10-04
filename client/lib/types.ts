export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  countryCode?: string
  company: string
  status: "active" | "Dead" | "prospect" | "completed"
  isTravelling?: boolean
  travellingStartDate?: string
  assignedEmployeeId?: string
  assignedEmployeeName?: string
  createdAt: string
  lastContact: string
  dob?: string
  gender?: string
  nationality?: string
  destination?: string
  purpose?: string
  travelFrom?: string
  travelTo?: string
  budget?: string
  travelType?: string
  hotel?: string
  service?: string
  insurance?: boolean
  pickup?: boolean
  tours?: boolean
  previousVisits?: string
  tripHistory?: TripRecord[]
  upcomingBookings?: Booking[]
  passportNumber?: string
  passportExpiry?: string
  visaStatus?: string
  emergencyContact?: string
  emergencyPhone?: string
  specialRequirements?: string
  groupTravelers?: string[] // Array of traveler names for group bookings
}

export interface DailyLog {
  id: string
  customerId: string
  customerName: string
  date: string
  type: "call" | "email" | "meeting" | "note"
  subject: string
  description: string
  duration?: number // in minutes
  outcome: "positive" | "neutral" | "negative"
  followUpRequired: boolean
  followUpDate?: string
  employeeName: string
  employeeId: string
  createdAt: string
}

export interface DashboardStats {
  totalCustomers: number
  activeCustomers: number
  todayLogs: number
  weekLogs: number
  pendingFollowUps: number
}

export interface EmployeeActivity {
  employeeId: string
  employeeName: string
  totalLogs: number
  lastActivity: string
  pendingFollowUps: number
}

export interface User {
  id: string
  email: string
  password: string // In production, this would be hashed
  name: string
  role: "admin" | "employee"
  department?: string
  createdAt: string
  lastLogin?: string
  isActive: boolean
}

export interface AuthSession {
  user: User
  token: string
  expiresAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  session: AuthSession | null
}

export interface TripRecord {
  id: string
  destination: string
  startDate: string
  endDate: string
  purpose: string
  status: "completed" | "cancelled"
  notes?: string
}

export interface Booking {
  id: string
  destination: string
  startDate: string
  endDate: string
  status: "confirmed" | "pending" | "cancelled"
  packageType: string
  amount: number
  notes?: string
}
