import postgres from 'postgres'

let sql: ReturnType<typeof postgres> | null = null

function getDatabaseUrl(): string | undefined {
  // Supabase's official Vercel integration provides POSTGRES_URL. Keep
  // DATABASE_URL as the provider-neutral override for other deployments.
  return process.env.DATABASE_URL || process.env.POSTGRES_URL
}

export function isDatabaseConfigured(): boolean {
  return Boolean(getDatabaseUrl() && process.env.JWT_SECRET)
}

export function getDb() {
  const url = getDatabaseUrl()
  if (!url) throw new Error('DATABASE_URL or POSTGRES_URL is not configured')
  if (!sql) {
    const isLocal = url.includes('localhost') || url.includes('127.0.0.1')
    sql = postgres(url, {
      ssl: isLocal ? false : 'require',
      // Vercel functions must keep a very small connection footprint. Supabase's
      // transaction pooler also does not support prepared statements reliably.
      max: isLocal ? 10 : 1,
      prepare: isLocal,
    })
  }
  return sql
}
