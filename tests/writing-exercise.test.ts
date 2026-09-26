import { describe, expect, it } from 'vitest'
import { isWritingAnswerCorrect, type WritingPiece } from '@/components/screens/learn-screen'

const piece = (base: string, position: WritingPiece['position']): WritingPiece => ({ id: `${base}-${position}`, base, display: base, position })

describe('Arabic writing exercise validation', () => {
  it('accepts باب when its ordered letters are correct despite contextual glyph metadata', () => {
    const target = [piece('بَ', 'initial'), piece('ا', 'final'), piece('ب', 'isolated')]
    const answer = [piece('ب', 'initial'), piece('ا', 'final'), piece('ب', 'final')]
    expect(isWritingAnswerCorrect(answer, target)).toBe(true)
  })

  it('rejects a wrong letter or a wrong order', () => {
    const target = [piece('بَ', 'initial'), piece('ا', 'final'), piece('ب', 'isolated')]
    expect(isWritingAnswerCorrect([piece('ت', 'initial'), piece('ا', 'final'), piece('ب', 'isolated')], target)).toBe(false)
    expect(isWritingAnswerCorrect([piece('ب', 'initial'), piece('ب', 'isolated'), piece('ا', 'final')], target)).toBe(false)
  })
})
