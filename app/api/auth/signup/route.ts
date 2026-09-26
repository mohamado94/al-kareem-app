import { NextResponse } from 'next/server'
import { getDb, isDatabaseConfigured } from '@/lib/db'
import { hashPassword, validatePassword } from '@/lib/auth/password'
import { DEFAULT_PROGRESS } from '@/lib/progress/types'
import { isRecord, rateLimit, readJson, validEmail, rejectCrossOrigin } from '@/lib/api-security'
import { createHash, randomBytes } from 'node:crypto'
import { sendVerificationEmail } from '@/lib/auth/email'

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOrigin(request)
  if (crossOrigin) return crossOrigin
  const limited = await rateLimit(request, 'signup', 5, 60 * 60_000)
  if (limited) return limited
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'auth.error.notConfigured' }, { status: 503 })
  }

  let body: unknown
  try { body = await readJson(request, 8_192) } catch {
    return NextResponse.json({ error: 'auth.error.generic' }, { status: 400 })
  }
  if (!isRecord(body)) return NextResponse.json({ error: 'auth.error.generic' }, { status: 400 })
  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')
  const displayName = String(body.displayName ?? 'Apprenant').trim().slice(0, 80) || 'Apprenant'

  if (!validEmail(email)) {
    return NextResponse.json({ error: 'auth.error.generic' }, { status: 400 })
  }

  const passwordError = validatePassword(password)
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 })
  }

  const sql = getDb()
  const passwordHash = await hashPassword(password)
  let user
  try {
    user = await sql.begin(async (tx) => {
      const rows = await tx`
        INSERT INTO users (email, password_hash, display_name, email_verified)
        VALUES (${email}, ${passwordHash}, ${displayName}, false)
        RETURNING id, email, display_name, session_version
      `
      await tx`
        INSERT INTO user_progress (user_id, data)
        VALUES (${rows[0].id}, ${tx.json(DEFAULT_PROGRESS)})
      `
      return rows[0]
    })
  } catch {
    // Keep the response deliberately generic to avoid email enumeration.
    return NextResponse.json({ error: 'auth.error.generic' }, { status: 400 })
  }

  const rawToken = randomBytes(32).toString('base64url')
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  await sql`INSERT INTO email_verification_tokens (user_id, token_hash, expires_at) VALUES (${user.id}, ${tokenHash}, now() + interval '24 hours')`
  const delivered = await sendVerificationEmail(email, rawToken).catch(() => false)
  if (!delivered) {
    await sql`DELETE FROM users WHERE id = ${user.id}`
    return NextResponse.json({ error: 'auth.error.emailUnavailable' }, { status: 503 })
  }
  return NextResponse.json({ needsVerification: true })
}
