'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/lib/auth/context'
import {
  DEFAULT_PROGRESS,
  type UserProgressData,
  mergeProgress,
} from '@/lib/progress/types'
import {
  loadLocalProgress,
  saveLocalProgress,
  saveServerProgress,
  progressStorageKey,
  setPendingLocalProgress,
  recoverServerProgress,
} from '@/lib/progress/storage'
import { LEVELS } from '@/lib/data'
import { isCurrentProgressScope } from '@/lib/progress/scope'

type ProgressContextValue = {
  progress: UserProgressData
  loading: boolean
  syncStatus: 'local' | 'syncing' | 'synced' | 'error'
  recordActivity: () => void
  updateTopicProgress: (topicId: string, pct: number) => void
  updateLevelProgress: (levelId: string, done: number) => void
  updateLetterIndex: (index: number) => void
  recordExerciseScore: (type: string, score: number, total: number) => void
  markValidatedItems: (topicId: string, itemIds: string[]) => void
  markTopicIntroduced: (topicId: string) => void
  setNotificationsEnabled: (enabled: boolean) => void
  markReminderSent: () => void
  updateUiState: (next: Partial<UserProgressData['ui']>) => void
  updateMediaPosition: (key: string, seconds: number | null) => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

function todayIndex(): number {
  const d = new Date().getDay()
  return d === 0 ? 6 : d - 1
}

function isSameLocalWeek(first: string | null, second: Date): boolean {
  if (!first) return false
  const start = (date: Date) => {
    const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const day = copy.getDay() || 7
    copy.setDate(copy.getDate() - day + 1)
    return copy.getTime()
  }
  return start(new Date(first)) === start(second)
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [progress, setProgress] = useState<UserProgressData>(DEFAULT_PROGRESS)
  const [loading, setLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<ProgressContextValue['syncStatus']>('local')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressRef = useRef<UserProgressData>(DEFAULT_PROGRESS)
  const ownerRef = useRef<string | null>(null)
  const generationRef = useRef(0)
  const mutationVersionRef = useRef(0)
  const loadAbortRef = useRef<AbortController | null>(null)
  const saveChains = useRef(new Map<string, Promise<void>>())
  const hydrated = useRef(false)

  // Load progress on mount / auth change
  useEffect(() => {
    if (authLoading) return

    const ownerId = user?.id ?? null
    const generation = generationRef.current + 1
    const scope = { ownerId, generation }
    generationRef.current = generation
    ownerRef.current = ownerId
    mutationVersionRef.current = 0
    loadAbortRef.current?.abort()
    const controller = new AbortController()
    loadAbortRef.current = controller

    if (saveTimer.current) {
      clearTimeout(saveTimer.current)
      saveTimer.current = null
    }
    hydrated.current = false
    setLoading(true)
    setSyncStatus(ownerId ? 'syncing' : 'local')

    async function load() {
      try {
        // Guest progress is deliberately isolated. On a shared device it must
        // never be silently attached to every account that signs in.
        const local = loadLocalProgress(ownerId)

        if (ownerId) {
          const merged = await recoverServerProgress(ownerId, local, controller.signal)
          if (controller.signal.aborted || !isCurrentProgressScope(scope, ownerRef.current, generationRef.current)) return
          progressRef.current = merged
          setProgress(merged)
          saveLocalProgress(merged, ownerId)
          setSyncStatus('synced')
        } else {
          if (!isCurrentProgressScope(scope, ownerRef.current, generationRef.current)) return
          progressRef.current = local
          setProgress(local)
          setSyncStatus('local')
        }
      } catch (error) {
        if (controller.signal.aborted || !isCurrentProgressScope(scope, ownerRef.current, generationRef.current)) return
        const local = loadLocalProgress(ownerId)
        progressRef.current = local
        setProgress(local)
        setSyncStatus(ownerId ? 'error' : 'local')
      } finally {
        if (!isCurrentProgressScope(scope, ownerRef.current, generationRef.current)) return
        hydrated.current = true
        setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [user, authLoading])

  // Keep two open tabs on the same account in sync without allowing an older
  // tab to move completed work backwards.
  useEffect(() => {
    const key = progressStorageKey(user?.id)
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key || !event.newValue) return
      const incoming = loadLocalProgress(user?.id)
      const merged = mergeProgress(progressRef.current, incoming)
      progressRef.current = merged
      setProgress(merged)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [user?.id])

  const persist = useCallback(
    (update: (current: UserProgressData) => UserProgressData) => {
      if (!hydrated.current) return
      const ownerId = ownerRef.current
      const generation = generationRef.current
      const scope = { ownerId, generation }
      const mutationVersion = mutationVersionRef.current + 1
      mutationVersionRef.current = mutationVersion
      const next = update(progressRef.current)
      const stamped = {
        ...next,
        stats: { ...next.stats, lastSavedAt: new Date().toISOString() },
      }
      progressRef.current = stamped
      setProgress(stamped)
      saveLocalProgress(stamped, ownerId)
      if (ownerId) setPendingLocalProgress(ownerId, true)
      setSyncStatus('local')

      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(async () => {
        if (!ownerId || !isCurrentProgressScope(scope, ownerRef.current, generationRef.current)) return
        setSyncStatus('syncing')
        const existing = saveChains.current.get(ownerId) ?? Promise.resolve()
        const request = existing.catch(() => undefined).then(async () => {
          if (!isCurrentProgressScope(scope, ownerRef.current, generationRef.current)) return
          try {
            let lastSavedAt: string | null = null
            for (let attempt = 0; attempt < 3; attempt += 1) {
              if (!isCurrentProgressScope(scope, ownerRef.current, generationRef.current)) return
              try {
                lastSavedAt = await saveServerProgress(stamped, ownerId)
                break
              } catch (error) {
                if (attempt === 2) throw error
                await new Promise((resolve) => window.setTimeout(resolve, 300 * (attempt + 1)))
              }
            }
            if (!lastSavedAt) throw new Error('Progress save was not confirmed')
            if (!isCurrentProgressScope(scope, ownerRef.current, generationRef.current)) return
            if (mutationVersionRef.current === mutationVersion) {
              const confirmed = {
                ...progressRef.current,
                stats: { ...progressRef.current.stats, lastSavedAt },
              }
              progressRef.current = confirmed
              setProgress(confirmed)
              saveLocalProgress(confirmed, ownerId)
              setPendingLocalProgress(ownerId, false)
              setSyncStatus('synced')
            }
          } catch {
            if (isCurrentProgressScope(scope, ownerRef.current, generationRef.current)
              && mutationVersionRef.current === mutationVersion) setSyncStatus('error')
          }
        })
        saveChains.current.set(ownerId, request)
        await request
        if (saveChains.current.get(ownerId) === request) saveChains.current.delete(ownerId)
      }, 800)
    },
    [],
  )

  useEffect(() => {
    if (syncStatus !== 'error') return
    const retryWhenOnline = () => persist((current) => current)
    window.addEventListener('online', retryWhenOnline)
    return () => window.removeEventListener('online', retryWhenOnline)
  }, [persist, syncStatus])

  const recordActivity = useCallback(() => {
    persist((prev) => {
      const now = new Date().toISOString()
      const last = prev.stats.lastActivityAt
      let streak = prev.stats.streak

      if (last) {
        const lastDate = new Date(last).toDateString()
        const today = new Date().toDateString()
        const yesterday = new Date(Date.now() - 86400000).toDateString()
        if (lastDate !== today) {
          streak = lastDate === yesterday ? streak + 1 : 1
        }
      } else {
        streak = 1
      }

      const week = isSameLocalWeek(last, new Date())
        ? [...prev.weekActivity]
        : [0, 0, 0, 0, 0, 0, 0]
      week[todayIndex()] = Math.min(100, week[todayIndex()] + 10)

      const next: UserProgressData = {
        ...prev,
        stats: {
          ...prev.stats,
          lastActivityAt: now,
          streak,
        },
        weekActivity: week,
        lastReminderSentAt: null,
      }
      return next
    })
  }, [persist])

  const updateTopicProgress = useCallback(
    (topicId: string, pct: number) => {
      persist((current) => ({
        ...current,
        topics: { ...current.topics, [topicId]: Math.min(100, Math.max(0, pct)) },
        stats: {
          ...current.stats,
          lastTopicId: topicId,
          lastLessonProgress: pct,
        },
      }))
      recordActivity()
    },
    [persist, recordActivity],
  )

  const updateLevelProgress = useCallback(
    (levelId: string, done: number) => {
      persist((current) => {
        const level = current.levels[levelId]
        if (!level) return current
        const total = Math.max(1, LEVELS.find((item) => item.id === levelId)?.unitCount ?? 1)
        return {
          ...current,
          levels: { ...current.levels, [levelId]: { ...level, done } },
          stats: {
            ...current.stats,
            lastLessonId: levelId,
            lastLessonProgress: Math.round((done / total) * 100),
            lessonsDone: current.stats.lessonsDone + (done > level.done ? 1 : 0),
          },
        }
      })
      recordActivity()
    },
    [persist, recordActivity],
  )

  const updateLetterIndex = useCallback(
    (index: number) => {
      persist((current) => ({
        ...current,
        stats: { ...current.stats, letterIndex: index },
      }))
    },
    [persist],
  )

  const markValidatedItems = useCallback((topicId: string, itemIds: string[]) => {
    if (!itemIds.length) return
    persist((current) => {
      const topicItems = { ...(current.validatedItems[topicId] ?? {}) }
      for (const itemId of itemIds) topicItems[itemId] = true
      return { ...current, validatedItems: { ...current.validatedItems, [topicId]: topicItems } }
    })
    recordActivity()
  }, [persist, recordActivity])

  const markTopicIntroduced = useCallback((topicId: string) => {
    persist((current) => ({ ...current, introducedTopics: { ...current.introducedTopics, [topicId]: true } }))
    recordActivity()
  }, [persist, recordActivity])

  const recordExerciseScore = useCallback(
    (type: string, score: number, total: number) => {
      const pct = Math.round((score / total) * 100)
      persist((current) => {
        const previous = current.exercises[type] ?? { bestScore: 0, completed: 0 }
        return {
        ...current,
        exercises: {
          ...current.exercises,
          [type]: {
            bestScore: Math.max(previous.bestScore, pct),
            completed: previous.completed + 1,
          },
        },
      }})
      recordActivity()
    },
    [persist, recordActivity],
  )

  const setNotificationsEnabled = useCallback(
    (enabled: boolean) => {
      persist((current) => ({ ...current, notificationsEnabled: enabled }))
    },
    [persist],
  )

  const markReminderSent = useCallback(() => {
    persist((current) => ({ ...current, lastReminderSentAt: new Date().toISOString() }))
  }, [persist])

  const updateUiState = useCallback(
    (next: Partial<UserProgressData['ui']>) => {
      persist((current) => ({ ...current, ui: { ...current.ui, ...next } }))
    },
    [persist],
  )

  const updateMediaPosition = useCallback((key: string, seconds: number | null) => {
    persist((current) => {
      const mediaPositions = { ...current.mediaPositions }
      if (seconds === null) delete mediaPositions[key]
      else mediaPositions[key] = { seconds: Math.max(0, seconds), updatedAt: new Date().toISOString() }
      return { ...current, mediaPositions }
    })
  }, [persist])

  const value = useMemo(
    () => ({
      progress,
      loading,
      syncStatus,
      recordActivity,
      updateTopicProgress,
      updateLevelProgress,
      updateLetterIndex,
      recordExerciseScore,
      markValidatedItems,
      markTopicIntroduced,
      setNotificationsEnabled,
      markReminderSent,
      updateUiState,
      updateMediaPosition,
    }),
    [
      progress,
      loading,
      syncStatus,
      recordActivity,
      updateTopicProgress,
      updateLevelProgress,
      updateLetterIndex,
      recordExerciseScore,
      markValidatedItems,
      markTopicIntroduced,
      setNotificationsEnabled,
      markReminderSent,
      updateUiState,
      updateMediaPosition,
    ],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
