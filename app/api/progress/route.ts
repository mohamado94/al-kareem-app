import { NextResponse } from 'next/server'
import { getDb, isDatabaseConfigured } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth/session'
import { DEFAULT_PROGRESS, mergeProgress, type UserProgressData } from '@/lib/progress/types'
import { validProgress } from '@/lib/progress/validation'
import { expectedOwnerMatchesSession } from '@/lib/progress/scope'
import { isRecord, rateLimit, readJson, rejectCrossOrigin } from '@/lib/api-security'

export async function GET(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const expectedOwnerId = new URL(request.url).searchParams.get('ownerId')
  if (!expectedOwnerMatchesSession(expectedOwnerId, user.id)) {
    return NextResponse.json({ error: 'Account changed; progress was not loaded' }, { status: 409 })
  }

  const sql = getDb()
  const rows = await sql`
    SELECT data, last_saved_at FROM user_progress WHERE user_id = ${user.id}
  `

  if (rows.length === 0) {
    return NextResponse.json({ ownerId: user.id, progress: DEFAULT_PROGRESS })
  }

  const row = rows[0]
  const progress = mergeProgress(DEFAULT_PROGRESS, row.data as Partial<UserProgressData>)
  progress.stats.lastSavedAt = row.last_saved_at?.toISOString?.() ?? null

  return NextResponse.json({ ownerId: user.id, progress })
}

export async function PUT(request: Request) {
  const crossOrigin = rejectCrossOrigin(request)
  if (crossOrigin) return crossOrigin
  const limited = await rateLimit(request, 'progress', 120, 60_000)
  if (limited) return limited
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await readJson(request, 64_000) } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
  const expectedOwnerId = isRecord(body) ? body.ownerId : null
  if (!expectedOwnerMatchesSession(expectedOwnerId, user.id)) {
    return NextResponse.json({ error: 'Account changed; progress was not saved' }, { status: 409 })
  }
  const progress = isRecord(body) ? body.progress : null
  if (!validProgress(progress)) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const sql = getDb()
  const now = new Date()
  const saved = await sql.begin(async (tx) => {
    const rows = await tx`
      SELECT data FROM user_progress WHERE user_id = ${user.id} FOR UPDATE
    `
    const merged = rows.length > 0
      ? mergeProgress(rows[0].data as UserProgressData, progress)
      : mergeProgress(DEFAULT_PROGRESS, progress)
    merged.stats.lastSavedAt = now.toISOString()

    await tx`
      INSERT INTO user_progress (user_id, data, last_saved_at, updated_at)
      VALUES (${user.id}, ${tx.json(merged)}, ${now}, ${now})
      ON CONFLICT (user_id) DO UPDATE SET
        data = EXCLUDED.data,
        last_saved_at = EXCLUDED.last_saved_at,
        updated_at = EXCLUDED.updated_at
    `
    return merged
  })

  await sql`
    UPDATE users SET
      last_activity_at = ${saved.stats.lastActivityAt ? new Date(saved.stats.lastActivityAt) : null},
      notifications_enabled = ${saved.notificationsEnabled},
      last_reminder_sent_at = ${saved.lastReminderSentAt ? new Date(saved.lastReminderSentAt) : null},
      updated_at = ${now}
    WHERE id = ${user.id}
  `

  return NextResponse.json({ ok: true, lastSavedAt: now.toISOString() })
}
