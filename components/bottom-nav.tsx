'use client'

import { Home, GraduationCap, BookOpenText, Clapperboard, User } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export type Tab = 'home' | 'learn' | 'hadith' | 'stories' | 'profile' | 'exercises'

const TABS: { id: Tab; icon: typeof Home; labelKey: string }[] = [
  { id: 'home', icon: Home, labelKey: 'nav.home' },
  { id: 'learn', icon: GraduationCap, labelKey: 'nav.learn' },
  { id: 'hadith', icon: BookOpenText, labelKey: 'nav.hadith' },
  { id: 'stories', icon: Clapperboard, labelKey: 'nav.stories' },
  { id: 'profile', icon: User, labelKey: 'nav.profile' },
]

export function BottomNav({
  active,
  onChange,
}: {
  active: Tab
  onChange: (t: Tab) => void
}) {
  const { t } = useI18n()

  return (
    <nav className="absolute inset-x-0 bottom-0 z-30 border-t border-border bg-card/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {TABS.map(({ id, icon: Icon, labelKey }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-1 py-1.5"
            >
              <span
                className={cn(
                  'flex h-9 w-12 items-center justify-center rounded-full transition-all',
                  isActive ? 'bg-primary/15' : 'bg-transparent',
                )}
              >
                <Icon
                  className={cn(
                    'h-[22px] w-[22px] transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )}
                  strokeWidth={isActive ? 2.4 : 1.9}
                />
              </span>
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {t(labelKey)}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
