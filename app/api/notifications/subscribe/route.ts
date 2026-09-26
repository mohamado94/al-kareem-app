import { NextResponse } from 'next/server'
import { getDb, isDatabaseConfigured } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth/session'
import { isRecord, rateLimit, readJson, rejectCrossOrigin } from '@/lib/api-security'

function safeEndpoint(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2_048) return false
  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()
    if (url.protocol !== 'https:' || !host) return false
    return host === 'fcm.googleapis.com'
      || host === 'web.push.apple.com'
      || host.endsWith('.push.services.mozilla.com')
      || host.endsWith('.notify.windows.com')
  } catch { return false }
}

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOrigin(request)
  if (crossOrigin) return crossOrigin
  const limited = await rateLimit(request, 'push-subscribe', 20, 60 * 60_000)
  if (limited) return limited
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await readJson(request, 8_192) } catch {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
  }
  if (!isRecord(body) || !isRecord(body.keys)) return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
  const endpoint = body.endpoint
  const keys = body.keys

  if (!safeEndpoint(endpoint) || typeof keys.p256dh !== 'string' || keys.p256dh.length > 256 || typeof keys.auth !== 'string' || keys.auth.length > 256) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
  }

  const sql = getDb()
  await sql`
    INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
    VALUES (${user.id}, ${endpoint}, ${keys.p256dh}, ${keys.auth})
    ON CONFLICT (user_id, endpoint) DO UPDATE SET
      p256dh = EXCLUDED.p256dh,
      auth = EXCLUDED.auth
  `

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const crossOrigin = rejectCrossOrigin(request)
  if (crossOrigin) return crossOrigin
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await readJson(request, 4_096) } catch {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
  }
  if (isRecord(body) && safeEndpoint(body.endpoint)) {
    const sql = getDb()
    await sql`
      DELETE FROM push_subscriptions
      WHERE user_id = ${user.id} AND endpoint = ${body.endpoint}
    `
  }

  return NextResponse.json({ ok: true })
}
