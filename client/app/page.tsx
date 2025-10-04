"use client"

import { useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { LoginForm } from "@/components/login-form"
import { useRouter } from "next/navigation"

export default function CRMDashboard() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      const dest = user.role === "admin" ? "/admin" : "/employee"
      router.replace(dest)
    }
  }, [user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to your dashboard…</p>
      </div>
    </div>
  )
}
