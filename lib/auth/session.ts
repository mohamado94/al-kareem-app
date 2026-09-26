import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { COOKIE_NAME, verifySessionToken, type SessionPayload } from '@/lib/auth/jwt'
import { getDb, isDatabaseConfigured } from '@/lib/db'

export type AuthUser = {
  id: string
  email: string
  displayName: string
}

export function sessionToUser(session: SessionPayload): AuthUser {
  return { id: session.sub, email: session.email, displayName: session.displayName }
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export async function getUserFromCookies(): Promise<AuthUser | null> {
  const session = await getSessionFromCookies()
  if (!session || !(await isCurrentSession(session))) return null
  const sql = getDb()
  const rows = await sql`SELECT email, display_name FROM users WHERE id = ${session.sub}`
  if (rows.length === 0) return null
  return { id: session.sub, email: rows[0].email, displayName: rows[0].display_name }
}

async function isCurrentSession(session: SessionPayload): Promise<boolean> {
  if (!isDatabaseConfigured()) return false
  const sql = getDb()
  const rows = await sql`SELECT session_version FROM users WHERE id = ${session.sub}`
  return rows.length > 0 && rows[0].session_version === session.sessionVersion
}

export async function getUserFromRequest(request: Request): Promise<AuthUser | null> {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  const token = match?.[1]
  if (!token) return null
  const session = await verifySessionToken(decodeURIComponent(token))
  if (!session || !(await isCurrentSession(session))) return null
  return sessionToUser(session)
}

export function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAME)?.value ?? null
}
