'use client'

import type { Lang } from '@/lib/i18n'
import { Capacitor } from '@capacitor/core'

export type PhraseGender = 'female' | 'male'

const AUDIO_CONTROL_KEY = 'ak_audio_control'
let activeAudio: HTMLAudioElement | null = null
let speechRequestId = 0

function broadcastAudioControl(action: 'play' | 'stop') {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(AUDIO_CONTROL_KEY, `${action}:${Date.now()}:${Math.random()}`)
  } catch {
    // Storage can be unavailable in a restricted browser context.
  }
}

function stopActive() {
  if (activeAudio) {
    activeAudio.pause()
    activeAudio.currentTime = 0
    activeAudio = null
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
}

export function stopSpeech() {
  ++speechRequestId
  stopActive()
  broadcastAudioControl('stop')
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== AUDIO_CONTROL_KEY) return
    ++speechRequestId
    stopActive()
  })
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      ++speechRequestId
      stopActive()
    }
  })
}

/** Local fallback for content that does not yet have a bundled ElevenLabs recording. */
function speakOnDevice(text: string, locale: Lang | 'ar'): Promise<void> {
  if (typeof window === 'undefined' || !text.trim() || !('speechSynthesis' in window)) return Promise.resolve()
  broadcastAudioControl('play')
  ++speechRequestId
  stopActive()

  return new Promise<void>((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text)
    const browserLocale: Record<Lang | 'ar', string> = {
      ar: 'ar-SA', fr: 'fr-FR', en: 'en-US', id: 'id-ID', ms: 'ms-MY',
    }
    utterance.lang = browserLocale[locale]
    utterance.rate = 0.85
    utterance.volume = 1
    const voices = window.speechSynthesis.getVoices()
    const exact = voices.find((voice) => voice.lang?.toLowerCase() === utterance.lang.toLowerCase())
      ?? voices.find((voice) => voice.lang?.toLowerCase().startsWith(locale))
    if (exact) utterance.voice = exact
    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()
    window.speechSynthesis.speak(utterance)
  })
}

export async function speakArabic(
  text: string,
  _opts?: number | { rate?: string; phraseGender?: PhraseGender },
): Promise<void> {
  return speakOnDevice(text, 'ar')
}

export async function speakArabicFemale(text: string): Promise<void> {
  return speakOnDevice(text, 'ar')
}

/** Play a reviewed ElevenLabs recording bundled with the application. */
export async function playRecordedAudio(src: string): Promise<void> {
  if (typeof window === 'undefined' || !src) return
  broadcastAudioControl('play')
  ++speechRequestId
  stopActive()
  const audio = new Audio(src)
  activeAudio = audio
  await new Promise<void>((resolve, reject) => {
    audio.onended = () => resolve()
    audio.onerror = () => reject(new Error('Recorded audio playback failed'))
    audio.play().catch(reject)
  })
}

export type RecordedAudioSegment = { src: string; start?: number; end?: number }

export async function playRecordedAudioSequence(segments: RecordedAudioSegment[]): Promise<void> {
  if (typeof window === 'undefined' || segments.length === 0) return
  broadcastAudioControl('play')
  const requestId = ++speechRequestId
  stopActive()
  for (const segment of segments) {
    if (requestId !== speechRequestId) return
    const audio = new Audio(segment.src)
    activeAudio = audio
    audio.currentTime = Math.max(0, segment.start ?? 0)
    await new Promise<void>((resolve, reject) => {
      let settled = false
      const finish = () => {
        if (settled) return
        settled = true
        audio.pause()
        resolve()
      }
      audio.onended = finish
      audio.onerror = () => reject(new Error('Recorded audio sequence playback failed'))
      if (segment.end !== undefined) {
        audio.ontimeupdate = () => {
          if (audio.currentTime >= segment.end!) finish()
        }
      }
      audio.play().catch(reject)
    })
  }
}

export async function speakPhrase(text: string, lang: Lang, _gender?: PhraseGender): Promise<void> {
  return speakOnDevice(text, lang)
}

export function isSpeechSupported() {
  return typeof window !== 'undefined'
    && (Capacitor.isNativePlatform()
      || 'speechSynthesis' in window
      || 'SpeechRecognition' in window
      || 'webkitSpeechRecognition' in window)
}
