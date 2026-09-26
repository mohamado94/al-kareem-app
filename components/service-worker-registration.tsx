'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || process.env.NODE_ENV !== 'production') return
    let refreshing = false
    const onControllerChange = () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
    void navigator.serviceWorker.register('/sw.js').then(registration => {
      void registration.update()
      const timer = window.setInterval(() => void registration.update(), 60 * 60 * 1000)
      window.addEventListener('pagehide', () => window.clearInterval(timer), { once: true })
    }).catch(() => undefined)
    return () => navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
  }, [])

  return null
}
