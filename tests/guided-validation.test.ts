import { describe, expect, it } from 'vitest'
import { addUniqueMistake, advanceCorrection, initialAttemptSummary } from '@/lib/guided-validation'
import { resolveVocabularyStimulus, variedWordOptions } from '@/components/screens/learn-screen'
import { VOCABULARY } from '@/lib/data'

describe('guided validation and correction flow', () => {
  it('counts a failed item only once in the initial result', () => {
    const mistakes = addUniqueMistake(addUniqueMistake([], 3), 3)
    expect(mistakes).toEqual([3])
    expect(initialAttemptSummary(10, mistakes)).toEqual({ score: 9, mistakes: 1 })
  })

  it('advances after feedback without requiring the answer to become correct', () => {
    expect(advanceCorrection([2, 7], 0, [2])).toEqual({ kind: 'next', position: 1 })
  })

  it('repeats only items still missed during correction', () => {
    expect(advanceCorrection([2, 7], 1, [7])).toEqual({ kind: 'repeat', queue: [7] })
  })

  it('completes only when the correction round has no remaining error', () => {
    expect(advanceCorrection([7], 0, [7])).toEqual({ kind: 'repeat', queue: [7] })
    expect(advanceCorrection([7], 0, [])).toEqual({ kind: 'complete' })
  })

  it('varies several number choices and the correct position between questions and sessions', () => {
    const numbers = VOCABULARY.find((group) => group.id === 'numbers')!.words
    expect(numbers).toHaveLength(10)
    const first = variedWordOptions(numbers[0], numbers, 101, 'fr')
    const second = variedWordOptions(numbers[1], numbers, 202, 'fr')
    const reopened = variedWordOptions(numbers[0], numbers, 303, 'fr')
    const secondWords = new Set(second.map((word) => word.word))
    expect(first.filter((word) => secondWords.has(word.word)).length).toBeLessThan(4)
    expect(reopened.map((word) => word.word)).not.toEqual(first.map((word) => word.word))
    expect(first.findIndex((word) => word.word === numbers[0].word)).not.toBe(reopened.findIndex((word) => word.word === numbers[0].word))
  })

  it('uses the exact Arabic numeral for every number instead of a generic picture', () => {
    const numbers = VOCABULARY.find((group) => group.id === 'numbers')!.words
    for (const word of numbers) {
      expect(resolveVocabularyStimulus('numbers', word, 'fr')).toEqual({ kind: 'number', value: word.meaning.ar })
    }
  })

  it('always gives vocabulary practice a meaningful stimulus', () => {
    for (const category of VOCABULARY) {
      for (const word of category.words) {
        const stimulus = resolveVocabularyStimulus(category.id, word, 'fr')
        expect(stimulus.value.trim()).not.toBe('')
        expect(stimulus.value).not.toBe('🖼️')
      }
    }
  })
})
