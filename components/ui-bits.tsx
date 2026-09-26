'use client'

import type { ReactNode } from 'react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { cn } from '@/lib/utils'

export function ScreenHeader({
  title,
  subtitle,
  showLang = true,
  right,
}: {
  title: string
  subtitle?: string
  showLang?: boolean
  right?: ReactNode
}) {
  return (
    <header className="flex items-start justify-between gap-3 px-5 pb-4 pt-8">
      <div className="min-w-0">
        <h1 className="gold-text text-2xl font-bold tracking-tight text-balance">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground text-pretty">{subtitle}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {right}
        {showLang && <LanguageSwitcher />}
      </div>
    </header>
  )
}

export function ProgressRing({
  value,
  size = 56,
  stroke = 5,
  children,
  className,
}: {
  value: number
  size?: number
  stroke?: number
  children?: ReactNode
  className?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  const gradId = `gold-ring-${size}`
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--gold-highlight)" />
            <stop offset="50%" stopColor="var(--gold-medium)" />
            <stop offset="100%" stopColor="var(--gold-primary)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--secondary)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-secondary', className)}>
      <div
        className="gold-gradient h-full rounded-full"
        style={{ width: `${value}%`, transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)' }}
      />
    </div>
  )
}

const ACCENTS: Record<string, string> = {
  gold: 'text-primary bg-primary/12',
  teal: 'text-[oklch(0.5_0.1_180)] bg-[oklch(0.5_0.1_180/0.14)]',
  violet: 'text-[oklch(0.5_0.13_300)] bg-[oklch(0.5_0.13_300/0.14)]',
  rose: 'text-[oklch(0.53_0.16_15)] bg-[oklch(0.53_0.16_15/0.14)]',
  sky: 'text-[oklch(0.5_0.11_240)] bg-[oklch(0.5_0.11_240/0.14)]',
  amber: 'text-[oklch(0.55_0.13_65)] bg-[oklch(0.55_0.13_65/0.14)]',
}

export function accentClass(accent: string) {
  return ACCENTS[accent] ?? ACCENTS.gold
}
