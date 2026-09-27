import { describe, expect, it } from 'vitest'
import { buildDailyQuestions, promptRevealsAnswer, sharedSlots, type DailyQuestion } from '@/lib/daily-exercises'
import { seededShuffle } from '@/lib/exercise-shuffle'
import { variedWordOptions } from '@/components/screens/learn-screen'
import { VOCABULARY } from '@/lib/learn-pre-guided-data'
import { localized } from '@/lib/i18n-content'

const topics = { alphabet: 100, positions: 100, 'short-vowels': 100, 'long-vowels': 100, tanwin: 100, vocabulary: 100, grammar: 100 }
const types = ['choose', 'match', 'listen', 'place', 'complete']
const date = new Date('2026-09-27T10:00:00Z')

function session(type: string, seed: string) {
  return buildDailyQuestions(type, topics, 'fr', date, seed)
}

describe('daily exercises: randomness and answer leaks', () => {
  it('produces a different question order for two new sessions', () => {
    for (const type of types) {
      const a = session(type, 'session-a').map((q) => q.id)
      const b = session(type, 'session-b').map((q) => q.id)
      expect(a.length).toBeGreaterThan(0)
      expect(a).not.toEqual(b)
    }
  })

  it('keeps a restored session identical (same seed → same questions and choices)', () => {
    for (const type of types) {
      expect(session(type, 'restored-seed')).toEqual(session(type, 'restored-seed'))
    }
  })

  it('has exactly one correct answer per question and never shows the answer in the prompt', () => {
    for (const type of types) {
      for (let s = 0; s < 40; s++) {
        for (const q of session(type, `leak-${s}`)) {
          const texts = q.options.map((o) => o.text)
          expect(new Set(texts).size).toBe(texts.length)
          expect(q.answerIndex).toBeGreaterThanOrEqual(0)
          expect(q.answerIndex).toBeLessThan(q.options.length)
          expect(promptRevealsAnswer(q)).toBe(false)
          if (q.promptGlyph) expect(q.promptGlyph).not.toBe(q.options[q.answerIndex].text)
        }
      }
    }
  })

  it('spreads the correct answer over all positions', () => {
    const counts = [0, 0, 0, 0]
    let total = 0
    for (const type of types) {
      for (let s = 0; s < 150; s++) {
        for (const q of session(type, `pos-${s}`)) {
          if (q.options.length !== 4) continue
          counts[q.answerIndex]++
          total++
        }
      }
    }
    for (const count of counts) {
      expect(count / total).toBeGreaterThan(0.17)
      expect(count / total).toBeLessThan(0.33)
    }
  })

  it('repositions every choice between consecutive questions (no "one choice changed" pattern)', () => {
    let pairs = 0
    let echoed = 0
    let tripleRuns = 0
    for (const type of types) {
      for (let s = 0; s < 60; s++) {
        const qs: DailyQuestion[] = session(type, `slots-${s}`)
        for (let i = 1; i < qs.length; i++) {
          pairs++
          if (sharedSlots(qs[i - 1], qs[i]) > 0) echoed++
          if (i > 1 && qs[i].answerIndex === qs[i - 1].answerIndex && qs[i - 1].answerIndex === qs[i - 2].answerIndex) tripleRuns++
        }
      }
    }
    expect(pairs).toBeGreaterThan(100)
    expect(echoed / pairs).toBeLessThan(0.02)
    expect(tripleRuns / pairs).toBeLessThan(0.02)
  })
})

describe('guided lesson choices (variedWordOptions)', () => {
  const words = VOCABULARY.flatMap((group) => group.words)

  it('stays stable for a restored question and changes for a new session', () => {
    const first = variedWordOptions(words[3], words, 4242, 'fr')
    expect(variedWordOptions(words[3], words, 4242, 'fr')).toEqual(first)
    const others = [1, 2, 3, 4, 5].map((seed) => variedWordOptions(words[3], words, seed, 'fr').map((w) => w.word))
    expect(others.some((order) => order.join() !== first.map((w) => w.word).join())).toBe(true)
  })

  it('never offers a distractor with the same displayed meaning as the correct answer', () => {
    for (const correct of words) {
      const options = variedWordOptions(correct, words, 99, 'fr')
      const labels = options.map((w) => localized(w.meaning, 'fr'))
      expect(new Set(labels).size).toBe(labels.length)
      expect(options.filter((w) => w.word === correct.word)).toHaveLength(1)
    }
  })

  it('does not keep shared choices at the same slot from one question to the next', () => {
    const numbers = VOCABULARY.find((group) => group.id === 'numbers')!.words
    let frozenPairs = 0
    let pairsWithShared = 0
    for (let seed = 1; seed <= 50; seed++) {
      for (let i = 1; i < numbers.length; i++) {
        const prev = variedWordOptions(numbers[i - 1], numbers, seed, 'fr').map((w) => w.word)
        const cur = variedWordOptions(numbers[i], numbers, seed, 'fr').map((w) => w.word)
        const shared = cur.filter((word) => prev.includes(word))
        if (shared.length < 2) continue
        pairsWithShared++
        if (shared.every((word) => prev.indexOf(word) === cur.indexOf(word))) frozenPairs++
      }
    }
    expect(pairsWithShared).toBeGreaterThan(0)
    expect(frozenPairs / pairsWithShared).toBeLessThan(0.15)
  })

  it('places the correct answer at every position', () => {
    const counts = [0, 0, 0, 0]
    for (let seed = 1; seed <= 200; seed++) {
      for (const correct of words.slice(0, 20)) {
        counts[variedWordOptions(correct, words, seed, 'fr').findIndex((w) => w.word === correct.word)]++
      }
    }
    for (const count of counts) expect(count / 4000).toBeGreaterThan(0.18)
  })
})

describe('seededShuffle', () => {
  it('is a deterministic permutation that depends on the key', () => {
    const items = Array.from({ length: 10 }, (_, i) => i)
    expect(seededShuffle(items, 'k')).toEqual(seededShuffle(items, 'k'))
    expect([...seededShuffle(items, 'k')].sort((a, b) => a - b)).toEqual(items)
    expect(seededShuffle(items, 'k1')).not.toEqual(seededShuffle(items, 'k2'))
  })
})
