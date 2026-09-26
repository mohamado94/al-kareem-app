import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LETTERS } from '@/lib/data'
import { LETTER_RECORDED_AUDIO, letterRecordedAudio } from '@/lib/letter-recorded-audio'

describe('recorded alphabet audio', () => {
  it('maps every Arabic letter to one bundled MP3', () => {
    expect(Object.keys(LETTER_RECORDED_AUDIO)).toHaveLength(28)

    for (const letter of LETTERS) {
      const audioPath = letterRecordedAudio(letter)
      expect(audioPath, `missing audio mapping for ${letter.id}`).toBeTruthy()
      expect(existsSync(join(process.cwd(), 'public', audioPath!))).toBe(true)
    }
  })
})
