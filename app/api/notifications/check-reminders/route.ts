import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { getDb, isDatabaseConfigured } from '@/lib/db'

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

  return NextResponse.json({ ok: true, sent })
}
