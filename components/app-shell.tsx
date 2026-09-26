'use client'

import { useEffect, useState } from 'react'
import { BottomNav, type Tab } from '@/components/bottom-nav'
import { HomeScreen } from '@/components/screens/home-screen'
import { LearnScreen, type LearnStart } from '@/components/screens/learn-screen'
import { ExercisesScreen } from '@/components/screens/exercises-screen'
import { HadithScreen } from '@/components/screens/hadith-screen'
import { ProfileScreen } from '@/components/screens/profile-screen'
import { useI18n } from '@/lib/i18n'
import { Clock3, X } from 'lucide-react'
import { AuthModal } from '@/components/auth-modal'
import { useProgress } from '@/lib/progress/context'
import { useAuth } from '@/lib/auth/context'

const RESTORABLE_TABS: Tab[] = ['home', 'learn', 'hadith', 'profile', 'exercises']

export function AppShell() {
  const { t } = useI18n()
  const { user } = useAuth()
  const { progress, loading: progressLoading, updateUiState } = useProgress()
  const [tab, setTab] = useState<Tab>('home')
  const [learnStart, setLearnStart] = useState<LearnStart | undefined>()
  const [showStoriesSoon, setShowStoriesSoon] = useState(false)
  const [storiesSoonFading, setStoriesSoonFading] = useState(false)
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [accountNotice, setAccountNotice] = useState<string | null>(null)
  const [restoredProgress, setRestoredProgress] = useState(false)

  useEffect(() => {
    if (progressLoading) {
      setRestoredProgress(false)
      return
    }
    if (restoredProgress) return
    const savedTab = progress.ui.activeTab as Tab
    if (RESTORABLE_TABS.includes(savedTab)) setTab(savedTab)
    setRestoredProgress(true)
  }, [progress.ui.activeTab, progressLoading, restoredProgress])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('resetToken')
    if (token) {
      setResetToken(token)
      const url = new URL(window.location.href)
      url.searchParams.delete('resetToken')
      window.history.replaceState({}, '', url)
    }
    const verified = params.get('emailVerified')
    if (verified) {
      setAccountNotice(t(verified === '1' ? 'auth.success.emailVerified' : 'auth.error.invalidVerification'))
      const url = new URL(window.location.href)
      url.searchParams.delete('emailVerified')
      window.history.replaceState({}, '', url)
      const timer = window.setTimeout(() => setAccountNotice(null), 5000)
      return () => window.clearTimeout(timer)
    }
  }, [t])

  useEffect(() => {
    const requestedProphet = new URLSearchParams(window.location.search).get('prophet')
    if (requestedProphet) {
      setTab('home')
      setShowStoriesSoon(true)
    }
  }, [])

  useEffect(() => {
    if (!showStoriesSoon) return
    setStoriesSoonFading(false)
    const fadeTimer = window.setTimeout(() => setStoriesSoonFading(true), 1400)
    const closeTimer = window.setTimeout(() => setShowStoriesSoon(false), 2000)
    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(closeTimer)
    }
  }, [showStoriesSoon])

  const changeTab = (next: Tab) => {
    if (next === 'stories') {
      setStoriesSoonFading(false)
      setShowStoriesSoon(true)
      return
    }
    if (next === 'learn') setLearnStart(undefined)
    setTab(next)
    updateUiState({ activeTab: next })
  }

  const openLearnBlock = (start?: LearnStart) => {
    setLearnStart(start)
    setTab('learn')
    updateUiState({ activeTab: 'learn' })
  }

  // Tabs shown in the bottom bar. `exercises` is reachable from Home only.
  const navTab: Tab = tab === 'exercises' ? 'home' : tab

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-background">
      <div key={tab} data-app-scroll className="animate-fade-up flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-24">
        <div className="mx-auto w-full max-w-5xl">
          {tab === 'home' && <HomeScreen onNavigate={changeTab} onOpenLearn={openLearnBlock} />}
          {tab === 'learn' && <LearnScreen key={user?.id ?? 'guest'} initialStart={learnStart} />}
          {tab === 'exercises' && <ExercisesScreen key={user?.id ?? 'guest'} />}
          {tab === 'hadith' && <HadithScreen />}
          {tab === 'profile' && <ProfileScreen />}
        </div>
      </div>
      <BottomNav active={navTab} onChange={changeTab} />
      {showStoriesSoon && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('stories.temporarilyUnavailable')}
          className={`absolute inset-0 z-50 flex items-center justify-center bg-background/60 px-6 backdrop-blur-[3px] transition-opacity duration-500 ${
            storiesSoonFading ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={() => setShowStoriesSoon(false)}
        >
          <div
            className="relative w-full max-w-xs rounded-3xl border border-primary/30 bg-card/90 px-8 py-10 text-center shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowStoriesSoon(false)}
              className="absolute end-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/25 bg-primary/10">
              <Clock3 className="h-7 w-7 text-primary" aria-hidden="true" />
            </span>
            <p className="mt-5 text-2xl font-semibold gold-text">{t('stories.temporarilyUnavailable')}</p>
          </div>
        </div>
      )}
      <AuthModal open={Boolean(resetToken)} resetToken={resetToken} onClose={() => {
        setResetToken(null)
        const url = new URL(window.location.href)
        url.searchParams.delete('resetToken')
        window.history.replaceState({}, '', url)
      }} />
      {accountNotice && <div role="status" className="absolute inset-x-4 top-4 z-50 mx-auto max-w-md rounded-2xl border border-primary/30 bg-card px-4 py-3 text-center text-sm font-medium">{accountNotice}</div>}
    </div>
  )
}
