'use client'

import { Clock3 } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export function StoriesScreen() {
  const { t } = useI18n()

  return (
    <div className="flex min-h-[calc(100dvh-9rem)] items-center justify-center px-6 pb-20 text-center">
      <div>
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/25 bg-primary/10">
          <Clock3 className="h-7 w-7 text-primary" aria-hidden="true" />
        </span>
        <p className="mt-5 text-2xl font-semibold gold-text">{t('stories.temporarilyUnavailable')}</p>
      </div>
    </div>
  )
}
