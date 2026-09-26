import { describe, expect, it } from 'vitest'
import { LETTERS } from '@/lib/data'
import { pronunciationMatches, recognitionLang } from '@/lib/letter-spoken-names'
import { wordPronunciationMatches } from '@/components/screens/learn-screen'

describe('letter pronunciation recognition', () => {
  const alif = LETTERS.find((letter) => letter.id === 'alif')!

  it('uses the learner interface language for browser transcription', () => {
    expect(recognitionLang('fr')).toBe('fr-FR')
    expect(recognitionLang('ar')).toBe('ar-SA')
  })

  it('accepts the reviewed French name Alifoun and common transcription spacing', () => {
    expect(pronunciationMatches('Alifoun', alif, 'fr')).toBe(true)
    expect(pronunciationMatches('alif oun', alif, 'fr')).toBe(true)
  })

  it('does not accept unrelated speech', () => {
    expect(pronunciationMatches('bonjour', alif, 'fr')).toBe(false)
  })

  it('matches a vocalised Arabic word after removing its vowel marks', () => {
    expect(wordPronunciationMatches('كَتَبَ', 'كَتَبَ')).toBe(true)
    expect(wordPronunciationMatches('كتب', 'كَتَبَ')).toBe(true)
    expect(wordPronunciationMatches('ذهب', 'كَتَبَ')).toBe(false)
  })
})
