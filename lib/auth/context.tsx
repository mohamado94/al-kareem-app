'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthUser } from '@/lib/auth/session'

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  configured: boolean
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: string | null; needsVerification?: boolean }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  completePasswordReset: (token: string, password: string) => Promise<{ error: string | null }>
  deleteAccount: (password: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function authFetch(path: string, body?: object) {
  const res = await fetch(path, {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => ({}))
  return { res, json }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [configured, setConfigured] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => {
        return r.json()
      })
      .then((data) => {
        setConfigured(data.configured !== false)
        setUser(data.user ?? null)
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    const { res, json } = await authFetch('/api/auth/signup', { email, password, displayName })
    if (!res.ok) return { error: json.error ?? 'auth.error.generic' }
    if (json.user) setUser(json.user)
    return { error: null, needsVerification: json.needsVerification === true }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { res, json } = await authFetch('/api/auth/login', { email, password })
    if (!res.ok) return { error: json.error ?? 'auth.error.invalidCredentials' }
    setUser(json.user)
    return { error: null }
  }, [])

  const signOut = useCallback(async () => {
    await authFetch('/api/auth/logout')
    setUser(null)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    const { res, json } = await authFetch('/api/auth/reset-password', { email })
    return { error: json.error ?? (res.ok ? null : 'auth.error.generic') }
  }, [])

  const completePasswordReset = useCallback(async (token: string, password: string) => {
    const { res, json } = await authFetch('/api/auth/reset-password', { token, password })
    return { error: json.error ?? (res.ok ? null : 'auth.error.generic') }
  }, [])

  const deleteAccount = useCallback(async (password: string) => {
    const res = await fetch('/api/account', { method: 'DELETE', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) return { error: json.error ?? 'auth.error.generic' }
    setUser(null)
    return { error: null }
  }, [])

  const value = useMemo(
    () => ({ user, loading, configured, signUp, signIn, signOut, resetPassword, completePasswordReset, deleteAccount }),
    [user, loading, configured, signUp, signIn, signOut, resetPassword, completePasswordReset, deleteAccount],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
