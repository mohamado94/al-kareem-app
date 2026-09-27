import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { getDb, isDatabaseConfigured } from '@/lib/db'
import { HADITHS } from '@/lib/data'
import { buildDailyHadithNotification, notificationDay } from '@/lib/daily-hadith'

const REMINDER_MESSAGES: Record<string, { title: string; body: string }> = {
  fr: {
    title: '🔔 Rappel Al-Kareem',
    body: 'Tu as oublié ta série ! Reviens continuer ton apprentissage 📚',
  },
  en: {
    title: '🔔 Al-Kareem Reminder',
    body: "You missed your streak! Come back and continue learning 📚",
  },
  ar: {
    title: '🔔 تذكير الكريم',
    body: 'لقد نسيت سلسلتك! عد لمتابعة تعلّمك 📚',
  },
  id: {
    title: '🔔 Pengingat Al-Kareem',
    body: 'Kamu melewatkan streak-mu! Kembali lanjutkan belajarmu 📚',
  },
  ms: {
    title: '🔔 Peringatan Al-Kareem',
    body: 'Anda terlepas streak anda! Kembali sambung pembelajaran anda 📚',
  },
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: false, message: 'Database not configured' })
  }

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY
  const vapidEmail = process.env.VAPID_EMAIL

  if (!vapidPublic || !vapidPrivate || !vapidEmail?.startsWith('mailto:')) {
    return NextResponse.json({
      ok: false,
      message: 'Missing VAPID configuration',
    })
  }

  webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate)

  const sql = getDb()
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const profiles = await sql`
    SELECT id, preferred_lang, last_activity_at, last_reminder_sent_at
    FROM users
    WHERE notifications_enabled = true
      AND last_activity_at IS NOT NULL
      AND last_activity_at < ${cutoff}
  `

  let sent = 0

  for (const profile of profiles) {
    const lastActivity = new Date(profile.last_activity_at!).getTime()
    if (Date.now() - lastActivity < 24 * 60 * 60 * 1000) continue

    if (profile.last_reminder_sent_at) {
      const lastReminder = new Date(profile.last_reminder_sent_at).getTime()
      if (lastReminder > lastActivity) continue
    }

    // Claim the reminder atomically so concurrent cron invocations cannot
    // notify the same user twice.
    const claimed = await sql`
      UPDATE users
      SET last_reminder_sent_at = ${new Date()}
      WHERE id = ${profile.id}
        AND (last_reminder_sent_at IS NULL OR last_reminder_sent_at <= last_activity_at)
      RETURNING id
    `
    if (claimed.length === 0) continue

    const subs = await sql`
      SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ${profile.id}
    `

    if (subs.length === 0) {
      await sql`UPDATE users SET last_reminder_sent_at = NULL WHERE id = ${profile.id}`
      continue
    }

    const lang = profile.preferred_lang ?? 'fr'
    const msg = REMINDER_MESSAGES[lang] ?? REMINDER_MESSAGES.fr

    let sentForUser = 0
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify({
            title: msg.title,
            body: msg.body,
            icon: '/icon-192.png',
            tag: 'alkarim-streak-reminder',
          }),
        )
        sent++
        sentForUser++
      } catch (error) {
        const statusCode = typeof error === 'object' && error && 'statusCode' in error
          ? Number(error.statusCode)
          : 0
        if (statusCode === 404 || statusCode === 410) {
          await sql`DELETE FROM push_subscriptions WHERE endpoint = ${sub.endpoint}`
        }
      }
    }

    if (sentForUser === 0) {
      await sql`
        UPDATE users
        SET last_reminder_sent_at = NULL
        WHERE id = ${profile.id} AND last_reminder_sent_at > last_activity_at
      `
    }

  }

  const hadithSent = await sendDailyHadith(sql)

  return NextResponse.json({ ok: true, sent, hadithSent })
}

type Sql = ReturnType<typeof getDb>

/**
 * Sends the "Hadith of the day" to every user who enabled notifications and
 * still has a push subscription. Each user is claimed atomically for the
 * current UTC day (last_daily_hadith_sent_on), so a repeated or concurrent
 * cron invocation cannot notify the same user twice on the same day. Users who
 * disabled notifications are excluded by the WHERE clause.
 */
async function sendDailyHadith(sql: Sql): Promise<number | 'migration-required'> {
  const now = new Date()
  const today = notificationDay(now)
  let sentCount = 0
  let candidates
  try {
    candidates = await sql`
      SELECT u.id, u.preferred_lang, u.last_daily_hadith_sent_on
      FROM users u
      WHERE u.notifications_enabled = true
        AND (u.last_daily_hadith_sent_on IS NULL OR u.last_daily_hadith_sent_on < ${today}::date)
        AND EXISTS (SELECT 1 FROM push_subscriptions s WHERE s.user_id = u.id)
    `
  } catch (error) {
    // 42703 = undefined column: migration 004 has not been applied yet.
    if (typeof error === 'object' && error && 'code' in error && error.code === '42703') return 'migration-required'
    throw error
  }

  for (const profile of candidates) {
    const claimed = await sql`
      UPDATE users
      SET last_daily_hadith_sent_on = ${today}::date
      WHERE id = ${profile.id}
        AND notifications_enabled = true
        AND (last_daily_hadith_sent_on IS NULL OR last_daily_hadith_sent_on < ${today}::date)
      RETURNING id
    `
    if (claimed.length === 0) continue

    const payload = buildDailyHadithNotification(HADITHS, profile.preferred_lang, now)
    if (!payload) break
    const subs = await sql`
      SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ${profile.id}
    `
    let sentForUser = 0
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title: payload.title, body: payload.body, icon: payload.icon, tag: payload.tag }),
        )
        sentForUser++
        sentCount++
      } catch (error) {
        const statusCode = typeof error === 'object' && error && 'statusCode' in error
          ? Number(error.statusCode)
          : 0
        if (statusCode === 404 || statusCode === 410) {
          await sql`DELETE FROM push_subscriptions WHERE endpoint = ${sub.endpoint}`
        }
      }
    }

    // Nothing delivered: release the claim so a later run the same day may retry.
    if (sentForUser === 0) {
      await sql`
        UPDATE users
        SET last_daily_hadith_sent_on = ${profile.last_daily_hadith_sent_on ?? null}
        WHERE id = ${profile.id} AND last_daily_hadith_sent_on = ${today}::date
      `
    }
  }
  return sentCount
}
