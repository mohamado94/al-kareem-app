'use client'

import { Capacitor } from '@capacitor/core'
import { SpeechRecognition as NativeSpeechRecognition } from '@capgo/capacitor-speech-recognition'

/**
 * Native (iOS / Android via Capacitor) Arabic speech recognition for the word
 * pronunciation exercises. WKWebView and Android WebView do not expose the Web
 * Speech API, so inside the store apps the native plugin must be used instead.
 */
export type NativeListenResult =
  | { ok: true; heard: string }
  | { ok: false; reason: 'unavailable' | 'permission-denied' | 'start-failed' }

export function isNativeSpeechPlatform(): boolean {
  return Capacitor.isNativePlatform()
}

export async function listenArabicNative(durationMs: number, contextualStrings: string[] = []): Promise<NativeListenResult> {
  try {
    const available = await NativeSpeechRecognition.available()
    if (!available.available) return { ok: false, reason: 'unavailable' }
    const permission = await NativeSpeechRecognition.requestPermissions()
    if (permission.speechRecognition !== 'granted') return { ok: false, reason: 'permission-denied' }

    const heard: string[] = []
    const listener = await NativeSpeechRecognition.addListener('partialResults', ({ matches, accumulatedText }) => {
      heard.push(...(matches ?? []).filter(Boolean))
      if (accumulatedText) heard.push(accumulatedText)
    })
    try {
      await NativeSpeechRecognition.start({
        language: 'ar-SA',
        maxResults: 5,
        partialResults: true,
        popup: false,
        contextualStrings,
        continuousPTT: true,
        muteRecognizerBeep: true,
      })
      await new Promise((resolve) => setTimeout(resolve, durationMs))
    } finally {
      await NativeSpeechRecognition.stop().catch(() => undefined)
      await listener.remove().catch(() => undefined)
    }
    return { ok: true, heard: heard.join(' ') }
  } catch {
    return { ok: false, reason: 'start-failed' }
  }
}
