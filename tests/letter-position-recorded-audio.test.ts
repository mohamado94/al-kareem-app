import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { POSITION_LABEL_AUDIO, letterPositionRecordedSequence } from '@/lib/letter-position-recorded-audio'

describe('recorded letter-position audio', () => {
  it('keeps the four French labels in their pedagogical order', () => {
    expect(Object.keys(POSITION_LABEL_AUDIO)).toEqual(['isolated', 'initial', 'medial', 'final'])
    expect(POSITION_LABEL_AUDIO.initial.end).toBeLessThan(POSITION_LABEL_AUDIO.medial.start!)
    expect(POSITION_LABEL_AUDIO.medial.end).toBeLessThan(POSITION_LABEL_AUDIO.final.start!)
  })

  it('plays the approved Arabic letter before its French position', () => {
    const sequence = letterPositionRecordedSequence('/audio/alphabet-elevenlabs/alif.mp3', 'initial')
    expect(sequence).toEqual([
      { src: '/audio/alphabet-elevenlabs/alif.mp3' },
      POSITION_LABEL_AUDIO.initial,
    ])
  })

  it('bundles both source recordings', () => {
    for (const segment of Object.values(POSITION_LABEL_AUDIO)) {
      expect(existsSync(join(process.cwd(), 'public', segment.src))).toBe(true)
    }
  })
})
