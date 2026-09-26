import type { Letter } from '@/lib/data'
import type { Lang } from '@/lib/i18n'
import { letterPhraseName } from '@/lib/letter-spoken-names'

export type LetterPosition = 'isolated' | 'initial' | 'medial' | 'final'

const POSITION_PHRASE: Record<Lang, Record<LetterPosition, (name: string) => string>> = {
  fr: {
    isolated: (n) => `${n} isolé`,
    initial: (n) => `${n} au début`,
    medial: (n) => `${n} au milieu`,
    final: (n) => `${n} à la fin`,
  },
  en: {
    isolated: (n) => `${n} isolated`,
    initial: (n) => `${n} at the beginning`,
    medial: (n) => `${n} in the middle`,
    final: (n) => `${n} at the end`,
  },
  ar: {
    isolated: (n) => `${n} منفصلة`,
    initial: (n) => `${n} في البداية`,
    medial: (n) => `${n} في الوسط`,
    final: (n) => `${n} في النهاية`,
  },
  id: {
    isolated: (n) => `${n} terpisah`,
    initial: (n) => `${n} di awal`,
    medial: (n) => `${n} di tengah`,
    final: (n) => `${n} di akhir`,
  },
  ms: {
    isolated: (n) => `${n} terpisah`,
    initial: (n) => `${n} di awal`,
    medial: (n) => `${n} di tengah`,
    final: (n) => `${n} di akhir`,
  },
}

/** Full spoken phrase for a letter in a given positional form. */
export function letterPositionPhrase(
  letter: Letter,
  position: LetterPosition,
  lang: Lang,
): string {
  const name = letterPhraseName(letter, lang)
  const builder = POSITION_PHRASE[lang] ?? POSITION_PHRASE.fr
  return builder[position](name)
}
