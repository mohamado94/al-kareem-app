'use client'

import { useCallback, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/auth/context'
import { useProgress } from '@/lib/progress/context'
import { Capacitor } from '@capacitor/core'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

export function useNotifications() {
  const { t } = useI18n()
  const { user } = useAuth()
  const { progress, setNotificationsEnabled, markReminderSent } = useProgress()
  const supported = !Capacitor.isNativePlatform() && typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator

  // A guest may grant notification permission before signing in. Associate an
  // existing browser subscription as soon as an authenticated user is known.
  useEffect(() => {
    if (!supported || !user || !progress.notificationsEnabled) return
    void navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((subscription) => {
        if (!subscription) return
        const sub = subscription.toJSON()
        return fetch('/api/notifications/subscribe', {
          method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint, keys: sub.keys }),
        })
      })
      .catch(() => undefined)
  }, [supported, user, progress.notificationsEnabled])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!supported) {
      return false
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return false

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidKey) return false

    const reg = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready

    let subscription = await reg.pushManager.getSubscription()
    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      })
    }

    if (user) {
      const sub = subscription.toJSON()
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: sub.keys,
        }),
      })
    }

    setNotificationsEnabled(true)
    return true
  }, [supported, user, setNotificationsEnabled])

  const disableNotifications = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        if (user) {
          await fetch('/api/notifications/subscribe', {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          })
        }
        await sub.unsubscribe()
      }
    }
    setNotificationsEnabled(false)
  }, [user, setNotificationsEnabled])

  useEffect(() => {
    if (!progress.notificationsEnabled) return
    if (!progress.stats.lastActivityAt) return
    if (!('Notification' in window) || Notification.permission !== 'granted') return

    const lastActivity = new Date(progress.stats.lastActivityAt).getTime()
    const elapsed = Date.now() - lastActivity
    const TWENTY_FOUR_H = 24 * 60 * 60 * 1000

    if (elapsed < TWENTY_FOUR_H) return

    if (progress.lastReminderSentAt) {
      const lastReminder = new Date(progress.lastReminderSentAt).getTime()
      if (lastReminder > lastActivity) return
    }

    new Notification(t('notif.reminderTitle'), {
      body: t('notif.reminderBody'),
      icon: '/icon-192.png',
      tag: 'alkarim-streak-reminder',
    })
    markReminderSent()
  }, [progress, t, markReminderSent])

  return { requestPermission, disableNotifications, enabled: progress.notificationsEnabled, supported }
}
