import type { Lang } from '@/lib/prophet-titles'

export type LocalizedText = {
  fr: string
  ar: string
  en: string
  id?: string
  ms?: string
}

/** Resolve localized content with fallback: id/ms → en → fr */
export function localized(obj: LocalizedText, lang: Lang): string {
  if (lang === 'id') return obj.id ?? obj.en
  if (lang === 'ms') return obj.ms ?? obj.en
  return obj[lang]
}
