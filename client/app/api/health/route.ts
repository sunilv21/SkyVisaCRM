import { NextResponse } from 'next/server'

// Health check endpoint for UptimeRobot monitoring
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      message: 'CRM application is running'
    },
    { status: 200 }
  )
}
