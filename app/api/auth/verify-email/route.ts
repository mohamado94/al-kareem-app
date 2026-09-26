import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getDb, isDatabaseConfigured } from '@/lib/db'

export async function GET(request: Request) {
  const destination = new URL('/', process.env.PUBLIC_APP_URL ?? new URL(request.url).origin)
  if (!isDatabaseConfigured()) return NextResponse.redirect(destination)
  const tokenHash = createHash('sha256').update(new URL(request.url).searchParams.get('token') ?? '').digest('hex')
  const sql = getDb()
  const ok = await sql.begin(async tx => {
    const rows = await tx`SELECT user_id FROM email_verification_tokens WHERE token_hash = ${tokenHash} AND used_at IS NULL AND expires_at > now() FOR UPDATE`
    if (!rows.length) return false
    await tx`UPDATE users SET email_verified = true, updated_at = now() WHERE id = ${rows[0].user_id}`
    await tx`UPDATE email_verification_tokens SET used_at = now() WHERE token_hash = ${tokenHash}`
    return true
  })
  destination.searchParams.set('emailVerified', ok ? '1' : '0')
  return NextResponse.redirect(destination)
}
