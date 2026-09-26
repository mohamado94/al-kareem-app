import type { Letter } from '@/lib/data'

const ALPHABET_AUDIO_BASE = '/audio/alphabet-elevenlabs'

export const LETTER_RECORDED_AUDIO: Readonly<Record<string, string>> = {
  alif: `${ALPHABET_AUDIO_BASE}/alif.mp3`,
  ba: `${ALPHABET_AUDIO_BASE}/ba.mp3`,
  ta: `${ALPHABET_AUDIO_BASE}/ta.mp3`,
  tha: `${ALPHABET_AUDIO_BASE}/tha.mp3`,
  jim: `${ALPHABET_AUDIO_BASE}/jim.mp3`,
  ha: `${ALPHABET_AUDIO_BASE}/ha.mp3`,
  kha: `${ALPHABET_AUDIO_BASE}/kha.mp3`,
  dal: `${ALPHABET_AUDIO_BASE}/dal.mp3`,
  dhal: `${ALPHABET_AUDIO_BASE}/dhal.mp3`,
  ra: `${ALPHABET_AUDIO_BASE}/ra.mp3`,
  zay: `${ALPHABET_AUDIO_BASE}/zay.mp3`,
  sin: `${ALPHABET_AUDIO_BASE}/sin.mp3`,
  shin: `${ALPHABET_AUDIO_BASE}/shin.mp3`,
  sad: `${ALPHABET_AUDIO_BASE}/sad.mp3`,
  dad: `${ALPHABET_AUDIO_BASE}/dad.mp3`,
  taa: `${ALPHABET_AUDIO_BASE}/taa.mp3`,
  zaa: `${ALPHABET_AUDIO_BASE}/zaa.mp3`,
  ayn: `${ALPHABET_AUDIO_BASE}/ayn.mp3`,
  ghayn: `${ALPHABET_AUDIO_BASE}/ghayn.mp3`,
  fa: `${ALPHABET_AUDIO_BASE}/fa.mp3`,
  qaf: `${ALPHABET_AUDIO_BASE}/qaf.mp3`,
  kaf: `${ALPHABET_AUDIO_BASE}/kaf.mp3`,
  lam: `${ALPHABET_AUDIO_BASE}/lam.mp3`,
  mim: `${ALPHABET_AUDIO_BASE}/mim.mp3`,
  nun: `${ALPHABET_AUDIO_BASE}/nun.mp3`,
  ha2: `${ALPHABET_AUDIO_BASE}/ha2.mp3`,
  waw: `${ALPHABET_AUDIO_BASE}/waw.mp3`,
  ya: `${ALPHABET_AUDIO_BASE}/ya.mp3`,
}

export function letterRecordedAudio(letter: Pick<Letter, 'id'>): string | undefined {
  return LETTER_RECORDED_AUDIO[letter.id]
}
