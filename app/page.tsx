'use client'

import { useState } from 'react'
import { I18nProvider } from '@/lib/i18n'
import { AuthProvider } from '@/lib/auth/context'
import { ProgressProvider } from '@/lib/progress/context'
import { SplashScreen } from '@/components/splash-screen'
import { AppShell } from '@/components/app-shell'

export default function Page() {
  const [ready, setReady] = useState(false)

  return (
    <I18nProvider>
      <AuthProvider>
        <ProgressProvider>
          <main className="flex min-h-[100dvh] w-full justify-center bg-background">
            <div className="relative h-[100dvh] w-full overflow-hidden bg-background lg:max-w-[1440px]">
              {ready ? <AppShell /> : <SplashScreen onFinish={() => setReady(true)} />}
            </div>
          </main>
        </ProgressProvider>
      </AuthProvider>
    </I18nProvider>
  )
}
