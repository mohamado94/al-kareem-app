'use client'

function tone(frequency: number, start: number, duration: number, context: AudioContext, gain: GainNode) {
  const oscillator = context.createOscillator()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, start)
  oscillator.connect(gain)
  oscillator.start(start)
  oscillator.stop(start + duration)
}

export function playAnswerSound(correct: boolean) {
  if (typeof window === 'undefined') return
  const AudioContextClass = window.AudioContext
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ?? (window as any).webkitAudioContext
  if (!AudioContextClass) return
  const context: AudioContext = new AudioContextClass()
  const gain = context.createGain()
  gain.gain.setValueAtTime(0.0001, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.16, context.currentTime + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + (correct ? 0.48 : 0.28))
  gain.connect(context.destination)
  if (correct) {
    tone(660, context.currentTime, 0.16, context, gain)
    tone(880, context.currentTime + 0.16, 0.25, context, gain)
  } else {
    tone(210, context.currentTime, 0.11, context, gain)
    tone(155, context.currentTime + 0.11, 0.14, context, gain)
  }
  window.setTimeout(() => void context.close(), 650)
}
