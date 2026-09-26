'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Globe } from 'lucide-react'
import { LANGUAGES, useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({ variant = 'icon' }: { variant?: 'icon' | 'full' }) {
  const { lang, setLang } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = LANGUAGES.find((l) => l.code === lang)!

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        aria-expanded={open}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur transition-transform active:scale-95',
          variant === 'icon' ? 'h-10 w-10 justify-center' : 'h-10 px-4',
        )}
      >
        {variant === 'icon' ? (
          <span className="text-base leading-none">{current.flag}</span>
        ) : (
          <>
            <Globe className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{current.native}</span>
          </>
        )}
      </button>

      {open && (
        <div className="animate-fade-up absolute end-0 z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-border bg-popover p-1.5 shadow-2xl shadow-black/50">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLang(l.code)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm transition-colors',
                l.code === lang
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-secondary',
              )}
            >
              <span className="text-base leading-none">{l.flag}</span>
              <span
                className={cn(
                  'flex-1 font-medium',
                  l.code === 'ar' && 'font-arabic text-base',
                )}
              >
                {l.native}
              </span>
              {l.code === lang && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
