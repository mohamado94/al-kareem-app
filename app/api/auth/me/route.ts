import { NextResponse } from 'next/server'
import { getUserFromCookies } from '@/lib/auth/session'
import { isDatabaseConfigured } from '@/lib/db'

export async function GET() {
  if (!isDatabaseConfigured()) {
    // A missing optional database means "guest mode", not a server outage.
    return NextResponse.json({ user: null, configured: false })
  }
  const user = await getUserFromCookies()
  if (!user) {
    return NextResponse.json({ user: null })
  }
  return NextResponse.json({ user, configured: true })
}
