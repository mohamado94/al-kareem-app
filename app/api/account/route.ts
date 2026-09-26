import { NextResponse } from 'next/server'
import { getDb, isDatabaseConfigured } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth/session'
import { verifyPassword } from '@/lib/auth/password'
import { COOKIE_NAME } from '@/lib/auth/jwt'
import { isRecord, rateLimit, readJson, rejectCrossOrigin } from '@/lib/api-security'

export async function DELETE(request: Request) {
  const crossOrigin = rejectCrossOrigin(request)
  if (crossOrigin) return crossOrigin
  const limited = await rateLimit(request, 'delete-account', 3, 60 * 60_000)
  if (limited) return limited
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'auth.error.notConfigured' }, { status: 503 })
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'auth.error.invalidCredentials' }, { status: 401 })
  let body: unknown
  try { body = await readJson(request, 4_096) } catch { return NextResponse.json({ error: 'auth.error.invalidCredentials' }, { status: 400 }) }
  if (!isRecord(body)) return NextResponse.json({ error: 'auth.error.invalidCredentials' }, { status: 400 })
  const sql = getDb()
  const rows = await sql`SELECT password_hash FROM users WHERE id = ${user.id}`
  if (!rows.length || !(await verifyPassword(String(body.password ?? ''), rows[0].password_hash))) {
    return NextResponse.json({ error: 'auth.error.invalidCredentials' }, { status: 401 })
  }
  await sql`DELETE FROM users WHERE id = ${user.id}`
  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 })
  return response
}
