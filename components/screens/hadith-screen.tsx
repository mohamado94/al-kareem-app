'use client'

import { BadgeCheck } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { localized } from '@/lib/i18n-content'
import { ScreenHeader } from '@/components/ui-bits'
import { ListenCircle } from '@/components/audio-button'
import { HADITHS } from '@/lib/data'

export function HadithScreen() {
  const { t, lang } = useI18n()

  return (
    <div>
      <ScreenHeader title={t('hadith.section')} subtitle={t('hadith.sectionSub')} />

      <div className="flex flex-col gap-4 px-5 pb-6">
        {HADITHS.length === 0 && (
          <div className="relief-panel rounded-3xl p-6 text-center">
            <p className="text-sm font-semibold text-foreground">Hadiths en cours de vérification</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Aucun hadith n’est publié pour le moment. Chaque texte sera ajouté uniquement après vérification de sa source et validation.
            </p>
          </div>
        )}
        {HADITHS.map((h, i) => (
          <article
            key={h.id}
            className="relief-panel relative overflow-hidden rounded-3xl p-5"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -end-10 -top-12 h-40 w-40 rounded-full opacity-60 blur-2xl"
              style={{ background: 'var(--relief-glow)' }}
            />

            <div className="relative flex items-center justify-between">
              <span className="rounded-full bg-primary/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {i === 0 ? t('hadith.ofDay') : `${i + 1} / ${HADITHS.length}`}
              </span>
              <ListenCircle text={h.arabic} label={t('hadith.listen')} />
            </div>

            <p
              dir="rtl"
              className="font-arabic relative mt-4 text-pretty text-[24px] leading-[2] text-foreground"
            >
              {h.arabic}
            </p>

            {lang !== 'ar' && (
              <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">
                {localized(h.translation, lang)}
              </p>
            )}

            {h.details && (
              <div className="relative mt-4 rounded-2xl border border-border/60 bg-background/45 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">Détails</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{h.details}</p>
              </div>
            )}

            <div className="relative mt-4 flex items-center justify-between border-t border-border/60 pt-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">
                  {t('hadith.narrated')} {localized(h.narrator, lang)}
                </p>
                <a href={h.sourceUrl} target="_blank" rel="noreferrer" className="block truncate text-[11px] text-primary underline-offset-2 hover:underline">{h.source}</a>
                {h.referenceDetails && <p className="mt-0.5 text-[10px] text-muted-foreground">{h.referenceDetails}</p>}
              </div>
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                <BadgeCheck className="h-3.5 w-3.5" />
                {localized(h.grade, lang)}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
