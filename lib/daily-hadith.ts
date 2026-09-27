import type { Hadith } from '@/lib/data'
import { localized } from '@/lib/i18n-content'

export type NotificationLang = 'fr' | 'en' | 'ar' | 'id' | 'ms'

export const NOTIFICATION_LANGS: readonly NotificationLang[] = ['fr', 'en', 'ar', 'id', 'ms']

/**
 * Notification titles. They reuse verbatim the existing `hadith.ofDay`
 * interface translations (lib/i18n.tsx and lib/i18n-extra.ts).
 */
export const DAILY_HADITH_TITLES: Record<NotificationLang, string> = {
  fr: 'Hadith du jour',
  en: 'Hadith of the day',
  ar: 'حديث اليوم',
  id: 'Hadits hari ini',
  ms: 'Hadis hari ini',
}

export const DAILY_HADITH_TAG = 'alkarim-daily-hadith'

function hash(text: string) {
  let value = 2166136261
  for (let index = 0; index < text.length; index++) {
    value ^= text.charCodeAt(index)
    value = Math.imul(value, 16777619)
  }
  return value >>> 0
}

/** A stable local-calendar rotation with no consecutive repetition. */
export function dailyHadithIndex(date: Date, count: number) {
  if (count <= 1) return 0
  const year = date.getFullYear()
  const dayOfYear = Math.floor((Date.UTC(year, date.getMonth(), date.getDate()) - Date.UTC(year, 0, 1)) / 86_400_000)
  const order = Array.from({ length: count }, (_, index) => index)
  let state = hash(String(year)) || 1
  for (let index = order.length - 1; index > 0; index--) {
    state = Math.imul(state ^ (state >>> 15), 1 | state)
    const target = (state >>> 0) % (index + 1)
    ;[order[index], order[target]] = [order[target], order[index]]
  }
  return order[dayOfYear % count]
}

/** Calendar day (UTC, YYYY-MM-DD) used as the anti-duplicate key of the push. */
export function notificationDay(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function normalizeNotificationLang(value: unknown): NotificationLang {
  return NOTIFICATION_LANGS.includes(value as NotificationLang) ? (value as NotificationLang) : 'fr'
}

/** True when a user has not yet received the daily hadith for `day`. */
export function shouldSendDailyHadith(lastSentOn: string | Date | null | undefined, day: string) {
  if (!lastSentOn) return true
  const last = typeof lastSentOn === 'string' ? lastSentOn.slice(0, 10) : notificationDay(lastSentOn)
  return last < day
}

/**
 * Builds the push payload for the hadith shown in the app on `date`. The
 * hadith text itself is never altered: Arabic users receive the Arabic text,
 * other languages receive the existing translation (id/ms use the existing
 * content fallback, as in the app).
 */
export function buildDailyHadithNotification(hadiths: readonly Hadith[], langValue: unknown, date: Date) {
  if (hadiths.length === 0) return null
  const lang = normalizeNotificationLang(langValue)
  const hadith = hadiths[dailyHadithIndex(date, hadiths.length)]
  const text = lang === 'ar' ? hadith.arabic : localized(hadith.translation, lang)
  const body = text.length > 180 ? `${text.slice(0, 177).trimEnd()}…` : text
  return {
    hadithId: hadith.id,
    title: DAILY_HADITH_TITLES[lang],
    body,
    icon: '/icon-192.png',
    tag: DAILY_HADITH_TAG,
  }
}
