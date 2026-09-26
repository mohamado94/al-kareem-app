import type { UserProgressData } from './types'
import { DEFAULT_PROGRESS, PROGRESS_STORAGE_KEY } from './types'
import { mergeProgress } from './types'

export function progressStorageKey(ownerId?: string | null): string {
  return `${PROGRESS_STORAGE_KEY}:${ownerId ?? 'guest'}`
}

function pendingStorageKey(ownerId: string): string {
  return `${progressStorageKey(ownerId)}:pending`
}

export function hasPendingLocalProgress(ownerId: string): boolean {
  return typeof window !== 'undefined' && localStorage.getItem(pendingStorageKey(ownerId)) === '1'
}

export function setPendingLocalProgress(ownerId: string, pending: boolean): void {
  if (typeof window === 'undefined') return
  if (pending) localStorage.setItem(pendingStorageKey(ownerId), '1')
  else localStorage.removeItem(pendingStorageKey(ownerId))
}

export function loadLocalProgress(ownerId?: string | null): UserProgressData {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS
  try {
    const raw = localStorage.getItem(progressStorageKey(ownerId))
    if (!raw) return { ...DEFAULT_PROGRESS }
    const parsed = JSON.parse(raw) as Partial<UserProgressData>
    const legacyStats = (parsed.stats ?? {}) as Partial<UserProgressData['stats']> & Record<string, unknown>
    const { xp: _xp, minutes: _minutes, dailyXp: _dailyXp, ...currentStats } = legacyStats
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      levels: { ...DEFAULT_PROGRESS.levels, ...parsed.levels },
      topics: { ...DEFAULT_PROGRESS.topics, ...parsed.topics },
      prophets: { ...DEFAULT_PROGRESS.prophets, ...parsed.prophets },
      exercises: { ...DEFAULT_PROGRESS.exercises, ...parsed.exercises },
      stats: { ...DEFAULT_PROGRESS.stats, ...currentStats },
      achievements: { ...DEFAULT_PROGRESS.achievements, ...parsed.achievements },
      skills: { ...DEFAULT_PROGRESS.skills, ...parsed.skills },
      mediaPositions: { ...DEFAULT_PROGRESS.mediaPositions, ...parsed.mediaPositions },
      ui: { ...DEFAULT_PROGRESS.ui, ...parsed.ui },
    }
  } catch {
    return { ...DEFAULT_PROGRESS }
  }
}

export function saveLocalProgress(data: UserProgressData, ownerId?: string | null): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(progressStorageKey(ownerId), JSON.stringify(data))
}

export async function fetchServerProgress(ownerId: string, signal?: AbortSignal): Promise<UserProgressData> {
  const query = new URLSearchParams({ ownerId })
  const res = await fetch(`/api/progress?${query}`, { credentials: 'include', signal })
  if (!res.ok) throw new Error(`Progress load failed (${res.status})`)
  const json = await res.json()
  if (json.ownerId !== ownerId) throw new Error('Progress load returned data for another account')
  if (!json.progress) throw new Error('Progress load returned no data')
  return json.progress
}

export async function saveServerProgress(data: UserProgressData, ownerId: string, signal?: AbortSignal): Promise<string> {
  const res = await fetch('/api/progress', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ownerId, progress: data }),
    signal,
  })
  if (!res.ok) throw new Error(`Progress save failed (${res.status})`)
  const json = await res.json()
  if (typeof json.lastSavedAt !== 'string') throw new Error('Progress save returned no timestamp')
  return json.lastSavedAt
}

export async function recoverServerProgress(
  ownerId: string,
  local: UserProgressData,
  signal?: AbortSignal,
  retryDelay: (attempt: number) => Promise<void> = (attempt) => new Promise((resolve) => setTimeout(resolve, 300 * attempt)),
): Promise<UserProgressData> {
  const pending = hasPendingLocalProgress(ownerId)
  const server = await fetchServerProgress(ownerId, signal)
  let merged = mergeProgress(local, server)
  if (!pending) return merged

  let lastSavedAt: string | null = null
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      lastSavedAt = await saveServerProgress(merged, ownerId, signal)
      break
    } catch (error) {
      if (signal?.aborted || attempt === 3) throw error
      await retryDelay(attempt)
    }
  }
  if (!lastSavedAt) throw new Error('Pending progress was not confirmed')
  merged = { ...merged, stats: { ...merged.stats, lastSavedAt } }
  saveLocalProgress(merged, ownerId)
  setPendingLocalProgress(ownerId, false)
  return merged
}
