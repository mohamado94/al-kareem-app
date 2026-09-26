import { describe, expect, it } from 'vitest'
import { VOCABULARY } from '@/lib/learn-pre-guided-data'
import { relevantWordOptions, shuffledVocabularyIndexes, variedWordOptions, vocabularyVisualClue } from '@/components/screens/learn-screen'

describe('restored vocabulary practice', () => {
  it('substantially expands every requested everyday category', () => {
    const minimums: Record<string, number> = {
      daily: 24,
      family: 14,
      food: 12,
      numbers: 10,
      colors: 18,
      work: 12,
    }
    for (const [categoryId, minimum] of Object.entries(minimums)) {
      const category = VOCABULARY.find((item) => item.id === categoryId)
      expect(category, categoryId).toBeDefined()
      expect(category!.words.length, categoryId).toBeGreaterThanOrEqual(minimum)
      expect(new Set(category!.words.map((word) => word.word)).size, categoryId).toBe(category!.words.length)
      expect(category!.words.every((word) => word.translit && word.meaning.fr && word.meaning.ar && word.meaning.en), categoryId).toBe(true)
    }
  })

  it('uses each item once before repeating and changes order in a new session', () => {
    const first = shuffledVocabularyIndexes(24, 101)
    const resumed = shuffledVocabularyIndexes(24, 101)
    const nextSession = shuffledVocabularyIndexes(24, 202)
    expect(first).toEqual(resumed)
    expect(new Set(first).size).toBe(24)
    expect(first).not.toEqual(nextSession)
  })

  it('builds four unique, stable and renewed choices with one correct answer', () => {
    const category = VOCABULARY.find((item) => item.id === 'numbers')!
    const correct = category.words[0]
    const first = variedWordOptions(correct, category.words, 111, 'fr')
    const resumed = variedWordOptions(correct, category.words, 111, 'fr')
    const nextQuestion = variedWordOptions(category.words[1], category.words, 222, 'fr')
    expect(first).toEqual(resumed)
    expect(first).toHaveLength(4)
    expect(new Set(first.map((word) => word.word)).size).toBe(4)
    expect(first.filter((word) => word.word === correct.word)).toHaveLength(1)
    expect(nextQuestion.map((word) => word.word)).not.toEqual(first.map((word) => word.word))
    expect(relevantWordOptions(correct, category.words, 111, 'fr').every((word) => !/[\s؟،.!]/u.test(word.word))).toBe(true)
  })

  it('gives every displayed vocabulary item a real visual or contextual clue', () => {
    for (const category of VOCABULARY) {
      for (const word of category.words) {
        const clue = vocabularyVisualClue(category.id, word)
        expect(clue, `${category.id}:${word.word}`).not.toBe('🖼️')
        expect(clue.trim(), `${category.id}:${word.word}`).not.toBe('')
      }
    }
    const food = VOCABULARY.find((item) => item.id === 'food')!
    expect(vocabularyVisualClue('food', food.words.find((word) => word.meaning.fr === 'pomme')!)).toBe('🍎')
    expect(vocabularyVisualClue('food', food.words.find((word) => word.meaning.fr === 'poisson')!)).toBe('🐟')
    expect(vocabularyVisualClue('food', food.words.find((word) => word.meaning.fr === 'Le repas est délicieux')!)).toBe('🍽️')
  })
})
