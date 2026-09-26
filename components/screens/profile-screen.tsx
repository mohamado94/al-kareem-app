'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import {
  Bell,
  Info,
  ChevronRight,
  Pencil,
  Flame,
  Trophy,
  Star,
  Award,
  Lock,
  LogIn,
  LogOut,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { localized } from '@/lib/i18n-content'
import { useAuth } from '@/lib/auth/context'
import { useProgress } from '@/lib/progress/context'
import { useNotifications } from '@/lib/notifications'
import { ScreenHeader } from '@/components/ui-bits'
import { LanguageSwitcher } from '@/components/language-switcher'
import { VoicePicker } from '@/components/audio-button'
import { AuthModal } from '@/components/auth-modal'
import { ACHIEVEMENTS, SKILLS } from '@/lib/data'
import { cn } from '@/lib/utils'
import { progressStorageKey } from '@/lib/progress/storage'
import { masteryTopics } from '@/lib/progress/mastery'

const ACH_ICONS: Record<string, LucideIcon> = { Flame, Star, Award, Trophy }

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export function ProfileScreen() {
  const { t, lang } = useI18n()
  const { user, signOut, deleteAccount } = useAuth()
  const { progress, syncStatus } = useProgress()
  const completedLessons = Object.values(masteryTopics(progress.validatedItems)).filter((value) => value === 100).length
  const { requestPermission, disableNotifications, enabled: notifEnabled, supported: notificationsSupported } = useNotifications()
  const [authOpen, setAuthOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editError, setEditError] = useState<string | null>(null)

  const weekActivity = progress.weekActivity.map((value, i) => ({
    day: DAY_LABELS[i],
    value,
  }))
  const maxVal = Math.max(...weekActivity.map((d) => d.value), 1)

  const displayName = user?.displayName ?? t('profile.guestName')

  const editProfile = async () => {
    const next = editName.trim()
    if (!next || next === displayName) return
    const response = await fetch('/api/profile/preferences', {
      method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: next }),
    })
    if (response.ok) window.location.reload()
    else setEditError(t('auth.error.generic'))
  }

  const confirmDelete = async () => {
    setDeleting(true)
    setDeleteError(null)
    const result = await deleteAccount(deletePassword)
    setDeleting(false)
    if (result.error) return setDeleteError(t(result.error))
    localStorage.removeItem(progressStorageKey(user?.id))
    setDeleteOpen(false)
    setDeletePassword('')
  }

  return (
    <div>
      <ScreenHeader title={t('profile.title')} showLang={false} />

      <div className="px-5">
        <div className="relief-panel relative overflow-hidden rounded-3xl p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -end-6 -top-8 h-36 w-36 rounded-full opacity-60 blur-2xl"
            style={{ background: 'var(--relief-glow)' }}
          />
          <div className="relative flex items-center gap-4">
            <div className="gold-gradient flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-primary-foreground shadow-lg shadow-black/30">
              <span className="font-arabic text-3xl leading-none">ك</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="gold-text text-lg font-bold">{displayName}</p>
              <p className="text-xs text-muted-foreground">
                {user ? user.email : t('profile.member')}
              </p>
              <p role="status" className={cn('mt-1 text-[11px]', syncStatus === 'error' ? 'text-destructive' : 'text-muted-foreground')}>
                {t(`profile.sync.${syncStatus}`)}
              </p>
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                {t('profile.level')} 1 · {t('common.beginner')}
              </span>
            </div>
          </div>
          <div className="relative mt-5 grid grid-cols-2 gap-2">
            <MiniStat icon={Flame} value={String(progress.stats.streak)} label={t('home.streak')} />
            <MiniStat icon={Trophy} value={String(completedLessons)} label={t('home.lessonsDone')} />
          </div>
        </div>
      </div>

      <div className="px-5 pt-4">
        {user ? (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => { setEditName(displayName); setEditError(null); setEditOpen(true) }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 font-semibold active:scale-[0.98]"
            >
              <Pencil className="h-4 w-4" />
              {t('profile.editProfile')}
            </button>
            <button
              type="button"
              onClick={() => signOut()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 py-3 font-semibold text-destructive active:scale-[0.98]"
            >
              <LogOut className="h-4 w-4" />
              {t('profile.signOut')}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="gold-gradient flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-primary-foreground active:scale-[0.98]"
          >
            <LogIn className="h-4 w-4" />
            {t('profile.signIn')}
          </button>
        )}
      </div>

      <section className="px-5 pt-6">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          {t('prog.weeklyActivity')}
        </h2>
        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="flex items-end justify-between gap-2">
            {weekActivity.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-28 w-full items-end">
                  <div
                    className="w-full rounded-t-lg rounded-b-sm"
                    style={{
                      height: d.value === 0 ? '6%' : `${Math.max((d.value / maxVal) * 100, 6)}%`,
                      background:
                        d.value === maxVal
                          ? 'linear-gradient(180deg, var(--gold-highlight), var(--gold-primary))'
                          : 'var(--secondary)',
                      transition: 'height 0.7s cubic-bezier(0.22,1,0.36,1)',
                    }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pt-6">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{t('prog.skills')}</h2>
        <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5">
          {SKILLS.map((s) => {
            const value = progress.skills[s.id] ?? s.value
            return (
              <div key={s.id}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium">{localized(s.label, lang)}</span>
                  <span className="gold-text font-semibold">{value}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="gold-gradient h-full rounded-full"
                    style={{ width: `${value}%`, transition: 'width 0.8s ease' }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="px-5 pt-6">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          {t('prog.achievements')}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const Icon = ACH_ICONS[a.icon] ?? Star
            const unlocked = progress.achievements[a.id] ?? a.unlocked
            return (
              <div
                key={a.id}
                className={`flex items-center gap-3 rounded-3xl border p-4 ${
                  unlocked ? 'border-primary/25 bg-primary/5' : 'border-border bg-card/50 opacity-60'
                }`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    unlocked ? 'gold-gradient text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {unlocked ? <Icon className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                </span>
                <span className="text-sm font-medium leading-tight text-balance">{localized(a.label, lang)}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="px-5 pt-6">
        <h2 className="mb-1 text-sm font-semibold text-muted-foreground">
          {t('profile.voice')}
        </h2>
        <p className="mb-3 text-xs text-muted-foreground">{t('profile.voiceHint')}</p>
        <VoicePicker />
      </section>

      <section className="px-5 pt-6">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          {t('profile.settings')}
        </h2>
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <span className="text-sm">🌐</span>
            </span>
            <span className="flex-1 text-sm font-medium">{t('profile.language')}</span>
            <LanguageSwitcher variant="full" />
          </div>
          {notificationsSupported && <><Divider />
          <NotificationToggle
            enabled={notifEnabled}
            onEnable={requestPermission}
            onDisable={disableNotifications}
            label={t('profile.notifications')}
          /></>}
          <Divider />
          <LinkRow icon={Info} label={t('profile.about')} onClick={() => setAboutOpen(true)} />
        </div>
      </section>

      {user && <section className="px-5 pt-4">
        <button type="button" onClick={() => setDeleteOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 py-3 text-sm font-semibold text-destructive">
          <Trash2 className="h-4 w-4" />{t('profile.deleteAccount')}
        </button>
      </section>}

      <nav aria-label="Informations légales" className="flex flex-wrap justify-center gap-x-4 gap-y-2 px-5 pt-6 text-xs text-muted-foreground">
        <Link href="/privacy" target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">Confidentialité</Link>
        <Link href="/terms" target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">Conditions</Link>
        <Link href="/account-deletion" target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">Supprimer un compte</Link>
        <a href="mailto:alkareem.app@gmail.com" className="underline-offset-4 hover:underline">Assistance</a>
      </nav>

      <p className="px-5 pb-6 pt-3 text-center text-xs text-muted-foreground">
        Al-Kareem · <span className="font-arabic text-sm">الكريم</span> · v1.0
      </p>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      {editOpen && <SimpleDialog title={t('profile.editProfile')} onClose={() => setEditOpen(false)}>
        <label className="text-sm font-medium" htmlFor="display-name">{t('auth.displayName')}</label>
        <input id="display-name" value={editName} maxLength={80} onChange={e => setEditName(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none" />
        {editError && <p className="mt-2 text-sm text-destructive">{editError}</p>}
        <div className="mt-4 flex gap-2"><button type="button" onClick={() => setEditOpen(false)} className="flex-1 rounded-2xl border border-border py-3 text-sm font-semibold">{t('profile.cancel')}</button><button type="button" onClick={editProfile} disabled={!editName.trim() || editName.trim() === displayName} className="gold-gradient flex-1 rounded-2xl py-3 text-sm font-semibold disabled:opacity-50">{t('profile.save')}</button></div>
      </SimpleDialog>}
      {aboutOpen && <SimpleDialog title={t('profile.about')} onClose={() => setAboutOpen(false)}><p className="text-sm text-muted-foreground">{t('profile.aboutText')}</p></SimpleDialog>}
      {deleteOpen && <SimpleDialog title={t('profile.deleteTitle')} onClose={() => setDeleteOpen(false)}>
        <p className="text-sm text-muted-foreground">{t('profile.deleteWarning')}</p>
        <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder={t('auth.password')} className="mt-4 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none" />
        {deleteError && <p className="mt-2 text-sm text-destructive">{deleteError}</p>}
        <div className="mt-4 flex gap-2"><button type="button" onClick={() => setDeleteOpen(false)} className="flex-1 rounded-2xl border border-border py-3 text-sm font-semibold">{t('profile.cancel')}</button><button type="button" disabled={!deletePassword || deleting} onClick={confirmDelete} className="flex-1 rounded-2xl bg-destructive py-3 text-sm font-semibold text-white disabled:opacity-50">{t('profile.confirmDelete')}</button></div>
      </SimpleDialog>}
    </div>
  )
}

function MiniStat({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return (
    <div className="flex min-w-0 items-center justify-center gap-2 rounded-2xl bg-background/40 px-2 py-2">
      <Icon className="h-4 w-4 text-primary" />
      <span className="min-w-0 text-center">
        <span className="gold-text block text-sm font-bold leading-tight">{value}</span>
        <span className="block truncate text-[10px] leading-tight text-muted-foreground">{label}</span>
      </span>
    </div>
  )
}

function Divider() {
  return <div className="mx-4 h-px bg-border" />
}

function NotificationToggle({
  enabled,
  onEnable,
  onDisable,
  label,
}: {
  enabled: boolean
  onEnable: () => Promise<boolean>
  onDisable: () => Promise<void>
  label: string
}) {
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    if (enabled) await onDisable()
    else await onEnable()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
        <Bell className="h-[18px] w-[18px]" />
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        disabled={loading}
        onClick={toggle}
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50',
          enabled ? 'gold-gradient' : 'bg-secondary',
        )}
      >
        <span
          className={cn(
            'absolute top-1 h-5 w-5 rounded-full bg-background shadow transition-all',
            enabled ? 'start-6' : 'start-1',
          )}
        />
      </button>
    </div>
  )
}

function LinkRow({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3.5 text-start active:bg-secondary/40">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="h-5 w-5 text-muted-foreground rtl:rotate-180" />
    </button>
  )
}

function SimpleDialog({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={onClose}>
    <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6" onClick={e => e.stopPropagation()}>
      <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">{title}</h2><button type="button" onClick={onClose} aria-label={tSafeClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"><X className="h-5 w-5" /></button></div>
      {children}
    </div>
  </div>, document.body)
}

const tSafeClose = 'Fermer'
