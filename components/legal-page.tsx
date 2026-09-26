import Link from 'next/link'
import type { ReactNode } from 'react'

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground">
      <article className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10">
        <Link href="/" className="text-sm font-semibold text-primary">← Retour à Al-Kareem</Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Dernière mise à jour : {updated}</p>
        <div className="mt-8 space-y-7 text-sm leading-7 text-foreground [&_a]:font-semibold [&_a]:text-primary [&_h2]:text-xl [&_h2]:font-bold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:ps-5">
          {children}
        </div>
      </article>
    </main>
  )
}
