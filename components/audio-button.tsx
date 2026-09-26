'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Volume2, Mic, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  speakArabic,
  speakPhrase,
  speakArabicFemale,
  playRecordedAudio,
  playRecordedAudioSequence,
  type RecordedAudioSegment,
} from '@/lib/speech'
import type { Letter } from '@/lib/data'
import type { Lang } from '@/lib/i18n'
import { pronunciationMatches, recognitionLang } from '@/lib/letter-spoken-names'
import { Capacitor } from '@capacitor/core'
import { SpeechRecognition as NativeSpeechRecognition } from '@capgo/capacitor-speech-recognition'

type PronounceState = 'idle' | 'listening' | 'success' | 'error' | 'unavailable'
type RecognitionFailure = 'missing-api' | 'permission-denied' | 'audio-capture' | 'network' | 'native-unavailable' | 'start-failed'

function playFeedbackSound(ok: boolean) {
  try {
    const AudioContextClass = window.AudioContext
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?? (window as any).webkitAudioContext
    if (!AudioContextClass) return
    const context = new AudioContextClass()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = ok ? 'sine' : 'triangle'
    oscillator.frequency.setValueAtTime(ok ? 660 : 180, context.currentTime)
    if (ok) oscillator.frequency.exponentialRampToValueAtTime(990, context.currentTime + 0.16)
    gain.gain.setValueAtTime(0.0001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + (ok ? 0.28 : 0.38))
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + (ok ? 0.3 : 0.4))
    oscillator.onended = () => void context.close()
  } catch {
    // Visual feedback remains available if audio feedback is unsupported.
  }
}

/**
 * Pronunciation button with a fixed eight-second recording window.
 * Uses the native recognizer in store builds and Web Speech in browsers.
 */
export function PronounceButton({
  letter,
  lang,
  label,
  listeningLabel,
  successLabel,
  errorLabel,
  unavailableLabel,
  onResult,
  className,
}: {
  letter: Letter
  lang: Lang
  label: string
  listeningLabel: string
  successLabel: string
  errorLabel: string
  unavailableLabel?: string
  onResult?: (ok: boolean) => void
  className?: string
}) {
  const [state, setState] = useState<PronounceState>('idle')
  const [recognitionFailure, setRecognitionFailure] = useState<RecognitionFailure | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(8)
  const holding = useRef(false)
  const settled = useRef(false)
  const transcripts = useRef<string[]>([])
  const alternatives = useRef<string[]>([])
  const lastInterim = useRef('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pointerIdRef = useRef<number | null>(null)
  const validateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const maxRecordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimers = useCallback(() => {
    if (validateTimerRef.current) clearTimeout(validateTimerRef.current)
    if (maxRecordTimerRef.current) clearTimeout(maxRecordTimerRef.current)
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
    validateTimerRef.current = null
    maxRecordTimerRef.current = null
    countdownTimerRef.current = null
  }, [])

  const stopRecognition = useCallback(() => {
    const rec = recRef.current
    recRef.current = null
    if (!rec) return
    try {
      rec.onend = null
      rec.onerror = null
      rec.onresult = null
      rec.stop()
    } catch {
      try {
        rec.abort()
      } catch {
        /* no-op */
      }
    }
  }, [])

  const finish = useCallback(
    (ok: boolean) => {
      if (settled.current) return
      settled.current = true
      holding.current = false
      pointerIdRef.current = null
      clearTimers()
      stopRecognition()

      if (ok) {
        playFeedbackSound(true)
        setState('success')
        onResult?.(true)
        window.setTimeout(() => {
          setState('idle')
          settled.current = false
        }, 1400)
      } else {
        playFeedbackSound(false)
        setState('error')
        onResult?.(false)
        window.setTimeout(() => {
          setState('idle')
          settled.current = false
        }, 1400)
      }
    },
    [clearTimers, onResult, stopRecognition],
  )

  const failTechnical = useCallback((reason: RecognitionFailure) => {
    if (settled.current) return
    settled.current = true
    holding.current = false
    pointerIdRef.current = null
    clearTimers()
    stopRecognition()
    setRecognitionFailure(reason)
    setState('unavailable')
    window.setTimeout(() => {
      setState('idle')
      settled.current = false
    }, 4000)
  }, [clearTimers, stopRecognition])

  const runValidate = useCallback(() => {
    const candidates = [
      [...transcripts.current, lastInterim.current].filter(Boolean).join(' '),
      ...alternatives.current,
    ].filter(Boolean)
    finish(candidates.some((text) => pronunciationMatches(text, letter, lang)))
  }, [finish, letter, lang])

  const scheduleValidate = useCallback(() => {
    if (validateTimerRef.current) clearTimeout(validateTimerRef.current)
    validateTimerRef.current = setTimeout(() => {
      if (!settled.current) runValidate()
    }, 450)
  }, [runValidate])

  const releaseHold = useCallback(() => {
    if (!holding.current) return
    holding.current = false

    const btn = buttonRef.current
    const pid = pointerIdRef.current
    if (btn != null && pid != null) {
      try {
        if (btn.hasPointerCapture(pid)) btn.releasePointerCapture(pid)
      } catch {
        /* no-op */
      }
    }
    pointerIdRef.current = null

    const rec = recRef.current
    if (rec) {
      // Keep result/end callbacks attached: Safari may deliver the final
      // transcription only after stop() is requested.
      try {
        rec.stop()
      } catch {
        scheduleValidate()
      }
    } else {
      scheduleValidate()
    }
  }, [scheduleValidate])

  // Watchdog: never stay stuck in "listening" if release was missed.
  useEffect(() => {
    if (state !== 'listening') return
    const watchdog = setTimeout(() => {
      if (!holding.current && !settled.current) runValidate()
    }, 2500)
    return () => clearTimeout(watchdog)
  }, [state, runValidate])

  useEffect(
    () => () => {
      holding.current = false
      clearTimers()
      stopRecognition()
    },
    [clearTimers, stopRecognition],
  )

  const startListening = async () => {
    if (holding.current || state !== 'idle') return

    holding.current = true
    settled.current = false
    transcripts.current = []
    alternatives.current = []
    lastInterim.current = ''
    setSecondsLeft(8)
    setState('listening')

    const startedAt = Date.now()
    countdownTimerRef.current = setInterval(() => {
      const remaining = Math.max(0, 8 - Math.floor((Date.now() - startedAt) / 1000))
      setSecondsLeft(remaining)
    }, 200)

    if (Capacitor.isNativePlatform()) {
      try {
        const available = await NativeSpeechRecognition.available()
        if (!available.available) return failTechnical('native-unavailable')
        const permission = await NativeSpeechRecognition.requestPermissions()
        if (permission.speechRecognition !== 'granted') return failTechnical('permission-denied')

        const listener = await NativeSpeechRecognition.addListener('partialResults', ({ matches, accumulatedText }) => {
          alternatives.current.push(...(matches ?? []).filter(Boolean))
          if (accumulatedText) alternatives.current.push(accumulatedText)
        })
        recRef.current = {
          stop: () => {
            void NativeSpeechRecognition.stop()
              .catch(() => undefined)
              .finally(() => {
                void listener.remove()
                scheduleValidate()
              })
          },
          abort: () => {
            void NativeSpeechRecognition.stop().catch(() => undefined)
            void listener.remove()
          },
        }
        await NativeSpeechRecognition.start({
          language: recognitionLang(lang),
          maxResults: 5,
          partialResults: true,
          popup: false,
          contextualStrings: [letter.name, letter.glyph],
          continuousPTT: true,
          muteRecognizerBeep: true,
        })
        maxRecordTimerRef.current = setTimeout(() => {
          if (holding.current) releaseHold()
        }, 8000)
        return
      } catch {
        return failTechnical('start-failed')
      }
    }

    const SR =
      typeof window !== 'undefined'
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : undefined

    if (!SR) {
      failTechnical('missing-api')
      return
    }

    try {
      const rec = new SR()
      recRef.current = rec
      rec.lang = recognitionLang(lang)
      rec.interimResults = true
      rec.maxAlternatives = 5
      // Keep listening through silence for the complete eight-second window.
      rec.continuous = true

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rec.onresult = (ev: any) => {
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const result = ev.results[i]
          const chunk = result[0]?.transcript ?? ''
          if (!chunk) continue
          for (let j = 0; j < result.length; j++) {
            const candidate = result[j]?.transcript
            if (candidate) alternatives.current.push(candidate)
          }
          if (result.isFinal) {
            transcripts.current.push(chunk)
          }
          else lastInterim.current = chunk
        }
        // Keep collecting speech until the fixed timer expires.
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rec.onerror = (ev: any) => {
        if (holding.current && (ev?.error === 'no-speech' || ev?.error === 'aborted')) return
        if (ev?.error === 'not-allowed' || ev?.error === 'service-not-allowed') {
          failTechnical('permission-denied')
          return
        }
        if (ev?.error === 'audio-capture') {
          failTechnical('audio-capture')
          return
        }
        if (ev?.error === 'network') {
          failTechnical('network')
          return
        }
        if (!settled.current) finish(false)
      }
      rec.onend = () => {
        if (settled.current) return
        if (holding.current) {
          try {
            rec.start()
            return
          } catch {
            // Safari can briefly reject an immediate restart. Retry once the
            // recognizer has fully released, without shortening the 8 seconds.
            window.setTimeout(() => {
              if (!holding.current || settled.current) return
              try { rec.start() } catch { /* the final timer will validate */ }
            }, 120)
            return
          }
        }
        recRef.current = null
        const hasSpeech = transcripts.current.length > 0 || Boolean(lastInterim.current)
        if (hasSpeech) scheduleValidate()
        else finish(false)
      }

      rec.start()

      // Always give the learner the full eight seconds, including pauses.
      maxRecordTimerRef.current = setTimeout(() => {
        if (holding.current) releaseHold()
      }, 8000)

    } catch {
      holding.current = false
      failTechnical('start-failed')
    }
  }

  const labels: Record<PronounceState, string> = {
    idle: label,
    listening: listeningLabel,
    success: successLabel,
    error: errorLabel,
    unavailable: unavailableLabel ?? 'Micro ou reconnaissance vocale indisponible',
  }
  const technicalLabels: Record<RecognitionFailure, string> = {
    'missing-api': 'Reconnaissance vocale non prise en charge par ce navigateur',
    'permission-denied': 'Autorisation du microphone ou de la reconnaissance refusée',
    'audio-capture': 'Microphone inaccessible ou déjà utilisé',
    network: 'Connexion au service de reconnaissance vocale impossible',
    'native-unavailable': 'Reconnaissance vocale indisponible sur cet appareil',
    'start-failed': unavailableLabel ?? 'Impossible de démarrer la reconnaissance vocale',
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => {
        if (state === 'idle') startListening()
      }}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={label}
      aria-pressed={state === 'listening'}
      disabled={state === 'success' || state === 'error' || state === 'unavailable'}
      style={{ touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
      className={cn(
        'classic-secondary-control relative inline-flex h-12 select-none items-center justify-center gap-2.5 rounded-full border border-border px-5 text-sm font-semibold text-secondary-foreground transition-transform active:scale-95',
        state === 'listening' && 'border-primary/60 text-primary',
        state === 'success' && 'border-emerald-500/60 bg-emerald-500/15 text-emerald-600',
        state === 'error' && 'border-destructive/50 bg-destructive/10 text-destructive',
        state === 'unavailable' && 'border-amber-500/60 bg-amber-500/10 text-amber-700',
        state !== 'idle' && state !== 'listening' && 'pointer-events-none',
        className,
      )}
    >
      <span className="relative flex items-center justify-center">
        {state === 'listening' && (
          <span className="absolute inline-flex h-6 w-6 rounded-full bg-primary/30 [animation:akRingPulse_1.2s_ease-out_infinite]" />
        )}
        {state === 'success' ? (
          <Check className="h-5 w-5" />
        ) : state === 'error' || state === 'unavailable' ? (
          <X className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </span>
      <span>{state === 'listening' ? `${labels[state]} · ${secondsLeft} s` : state === 'unavailable' && recognitionFailure ? technicalLabels[recognitionFailure] : labels[state]}</span>
    </button>
  )
}

export function ListenButton({
  text,
  label,
  className,
  size = 'md',
  phraseLang,
  speechOptions,
  audioSrc,
}: {
  text: string
  label: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  /** When set, speaks with the UI-language neural voice (e.g. "Baoun"). */
  phraseLang?: Lang
  speechOptions?: { rate?: string }
  /** Reviewed recording; takes precedence over generated speech. */
  audioSrc?: string
}) {
  const [active, setActive] = useState(false)

  const handle = () => {
    setActive(true)
    if (audioSrc) playRecordedAudio(audioSrc)
    else if (phraseLang) speakPhrase(text, phraseLang)
    else speakArabic(text, speechOptions)
    window.setTimeout(() => setActive(false), 900)
  }

  const sizes = {
    sm: 'h-11 px-4 text-sm gap-2',
    md: 'h-12 px-5 text-sm gap-2.5',
    lg: 'h-14 px-6 text-base gap-3',
  }

  return (
    <button
      type="button"
      onClick={handle}
      aria-label={label}
      className={cn(
        'gold-gradient relative inline-flex items-center justify-center rounded-full font-semibold text-primary-foreground shadow-lg shadow-black/30 transition-transform active:scale-95',
        sizes[size],
        className,
      )}
    >
      <span className="relative flex items-center justify-center">
        {active && (
          <span className="absolute inline-flex h-6 w-6 rounded-full bg-primary-foreground/40 [animation:akRingPulse_0.9s_ease-out]" />
        )}
        <Volume2 className="h-5 w-5" />
      </span>
      <span>{label}</span>
    </button>
  )
}

export function SpeakButton({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  const [recording, setRecording] = useState(false)

  const handle = () => {
    setRecording(true)
    window.setTimeout(() => setRecording(false), 1800)
  }

  return (
    <button
      type="button"
      onClick={handle}
      aria-label={label}
      aria-pressed={recording}
      className={cn(
        'classic-secondary-control relative inline-flex h-12 items-center justify-center gap-2.5 rounded-full border border-border px-5 text-sm font-semibold text-secondary-foreground transition-transform active:scale-95',
        recording && 'border-primary/60 text-primary',
        className,
      )}
    >
      <span className="relative flex items-center justify-center">
        {recording && (
          <span className="absolute inline-flex h-6 w-6 rounded-full bg-primary/30 [animation:akRingPulse_1.2s_ease-out_infinite]" />
        )}
        <Mic className="h-5 w-5" />
      </span>
      <span>{label}</span>
    </button>
  )
}

// Compact circular listen control for tight layouts (e.g. letter cards).
export function ListenCircle({
  text,
  label,
  className,
  phraseLang,
  leadingArabicText,
  audioSequence,
}: {
  text: string
  label: string
  className?: string
  /** When set, speaks the phrase in the UI language (e.g. "Alifoun isolé"). */
  phraseLang?: Lang
  /** Optional Arabic female lead, followed by the French female phrase. */
  leadingArabicText?: string
  /** Reviewed recordings played in order; takes precedence over generated speech. */
  audioSequence?: RecordedAudioSegment[]
}) {
  const [active, setActive] = useState(false)
  const handle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setActive(true)
    if (audioSequence) {
      await playRecordedAudioSequence(audioSequence)
    } else if (leadingArabicText && phraseLang) {
      await speakArabicFemale(leadingArabicText)
      await speakPhrase(text, phraseLang, 'female')
    } else if (phraseLang) speakPhrase(text, phraseLang, 'female')
    else speakArabic(text)
    window.setTimeout(() => setActive(false), 900)
  }
  return (
    <button
      type="button"
      onClick={handle}
      aria-label={label}
      className={cn(
        'relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary transition-transform active:scale-90',
        className,
      )}
    >
      {active && (
        <span className="absolute inline-flex h-10 w-10 rounded-full bg-primary/25 [animation:akRingPulse_0.9s_ease-out]" />
      )}
      <Volume2 className="h-[18px] w-[18px]" />
    </button>
  )
}

// Recordings are reviewed ElevenLabs MP3 files bundled with the application.
export function VoicePicker({ previewText = 'بِسْمِ اللَّه' }: { previewText?: string }) {
  return (
    <button
      type="button"
      onClick={() => speakArabic(previewText)}
      className="flex w-full items-center gap-3 rounded-2xl border border-primary/35 bg-primary/10 p-3 text-start"
    >
      <span className="gold-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-primary-foreground">
        <Volume2 className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">Audios enregistrés</span>
        <span className="block text-xs text-muted-foreground">Enregistrements ElevenLabs intégrés à l’application</span>
      </span>
      <Check className="h-5 w-5 shrink-0 text-primary" />
    </button>
  )
}
