'use client'

import { BookOpenText, BadgeCheck } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { localized } from '@/lib/i18n-content'
import { ListenCircle } from '@/components/audio-button'
import { HADITHS } from '@/lib/data'

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

export function HadithSection() {
  const { t, lang } = useI18n()
  if (HADITHS.length === 0) return null

  // Stable during the user's local day, then rotates the following day.
  const dailyHadith = HADITHS[dailyHadithIndex(new Date(), HADITHS.length)]

  return (
    <section className="pt-6">
      <div className="flex items-center gap-2 px-5">
        <BookOpenText className="h-4 w-4 text-primary" />
        <div>
          <h2 className="gold-text text-sm font-semibold leading-tight">{t('hadith.section')}</h2>
          <p className="text-[11px] text-muted-foreground">{t('hadith.sectionSub')}</p>
        </div>
      </div>

      <div className="mt-3 px-5 pb-2">
          <article
            key={dailyHadith.id}
            className="relief-panel relative w-full overflow-hidden rounded-3xl p-5"
          >
            {/* decorative glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -end-10 -top-12 h-36 w-36 rounded-full opacity-60 blur-2xl"
              style={{ background: 'var(--relief-glow)' }}
            />

            <div className="relative flex items-center justify-between">
              <span className="rounded-full bg-primary/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {t('hadith.ofDay')}
              </span>
              <ListenCircle text={dailyHadith.arabic} label={t('hadith.listen')} />
            </div>

            {/* Arabic text */}
            <p
              dir="rtl"
              className="font-arabic relative mt-4 text-pretty text-[22px] leading-[1.9] text-foreground"
            >
              {dailyHadith.arabic}
            </p>

            {/* Translation (skip when already showing Arabic) */}
            {lang !== 'ar' && (
              <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">
                {localized(dailyHadith.translation, lang)}
              </p>
            )}

            {dailyHadith.details && (
              <p className="relative mt-3 text-xs leading-relaxed text-muted-foreground">{dailyHadith.details}</p>
            )}

            <div className="relative mt-4 flex items-center justify-between border-t border-border/60 pt-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">
                  {t('hadith.narrated')} {localized(dailyHadith.narrator, lang)}
                </p>
                <a href={dailyHadith.sourceUrl} target="_blank" rel="noreferrer" className="block truncate text-[11px] text-primary underline-offset-2 hover:underline">{dailyHadith.source}</a>
                {dailyHadith.referenceDetails && <p className="mt-0.5 text-[10px] text-muted-foreground">{dailyHadith.referenceDetails}</p>}
              </div>
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                <BadgeCheck className="h-3.5 w-3.5" />
                {localized(dailyHadith.grade, lang)}
              </span>
            </div>
          </article>
      </div>
    </section>
  )
}
