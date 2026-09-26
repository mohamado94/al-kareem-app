import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import { getDb, isDatabaseConfigured } from '@/lib/db'

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

export function clientIp(request: Request): string {
  return request.headers.get('x-real-ip')
    ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? 'unknown'
}

export async function rateLimit(request: Request, scope: string, limit: number, windowMs: number): Promise<NextResponse | null> {
  const now = Date.now()
  const rawKey = `${scope}:${clientIp(request)}`
  const key = createHash('sha256').update(rawKey).digest('hex')

  if (isDatabaseConfigured()) {
    const sql = getDb()
    const resetAt = new Date(now + windowMs)
    const rows = await sql`
      INSERT INTO api_rate_limits (bucket_key, request_count, reset_at)
      VALUES (${key}, 1, ${resetAt})
      ON CONFLICT (bucket_key) DO UPDATE SET
        request_count = CASE WHEN api_rate_limits.reset_at <= now() THEN 1 ELSE api_rate_limits.request_count + 1 END,
        reset_at = CASE WHEN api_rate_limits.reset_at <= now() THEN ${resetAt} ELSE api_rate_limits.reset_at END
      RETURNING request_count, reset_at
    `
    if (rows[0].request_count <= limit) return null
    const retry = Math.max(1, Math.ceil((new Date(rows[0].reset_at).getTime() - now) / 1000))
    return NextResponse.json({ error: 'rateLimited' }, { status: 429, headers: { 'Retry-After': String(retry) } })
  }

  if (buckets.size > 5_000) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey)
    }
    if (buckets.size > 5_000) buckets.delete(buckets.keys().next().value as string)
  }
  const current = buckets.get(key)
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return null
  }
  current.count += 1
  if (current.count <= limit) return null
  return NextResponse.json(
    { error: 'rateLimited' },
    { status: 429, headers: { 'Retry-After': String(Math.ceil((current.resetAt - now) / 1000)) } },
  )
}

export async function readJson(request: Request, maxBytes = 32_000): Promise<unknown> {
  const declared = Number(request.headers.get('content-length') ?? 0)
  if (declared > maxBytes) throw new Error('BODY_TOO_LARGE')
  const text = await request.text()
  if (new TextEncoder().encode(text).length > maxBytes) throw new Error('BODY_TOO_LARGE')
  return JSON.parse(text)
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function validEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function rejectCrossOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get('origin')
  if (!origin) return null
  const expected = process.env.PUBLIC_APP_URL ? new URL(process.env.PUBLIC_APP_URL).origin : new URL(request.url).origin
  return origin === expected ? null : NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
}
