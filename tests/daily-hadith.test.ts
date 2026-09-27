import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { HADITHS } from '@/lib/data'
import {
  DAILY_HADITH_TAG,
  DAILY_HADITH_TITLES,
  NOTIFICATION_LANGS,
  buildDailyHadithNotification,
  dailyHadithIndex,
  notificationDay,
  shouldSendDailyHadith,
} from '@/lib/daily-hadith'
import { localized } from '@/lib/i18n-content'

describe('daily hadith notification', () => {
  it('uses the same hadith as the app for a given day and changes the next day', () => {
    const day = new Date(2026, 8, 27, 12)
    const next = new Date(2026, 8, 28, 12)
    const payload = buildDailyHadithNotification(HADITHS, 'fr', day)!
    expect(payload.hadithId).toBe(HADITHS[dailyHadithIndex(day, HADITHS.length)].id)
    expect(buildDailyHadithNotification(HADITHS, 'fr', new Date(2026, 8, 27, 20))!.hadithId).toBe(payload.hadithId)
    expect(buildDailyHadithNotification(HADITHS, 'fr', next)!.hadithId).not.toBe(payload.hadithId)
  })

  it('respects the chosen language without altering the hadith text', () => {
    const day = new Date(2026, 8, 27, 12)
    const hadith = HADITHS[dailyHadithIndex(day, HADITHS.length)]
    for (const lang of NOTIFICATION_LANGS) {
      const payload = buildDailyHadithNotification(HADITHS, lang, day)!
      expect(payload.title).toBe(DAILY_HADITH_TITLES[lang])
      expect(payload.tag).toBe(DAILY_HADITH_TAG)
      const source = lang === 'ar' ? hadith.arabic : localized(hadith.translation, lang)
      expect(source.startsWith(payload.body.replace(/…$/, ''))).toBe(true)
    }
    expect(buildDailyHadithNotification(HADITHS, 'xx', day)!.title).toBe(DAILY_HADITH_TITLES.fr)
  })

  it('reuses the existing "hadith.ofDay" interface translations for the title', () => {
    const dictionaries = readFileSync('lib/i18n.tsx', 'utf8') + readFileSync('lib/i18n-extra.ts', 'utf8')
    const existing = [...dictionaries.matchAll(/'hadith\.ofDay':\s*'([^']+)'/g)].map((m) => m[1])
    for (const lang of NOTIFICATION_LANGS) expect(existing).toContain(DAILY_HADITH_TITLES[lang])
  })

  it('sends at most once per day', () => {
    const today = notificationDay(new Date('2026-09-27T12:00:00Z'))
    expect(today).toBe('2026-09-27')
    expect(shouldSendDailyHadith(null, today)).toBe(true)
    expect(shouldSendDailyHadith('2026-09-26', today)).toBe(true)
    expect(shouldSendDailyHadith('2026-09-27', today)).toBe(false)
    expect(shouldSendDailyHadith(new Date('2026-09-27T00:00:00Z'), today)).toBe(false)
  })

  it('claims each user atomically for the day and skips disabled notifications', () => {
    const route = readFileSync('app/api/notifications/check-reminders/route.ts', 'utf8')
    const claim = route.slice(route.indexOf('SET last_daily_hadith_sent_on = ${today}'))
    expect(claim).toMatch(/notifications_enabled = true/)
    expect(claim).toMatch(/last_daily_hadith_sent_on IS NULL OR last_daily_hadith_sent_on < \$\{today\}::date/)
    expect(claim).toMatch(/RETURNING id/)
    expect(readFileSync('db/migrations/004_daily_hadith_notification.sql', 'utf8')).toMatch(/ADD COLUMN IF NOT EXISTS last_daily_hadith_sent_on DATE/)
  })
})
