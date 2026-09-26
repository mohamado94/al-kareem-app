import type { Lang } from '@/lib/i18n'
import { GRAMMAR, HARAKAT, LETTERS, PHRASES, VOCABULARY } from '@/lib/learn-pre-guided-data'
import { LETTER_PHONETICS } from '@/lib/letter-phonetics'
import { pedagogicalPositionGlyph } from '@/lib/letter-position-glyphs'

export type DailyQuestion = {
  id: string
  module: string
  promptGlyph?: string
  audioText?: string
  options: { text: string; arabic?: boolean }[]
  answerIndex: number
}

function hash(text: string) {
  let value = 2166136261
  for (let i = 0; i < text.length; i++) {
    value ^= text.charCodeAt(i)
    value = Math.imul(value, 16777619)
  }
  return value >>> 0
}

function random(seed: number) {
  let state = seed || 1
  return () => {
    state = Math.imul(state ^ (state >>> 15), 1 | state)
    state ^= state + Math.imul(state ^ (state >>> 7), 61 | state)
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: T[], rnd: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function localized(value: { fr: string; ar: string; en: string }, lang: Lang) {
  return value[lang === 'ar' || lang === 'en' ? lang : 'fr']
}

function optionQuestion(
  id: string,
  module: string,
  promptGlyph: string | undefined,
  audioText: string | undefined,
  correct: { text: string; arabic?: boolean },
  distractors: { text: string; arabic?: boolean }[],
  rnd: () => number,
): DailyQuestion {
  const seen = new Set([correct.text])
  const uniqueDistractors = distractors.filter((option) => {
    if (!option.text || seen.has(option.text)) return false
    seen.add(option.text)
    return true
  })
  const options = shuffle([correct, ...shuffle(uniqueDistractors, rnd).slice(0, 3)], rnd)
  return { id, module, promptGlyph, audioText, options, answerIndex: options.indexOf(correct) }
}

/**
 * Builds a shuffled session from the complete learning catalogue. The optional
 * session seed keeps an in-progress quiz stable across reloads, while a new
 * session receives a new selection and order.
 */
export function buildDailyQuestions(
  exerciseType: string,
  topics: Record<string, number>,
  lang: Lang,
  date = new Date(),
  sessionSeed = date.toISOString().slice(0, 10),
  validatedItems?: Record<string, Record<string, true>>,
  introducedTopics?: Record<string, true>,
): DailyQuestion[] {
  const day = date.toISOString().slice(0, 10)
  const rnd = random(hash(`${day}|${exerciseType}|${lang}|${sessionSeed}`))
  const pools: DailyQuestion[][] = []
  // Exercises grow with the learner: only completed/started material is used.
  const alphabetEvidence = Object.keys(validatedItems?.alphabet ?? {})
  const learnedLetters = validatedItems
    ? LETTERS.filter((letter) => alphabetEvidence.includes(`letter:${letter.id}`))
    : LETTERS.slice(0, (topics.alphabet ?? 0) > 0 ? Math.ceil(LETTERS.length * ((topics.alphabet ?? 0) / 100)) : 8)

  // Alphabet: visual recognition or sound recognition, depending on exercise type.
  const alphabetPool = shuffle(learnedLetters, rnd).slice(0, 10).map((letter, index) => {
    const audioMode = exerciseType === 'listen' || exerciseType === 'match'
    const correct = audioMode
      ? { text: letter.glyph, arabic: true }
      : { text: LETTER_PHONETICS[letter.id]?.nameAr ?? letter.name, arabic: true }
    const distractors = LETTERS.filter((l) => l.id !== letter.id).map((l) => ({
      text: audioMode ? l.glyph : (LETTER_PHONETICS[l.id]?.nameAr ?? l.name),
      arabic: true,
    }))
    return optionQuestion(
      `alphabet-${index}-${letter.id}`,
      'alphabet',
      audioMode ? undefined : letter.glyph,
      audioMode ? (LETTER_PHONETICS[letter.id]?.nameAr ?? letter.glyph) : undefined,
      correct,
      distractors,
      rnd,
    )
  })
  if (alphabetPool.length) pools.push(alphabetPool)

  {
    const positions = ['isolated', 'initial', 'medial', 'final'] as const
    const positionPool = shuffle(learnedLetters, rnd).slice(0, 10).map((letter, index) => {
      const position = positions[Math.floor(rnd() * positions.length)]
      const correct = { text: LETTER_PHONETICS[letter.id]?.nameAr ?? letter.name, arabic: true }
      const distractors = LETTERS.filter((l) => l.id !== letter.id).map((l) => ({
        text: LETTER_PHONETICS[l.id]?.nameAr ?? l.name,
        arabic: true,
      }))
      return optionQuestion(
        `positions-${index}-${letter.id}-${position}`,
        'positions',
        pedagogicalPositionGlyph(letter, position),
        undefined,
        correct,
        distractors,
        rnd,
      )
    })
    if (introducedTopics?.positions || (!validatedItems && (topics.positions ?? 0) > 0)) pools.push(positionPool)
  }

  const vowelModules = [
    { id: 'short-vowels', marks: [HARAKAT.fatha, HARAKAT.kasra, HARAKAT.damma], keys: ['shortFatha', 'shortKasra', 'shortDamma'] as const },
    { id: 'long-vowels', marks: [`${HARAKAT.fatha}${HARAKAT.alif}`, `${HARAKAT.kasra}${HARAKAT.ya}`, `${HARAKAT.damma}${HARAKAT.waw}`], keys: ['longAlif', 'longYa', 'longWaw'] as const },
    { id: 'tanwin', marks: [`${HARAKAT.tanwinFath}${HARAKAT.alif}`, HARAKAT.tanwinKasr, HARAKAT.tanwinDamm], keys: ['tanwinAn', 'tanwinIn', 'tanwinUn'] as const },
  ]

  for (const module of vowelModules) {
    const candidates = learnedLetters.flatMap((letter) => module.marks.map((mark, formIndex) => {
      const phonetics = LETTER_PHONETICS[letter.id]
      const correctText = phonetics?.speakFr[module.keys[formIndex]] ?? ''
      const alternatives = module.keys
        .map((key) => phonetics?.speakFr[key] ?? '')
        .filter((text) => text && text !== correctText)
      const otherLetters = LETTERS
        .filter((l) => l.id !== letter.id)
        .map((l) => LETTER_PHONETICS[l.id]?.speakFr[module.keys[formIndex]] ?? '')
        .filter(Boolean)
      return optionQuestion(
        `${module.id}-${letter.id}-${formIndex}`,
        module.id,
        `${letter.glyph}${mark}`,
        undefined,
        { text: correctText },
        [...alternatives, ...otherLetters].map((text) => ({ text })),
        rnd,
      )
    }))
    if (introducedTopics?.[module.id] || (!validatedItems && (topics[module.id] ?? 0) > 0)) pools.push(shuffle(candidates, rnd).slice(0, 10))
  }

  {
    const allVocabulary = [...VOCABULARY.flatMap((group) => group.words), ...PHRASES]
    const vocabularyEvidence = Object.keys(validatedItems?.vocabulary ?? {})
    const learnedVocabularyCount = Math.ceil(allVocabulary.length * ((topics.vocabulary ?? 0) / 100))
    const words = validatedItems
      ? allVocabulary.filter((word) => vocabularyEvidence.some((item) => item.endsWith(`:${word.word}`)))
      : allVocabulary.slice(0, learnedVocabularyCount)
    const wordPool = shuffle(words, rnd).slice(0, 10).map((word, index) => optionQuestion(
      `word-${index}-${word.word}`,
      'vocabulary',
      word.word,
      undefined,
      { text: localized(word.meaning, lang) },
      allVocabulary.filter((w) => w.word !== word.word).map((w) => ({ text: localized(w.meaning, lang) })),
      rnd,
    ))
    if (wordPool.length) pools.push(wordPool)
  }

  const grammarEvidence = Object.keys(validatedItems?.grammar ?? {})
  if (GRAMMAR.length > 1 && (grammarEvidence.length > 0 || (!validatedItems && (topics.grammar ?? 0) > 0))) {
    const learnedGrammarCount = Math.max(1, Math.ceil(GRAMMAR.length * ((topics.grammar ?? 0) / 100)))
    const learnedGrammar = validatedItems
      ? GRAMMAR.filter((point) => grammarEvidence.includes(`rule:${point.id}`))
      : GRAMMAR.slice(0, learnedGrammarCount)
    const grammarPool = learnedGrammar.map((point, index) => optionQuestion(
      `grammar-${index}-${point.id}`,
      'grammar',
      point.example,
      undefined,
      { text: localized(point.title, lang) },
      GRAMMAR.filter((p) => p.id !== point.id).map((p) => ({ text: localized(p.title, lang) })),
      rnd,
    ))
    pools.push(grammarPool)
  }

  // Guarantee at least one question from every learning family, then fill the
  // session from the complete shuffled catalogue.
  // A brand-new account receives no unknown material. The UI invites the
  // learner to validate the first lesson before starting daily exercises.
  const shuffledPools = shuffle(pools, rnd)
  const count = 8 + (hash(`${day}|count|${exerciseType}|${sessionSeed}`) % 3)
  const selected = shuffledPools.flatMap((pool) => pool[0] ? [pool[0]] : [])
  const remaining = shuffle(shuffledPools.flatMap((pool) => pool.slice(1)), rnd)
  return shuffle([...selected, ...remaining.slice(0, Math.max(0, count - selected.length))], rnd)
}
