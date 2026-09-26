export type RecordedShortVowel = 'fatha' | 'kasra' | 'damma'

const SHORT_VOWEL_AUDIO_BASE = '/audio/short-vowels'

export function shortVowelRecordedAudio(letterId: string, vowel: RecordedShortVowel): string {
  return `${SHORT_VOWEL_AUDIO_BASE}/${vowel}/${letterId}.mp3`
}
