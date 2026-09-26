import { NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/auth/jwt'
import { getUserFromRequest } from '@/lib/auth/session'
import { getDb, isDatabaseConfigured } from '@/lib/db'
import { rejectCrossOrigin } from '@/lib/api-security'

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOrigin(request)
  if (crossOrigin) return crossOrigin
  const user = await getUserFromRequest(request)
  if (user && isDatabaseConfigured()) {
    const sql = getDb()
    await sql`UPDATE users SET session_version = session_version + 1 WHERE id = ${user.id}`
  }
  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}
