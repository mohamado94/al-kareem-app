'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'

/**
 * Intro / splash screen.
 *
 * Timeline (~8s total):
 *  0.0s  logo appears large & centered
 *  2.4s  logo shrinks and rises toward the top
 *  3.0s  tagline + loading indicator reveal
 *  7.4s  fade out
 *  8.0s  onFinish() -> main app
 *
 * To plug in a real intro video later, drop a <video> into the marked
 * container below; the layout and timing already account for it.
 */
export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const { t } = useI18n()
  const [phase, setPhase] = useState<'intro' | 'compact' | 'exit'>('intro')

  useEffect(() => {
    if (sessionStorage.getItem('alkarim_intro_seen')) {
      onFinish()
      return
    }
    sessionStorage.setItem('alkarim_intro_seen', '1')
    const toCompact = window.setTimeout(() => setPhase('compact'), 600)
    const toExit = window.setTimeout(() => setPhase('exit'), 1800)
    const done = window.setTimeout(() => onFinish(), 2300)
    return () => {
      window.clearTimeout(toCompact)
      window.clearTimeout(toExit)
      window.clearTimeout(done)
    }
  }, [onFinish])

  return (
    <div
      className={`relative flex h-full w-full flex-col items-center overflow-hidden bg-background transition-opacity duration-500 ${
        phase === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Ambient gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, oklch(0.68 0.08 68 / 0.3) 0%, transparent 62%)',
        }}
      />

      {/* Logo lockup */}
      <div
        className={`absolute left-1/2 flex -translate-x-1/2 flex-col items-center transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          phase === 'intro'
            ? 'top-1/2 -translate-y-1/2 scale-100'
            : 'top-[16%] -translate-y-0 scale-[0.62]'
        }`}
      >
        {/* Rotating ornament rings — replace this block with a <video> for the real intro */}
        <div className="relative mb-6 flex h-40 w-40 items-center justify-center" aria-hidden>
          <span
            className="absolute inset-0 rounded-full border border-primary/25"
            style={{ animation: 'akSpinSlow 18s linear infinite' }}
          />
          <span
            className="absolute inset-3 rounded-full border border-dashed border-primary/40"
            style={{ animation: 'akSpinSlow 12s linear infinite reverse' }}
          />
          <span className="absolute inset-8 rounded-full border border-primary/20" />
          <span
            className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_12px_2px_oklch(0.68_0.08_68/0.65)]"
            style={{ animation: 'akSpinSlow 12s linear infinite reverse', transformOrigin: '50% 80px' }}
          />
          <div className="gold-gradient flex h-16 w-16 items-center justify-center rounded-2xl shadow-xl shadow-black/40">
            <span className="font-arabic text-3xl leading-none text-primary-foreground">ك</span>
          </div>
        </div>

        <h1 className="gold-text font-arabic text-6xl leading-none">الكريم</h1>
        <p className="mt-3 text-2xl font-semibold tracking-[0.3em] text-foreground/90">
          AL-KAREEM
        </p>
      </div>

      {/* Tagline + loader */}
      <div
        className={`absolute bottom-24 left-1/2 flex -translate-x-1/2 flex-col items-center transition-all duration-700 ${
          phase === 'compact' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <p className="mb-5 text-center text-sm text-muted-foreground">
          {t('splash.tagline')}
        </p>
        <div className="h-[3px] w-40 overflow-hidden rounded-full bg-secondary">
          <div
            className="gold-gradient h-full rounded-full"
            style={{ animation: 'akFadeUp 0.4s ease, akLoad 5s ease forwards' }}
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground/70">{t('splash.loading')}</p>
      </div>

      <style>{`@keyframes akLoad { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  )
}
