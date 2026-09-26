import { NextResponse } from 'next/server'
import { getDb, isDatabaseConfigured } from '@/lib/db'
import { verifyPassword } from '@/lib/auth/password'
import { COOKIE_NAME, MAX_AGE, createSessionToken } from '@/lib/auth/jwt'
import { isRecord, rateLimit, readJson, rejectCrossOrigin } from '@/lib/api-security'

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOrigin(request)
  if (crossOrigin) return crossOrigin
  const limited = await rateLimit(request, 'login', 8, 15 * 60_000)
  if (limited) return limited
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'auth.error.notConfigured' }, { status: 503 })
  }

  let body: unknown
  try { body = await readJson(request, 4_096) } catch {
    return NextResponse.json({ error: 'auth.error.invalidCredentials' }, { status: 400 })
  }
  if (!isRecord(body)) return NextResponse.json({ error: 'auth.error.invalidCredentials' }, { status: 400 })
  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')

  if (!email || !password) {
    return NextResponse.json({ error: 'auth.error.invalidCredentials' }, { status: 401 })
  }

  const sql = getDb()
  const rows = await sql`
    SELECT id, email, display_name, password_hash, session_version, email_verified
    FROM users WHERE email = ${email}
  `

  if (rows.length === 0) {
    return NextResponse.json({ error: 'auth.error.invalidCredentials' }, { status: 401 })
  }

  const user = rows[0]
  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'auth.error.invalidCredentials' }, { status: 401 })
  }
  if (!user.email_verified) return NextResponse.json({ error: 'auth.error.emailNotConfirmed' }, { status: 403 })

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    displayName: user.display_name,
    sessionVersion: user.session_version,
  })

  const response = NextResponse.json({
    user: { id: user.id, email: user.email, displayName: user.display_name },
  })

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  })

  return response
}
