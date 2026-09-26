'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Mail, Lock, User, Loader2 } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/auth/context'
import { cn } from '@/lib/utils'

type Mode = 'login' | 'signup' | 'reset'

export function AuthModal({ open, onClose, resetToken }: { open: boolean; onClose: () => void; resetToken?: string | null }) {
  const { t } = useI18n()
  const { signIn, signUp, resetPassword, completePasswordReset, configured } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && resetToken) setMode('reset')
  }, [open, resetToken])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`
    const previous = document.activeElement as HTMLElement | null
    dialogRef.current?.querySelector<HTMLElement>('input,button')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
      previous?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    if (mode === 'login') {
      const { error: err } = await signIn(email, password)
      if (err) setError(t(err))
      else onClose()
    } else if (mode === 'signup') {
      const { error: err, needsVerification } = await signUp(email, password, name)
      if (err) setError(t(err))
      else if (needsVerification) { setSuccess(t('auth.success.checkEmail')); setMode('login'); setPassword('') }
      else onClose()
    } else {
      const { error: err } = resetToken
        ? await completePasswordReset(resetToken, password)
        : await resetPassword(email)
      if (err) setError(t(err))
      else setSuccess(t(resetToken ? 'auth.success.passwordChanged' : 'auth.success.resetSent'))
    }

    setLoading(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="gold-text text-xl font-bold">
            {mode === 'login' && t('auth.login')}
            {mode === 'signup' && t('auth.signup')}
            {mode === 'reset' && t('auth.resetPassword')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.back')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!configured && (
          <p className="mb-4 rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
            {t('auth.notConfigured')}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'signup' && (
            <Field icon={User} value={name} onChange={setName} placeholder={t('auth.displayName')} type="text" />
          )}
          {!(mode === 'reset' && resetToken) && <Field icon={Mail} value={email} onChange={setEmail} placeholder={t('auth.email')} type="email" required />}
          {(mode !== 'reset' || resetToken) && (
            <Field icon={Lock} value={password} onChange={setPassword} placeholder={t('auth.password')} type="password" required />
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-success">{success}</p>}

          <button
            type="submit"
            disabled={loading || !configured}
            className="gold-gradient mt-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-primary-foreground disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'login' && t('auth.login')}
            {mode === 'signup' && t('auth.signup')}
            {mode === 'reset' && t('auth.sendReset')}
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-2 text-center text-sm">
          {mode === 'login' && (
            <>
              <button type="button" className="text-primary" onClick={() => setMode('reset')}>
                {t('auth.forgotPassword')}
              </button>
              <button type="button" className="text-primary" onClick={() => setMode('signup')}>
                {t('auth.noAccount')}
              </button>
            </>
          )}
          {mode === 'signup' && (
            <button type="button" className="text-primary" onClick={() => setMode('login')}>
              {t('auth.hasAccount')}
            </button>
          )}
          {mode === 'reset' && (
            <button type="button" className="text-primary" onClick={() => setMode('login')}>
              {t('auth.backToLogin')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({
  icon: Icon,
  value,
  onChange,
  placeholder,
  type,
  required,
}: {
  icon: typeof Mail
  value: string
  onChange: (v: string) => void
  placeholder: string
  type: string
  required?: boolean
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}
