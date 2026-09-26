import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { ServiceWorkerRegistration } from '@/components/service-worker-registration'

const jakarta = localFont({
  src: './fonts/plus-jakarta-sans-latin.woff2',
  variable: '--font-jakarta',
  display: 'swap',
})

const amiri = localFont({
  src: [
    { path: './fonts/amiri-arabic-regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/amiri-arabic-bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-amiri',
  display: 'swap',
})

export const metadata: Metadata = {
  applicationName: 'Al-Kareem',
  title: 'Al-Kareem — الكريم',
  description:
    "Al-Kareem (الكريم) — Apprenez la langue arabe avec une expérience élégante : lettres, voyelles, tanwin, lecture, prononciation et exercices interactifs.",
  manifest: '/manifest.json',
  category: 'education',
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Al-Kareem',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#e9e0cf',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${jakarta.variable} ${amiri.variable} bg-background`}>
      <body className="antialiased">
        {children}
        <ServiceWorkerRegistration />
        {process.env.VERCEL === '1' && <Analytics />}
      </body>
    </html>
  )
}
