import { NextResponse } from 'next/server'
import { getDb, isDatabaseConfigured } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth/session'
import { isRecord, readJson, rejectCrossOrigin } from '@/lib/api-security'

const LANGUAGES = new Set(['fr', 'ar', 'en', 'id', 'ms'])

export async function PATCH(request: Request) {
  const crossOrigin = rejectCrossOrigin(request)
  if (crossOrigin) return crossOrigin
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let body: unknown
  try { body = await readJson(request, 1_024) } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
  if (!isRecord(body)) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  const sql = getDb()
  if (typeof body.language === 'string' && LANGUAGES.has(body.language)) {
    await sql`UPDATE users SET preferred_lang = ${body.language}, updated_at = ${new Date()} WHERE id = ${user.id}`
    return NextResponse.json({ ok: true })
  }
  if (typeof body.displayName === 'string') {
    const displayName = body.displayName.trim()
    if (!displayName || displayName.length > 80) return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
    await sql`UPDATE users SET display_name = ${displayName}, updated_at = ${new Date()} WHERE id = ${user.id}`
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'Invalid preference' }, { status: 400 })
}
