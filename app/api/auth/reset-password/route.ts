import { createHash, randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getDb, isDatabaseConfigured } from '@/lib/db'
import { hashPassword, validatePassword } from '@/lib/auth/password'
import { isRecord, rateLimit, readJson, validEmail, rejectCrossOrigin } from '@/lib/api-security'
import { sendPasswordResetEmail } from '@/lib/auth/email'

const generic = () => NextResponse.json({ ok: true })

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOrigin(request)
  if (crossOrigin) return crossOrigin
  const limited = await rateLimit(request, 'password-reset', 4, 60 * 60_000)
  if (limited) return limited
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'auth.error.notConfigured' }, { status: 503 })
  let body: unknown
  try { body = await readJson(request, 4_096) } catch { return generic() }
  if (!isRecord(body)) return generic()
  const token = typeof body.token === 'string' ? body.token : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const sql = getDb()
  if (token && password) {
    const passwordError = validatePassword(password)
    if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 })
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const passwordHash = await hashPassword(password)
    const changed = await sql.begin(async tx => {
      const rows = await tx`SELECT user_id FROM password_reset_tokens WHERE token_hash = ${tokenHash} AND used_at IS NULL AND expires_at > now() FOR UPDATE`
      if (!rows.length) return false
      await tx`UPDATE users SET password_hash = ${passwordHash}, session_version = session_version + 1, updated_at = now() WHERE id = ${rows[0].user_id}`
      await tx`UPDATE password_reset_tokens SET used_at = now() WHERE token_hash = ${tokenHash}`
      return true
    })
    return changed ? generic() : NextResponse.json({ error: 'auth.error.invalidReset' }, { status: 400 })
  }
  const email = String(body.email ?? '').trim().toLowerCase()
  if (!validEmail(email)) return generic()
  const users = await sql`SELECT id FROM users WHERE email = ${email}`
  if (!users.length) return generic()
  const rawToken = randomBytes(32).toString('base64url')
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  await sql.begin(async tx => {
    await tx`DELETE FROM password_reset_tokens WHERE user_id = ${users[0].id} OR expires_at <= now()`
    await tx`INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (${users[0].id}, ${tokenHash}, now() + interval '30 minutes')`
  })
  try { await sendPasswordResetEmail(email, rawToken) } catch { /* always return generic */ }
  return generic()
}
