import { describe, expect, it } from 'vitest'
import { LETTERS } from '@/lib/data'
import { LETTER_PHONETICS } from '@/lib/letter-phonetics'
import { letterSpokenName } from '@/lib/letter-spoken-names'

function letter(id: string) {
  const value = LETTERS.find((item) => item.id === id)
  if (!value) throw new Error(`Unknown letter: ${id}`)
  return value
}

describe('Arabic alphabet audio labels', () => {
  it('uses fully vocalised Arabic citation forms for the reported letters', () => {
    expect(letterSpokenName(letter('tha'), 'ar')).toBe('ثَاء')
    expect(letterSpokenName(letter('ha'), 'ar')).toBe('حَاء')
    expect(letterSpokenName(letter('kha'), 'ar')).toBe('خَاء')
    expect(letterSpokenName(letter('dhal'), 'ar')).toBe('ذال')
    expect(letterSpokenName(letter('ra'), 'ar')).toBe('رَاء')
    expect(letterSpokenName(letter('zay'), 'ar')).toBe('زَايْ')
    expect(letterSpokenName(letter('sin'), 'ar')).toBe('سِيـن')
    expect(letterSpokenName(letter('shin'), 'ar')).toBe('شِينْ')
    expect(letterSpokenName(letter('sad'), 'ar')).toBe('صَاد')
    expect(letterSpokenName(letter('dad'), 'ar')).toBe('ضُود')
    expect(letterSpokenName(letter('taa'), 'ar')).toBe('طَاء')
    expect(letterSpokenName(letter('zaa'), 'ar')).toBe('ظُووو')
    expect(letterSpokenName(letter('fa'), 'ar')).toBe('فَا')
    expect(letterSpokenName(letter('qaf'), 'ar')).toBe('قُوووف')
    expect(letterSpokenName(letter('kaf'), 'ar')).toBe('كَافْ.')
    expect(letterSpokenName(letter('nun'), 'ar')).toBe('نُووون')
    expect(letterSpokenName(letter('ha2'), 'ar')).toBe('هَاءْ')
    expect(letterSpokenName(letter('waw'), 'ar')).toBe('وَاوْ.')
    expect(letterSpokenName(letter('ya'), 'ar')).toBe('يَا')
  })

  it('keeps corrected French position prompts distinct', () => {
    expect(LETTER_PHONETICS.tha.speakFr.name).toBe('Saaoun')
    expect(LETTER_PHONETICS.ha.speakFr.name).toBe('Haaoun')
    expect(LETTER_PHONETICS.kha.speakFr.name).toBe('Khaoun')
    expect(LETTER_PHONETICS.ra.speakFr.name).toBe('Rlaoune')
    expect(LETTER_PHONETICS.sad.speakFr.name).toBe('Sodoun')
    expect(LETTER_PHONETICS.dad.speakFr.name).toBe('Dodoun')
    expect(LETTER_PHONETICS.taa.speakFr.name).toBe('Tooun')
    expect(LETTER_PHONETICS.zaa.speakFr.name).toBe('Zooun')
    expect(LETTER_PHONETICS.ha2.speakFr.name).toBe('Haoune')
  })
})
