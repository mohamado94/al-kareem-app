import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LETTERS } from '@/lib/data'
import { shortVowelRecordedAudio, type RecordedShortVowel } from '@/lib/short-vowel-recorded-audio'

describe('recorded short-vowel audio', () => {
  it('bundles one non-empty MP3 for every letter and each short vowel', () => {
    const vowels: RecordedShortVowel[] = ['fatha', 'kasra', 'damma']

    for (const vowel of vowels) {
      for (const letter of LETTERS) {
        const audioPath = shortVowelRecordedAudio(letter.id, vowel)
        const absolutePath = join(process.cwd(), 'public', audioPath)
        expect(existsSync(absolutePath), `missing ${vowel} audio for ${letter.id}`).toBe(true)
        expect(statSync(absolutePath).size, `empty ${vowel} audio for ${letter.id}`).toBeGreaterThan(1_000)
      }
    }
  })
})
