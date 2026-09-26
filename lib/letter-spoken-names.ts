import type { Letter } from '@/lib/data'
import type { Lang } from '@/lib/i18n'
import { LETTER_PHONETICS } from '@/lib/letter-phonetics'

// Fully vocalised citation forms used only by the Arabic neural voice.
// The final sukūn prevents the synthesiser from inventing a case ending or
// adding a stray vowel (for example "dhāli", "rāf" or "nān").
const ARABIC_TTS_LETTER_NAMES: Record<string, string> = {
  // Hamed reads the final sukūn on this particular name incorrectly.
  // The standard fully marked spelling without it produces "Thāʾ".
  tha: 'ثَاء',
  jim: 'جِيمْ',
  ha: 'حَاء',
  kha: 'خَاء',
  dhal: 'ذال',
  ra: 'رَاء',
  zay: 'زَايْ',
  // Tatweel after the long ya makes Hamed sustain the ī instead of
  // collapsing the name into a short "san" sound.
  sin: 'سِيـن',
  shin: 'شِينْ',
  sad: 'صَاد',
  // Pronunciation hint for the Saudi neural voice: keep the displayed name
  // ضَاد unchanged, but force the requested "Dôd/Dood" sound in audio.
  dad: 'ضُود',
  taa: 'طَاء',
  // Pronunciation hint: force the voiced emphatic "Zô" requested for ظ.
  zaa: 'ظُووو',
  ayn: 'عَيْنْ',
  ghayn: 'غَيْنْ',
  // Omit the final hamza in the hidden TTS hint so the voice says a clean
  // "Fa" instead of turning the glottal stop into an audible "fat".
  fa: 'فَا',
  // Hidden TTS hint for the requested deep, prolonged "Qooof" sound.
  qaf: 'قُوووف',
  // Final sukūn plus a full stop prevents an invented "i" case ending.
  kaf: 'كَافْ.',
  mim: 'مِيمْ',
  // Hidden TTS hint to sustain the requested "Noune" sound.
  nun: 'نُووون',
  ha2: 'هَاءْ',
  // Final sukūn and punctuation keep the ending on Waw instead of "wane".
  waw: 'وَاوْ.',
  // Omit the final hamza in the hidden hint for a clean, prolonged "Yaa".
  ya: 'يَا',
}

/** Spoken letter name for TTS (Écouter button). */
export function letterSpokenName(letter: Letter, lang: Lang): string {
  const p = LETTER_PHONETICS[letter.id]
  if (!p) return letter.name
  if (lang === 'fr') return p.speakFr.name
  if (lang === 'ar') return ARABIC_TTS_LETTER_NAMES[letter.id] ?? p.nameAr
  return p.nameEn
}

/** Display name with tanwin (e.g. Ha-un, Khoun, Zaloon). */
export function letterDisplayName(letter: Letter, lang: Lang): string {
  const p = LETTER_PHONETICS[letter.id]
  if (!p) return letter.name
  return p.nameAr
}

/** Name used in position phrases (Ha-un isolé, Khoun au début…). */
export function letterPhraseName(letter: Letter, lang: Lang): string {
  const p = LETTER_PHONETICS[letter.id]
  if (!p) return letter.name
  if (lang === 'fr') return p.speakFr.name
  if (lang === 'ar') return p.nameAr
  return p.nameEn
}

/** Use the interface language so the browser transcribes the learner naturally. */
export function recognitionLang(lang: Lang): string {
  const map: Record<Lang, string> = {
    fr: 'fr-FR',
    en: 'en-US',
    ar: 'ar-SA',
    id: 'id-ID',
    ms: 'ms-MY',
  }
  return map[lang] ?? 'fr-FR'
}

function normalizeLatin(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

function normalizeAr(s: string): string {
  return s
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    .replace(/\u0629/g, '\u0647')
    .replace(/\u0649/g, '\u064A')
    .replace(/[^\u0621-\u064A]/g, '')
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (!m) return n
  if (!n) return m
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) d[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
    }
  }
  return d[m][n]
}

function fuzzyMatch(spoken: string, expected: string, isArabic: boolean): boolean {
  const s = isArabic ? normalizeAr(spoken) : normalizeLatin(spoken)
  const e = isArabic ? normalizeAr(expected) : normalizeLatin(expected)
  if (!s || !e) return false
  if (s === e) return true
  if (e.length >= 4 && (s.includes(e) || e.includes(s))) return true
  const tolerance = e.length >= 7 ? 2 : e.length >= 5 ? 1 : 0
  return levenshtein(s, e) <= tolerance
}

/** Reject shortened wrong pronunciations (Bé, Té, Sé…) per official guide. */
function isRejectedShortForm(spoken: string): boolean {
  const s = normalizeLatin(spoken)
  const banned = new Set([
    'be', 'te', 'se', 'de', 'fe', 'ke', 'le', 'me', 'ne', 're', 'ze', 'ge', 'je',
    'che', 'the', 'b', 't', 's', 'd', 'f', 'k', 'l', 'm', 'n', 'r', 'z',
  ])
  return banned.has(s)
}

/** Acceptable pronunciations per letter (speech recognition aliases). */
function pronunciationAliases(letter: Letter, lang: Lang): string[] {
  const primary = letterSpokenName(letter, lang)
  const p = LETTER_PHONETICS[letter.id]

  if (lang === 'ar' && p) {
    return [primary, p.nameAr, letter.glyph]
  }

  if (lang === 'fr' && p) {
    const base = normalizeLatin(p.nameFr)
    const variants = [primary, p.nameFr, p.nameEn, p.speakFr.name, p.nameAr, letter.glyph]
    if (base.endsWith('oon')) variants.push(base.replace(/oon$/, 'oun'))
    if (base.endsWith('un')) variants.push(base.replace(/un$/, 'oun'))
    if (letter.id === 'dhal') variants.push('zaloon', 'zaloun', 'zalun')
    if (letter.id === 'ha') variants.push('haoun', 'haun', 'ha')
    if (letter.id === 'kha') variants.push('khoun', 'khaoun')
    if (letter.id === 'sad') variants.push('sodoun', 'soudoun', 'sodun', 'ssodoun')
    if (letter.id === 'dad') variants.push('do', 'doudoun', 'dod', 'ddo')
    if (letter.id === 'taa') variants.push('taoun', 'ta-oun', 'taun', 'tououn')
    if (letter.id === 'zaa') variants.push('zaun', 'zooun', 'zzaun', 'zzoun')
    return [...new Set(variants)]
  }

  if (p) return [primary, p.nameEn, p.nameAr, letter.glyph]
  return [primary]
}

/** Whether the learner's utterance matches the expected letter name. */
export function pronunciationMatches(transcript: string, letter: Letter, lang: Lang): boolean {
  if (isRejectedShortForm(transcript)) return false
  const aliases = pronunciationAliases(letter, lang)
  const transcriptIsArabic = /[\u0600-\u06ff]/.test(transcript)
  return aliases.some((alias) => {
    const aliasIsArabic = /[\u0600-\u06ff]/.test(alias)
    return transcriptIsArabic === aliasIsArabic && fuzzyMatch(transcript, alias, transcriptIsArabic)
  })
}
