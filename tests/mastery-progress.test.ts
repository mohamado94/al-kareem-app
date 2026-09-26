import { describe, expect, it } from 'vitest'
import { learningStepUnlocked, masteryTopics, topicMasteryProgress, TOPIC_MASTERY_TOTALS } from '@/lib/progress/mastery'
import { DEFAULT_PROGRESS, mergeProgress } from '@/lib/progress/types'

describe('validated learning progress', () => {
  it('does not convert legacy navigation percentages into proven mastery', () => {
    const legacy = { ...DEFAULT_PROGRESS, topics: { ...DEFAULT_PROGRESS.topics, alphabet: 100, positions: 100 } }
    expect(masteryTopics(legacy.validatedItems).alphabet).toBe(0)
    expect(masteryTopics(legacy.validatedItems).positions).toBe(0)
  })

  it('does not count a studied topic as a successful exercise', () => {
    const studiedOnly = { ...DEFAULT_PROGRESS, introducedTopics: { positions: true as const } }
    expect(topicMasteryProgress('positions', studiedOnly.validatedItems)).toBe(0)
  })

  it('advances proportionally for unique validated items only', () => {
    const items = { alphabet: { 'letter:alif': true as const } }
    expect(topicMasteryProgress('alphabet', items)).toBe(Math.floor(100 / TOPIC_MASTERY_TOTALS.alphabet))
    expect(topicMasteryProgress('alphabet', { alphabet: { ...items.alphabet, 'letter:alif': true } })).toBe(topicMasteryProgress('alphabet', items))
  })

  it('merges validation evidence from two devices without losing either item', () => {
    const first = { ...DEFAULT_PROGRESS, validatedItems: { alphabet: { 'letter:alif': true as const } } }
    const merged = mergeProgress(first, { validatedItems: { alphabet: { 'letter:ba': true } } })
    expect(Object.keys(merged.validatedItems.alphabet)).toEqual(expect.arrayContaining(['letter:alif', 'letter:ba']))
  })

  it('reaches 100 only after every required item is validated', () => {
    const almost = Object.fromEntries(Array.from({ length: TOPIC_MASTERY_TOTALS.alphabet - 1 }, (_, index) => [`letter:${index}`, true])) as Record<string, true>
    const complete = { ...almost, 'letter:final': true as const }
    expect(topicMasteryProgress('alphabet', { alphabet: almost })).toBeLessThan(100)
    expect(topicMasteryProgress('alphabet', { alphabet: complete })).toBe(100)
  })

  it('requires all guided language lessons for complete vocabulary mastery', () => {
    const twelveLessons = Object.fromEntries(Array.from({ length: 12 }, (_, index) => [`lesson:existing:${index}`, true])) as Record<string, true>
    expect(TOPIC_MASTERY_TOTALS.vocabulary).toBe(13)
    expect(topicMasteryProgress('vocabulary', { vocabulary: twelveLessons })).toBeLessThan(100)
    expect(topicMasteryProgress('vocabulary', { vocabulary: { ...twelveLessons, 'lesson:communication-day:0': true } })).toBe(100)
  })

  it('unlocks only the next ordered step after its exact prerequisite is complete', () => {
    const order = ['alphabet', 'positions', 'short-vowels']
    const incompleteAlphabet = { alphabet: Object.fromEntries(Array.from({ length: 27 }, (_, index) => [`letter:${index}`, true])) as Record<string, true> }
    expect(learningStepUnlocked('alphabet', order, {})).toBe(true)
    expect(learningStepUnlocked('positions', order, incompleteAlphabet)).toBe(false)
    const completeAlphabet = { alphabet: { ...incompleteAlphabet.alphabet, 'letter:final': true as const } }
    expect(learningStepUnlocked('positions', order, completeAlphabet)).toBe(true)
    expect(learningStepUnlocked('short-vowels', order, completeAlphabet)).toBe(false)
  })
})
