import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_PROGRESS } from '../lib/progress/types'
import { validProgress } from '../lib/progress/validation'
import { fetchServerProgress, hasPendingLocalProgress, loadLocalProgress, recoverServerProgress, saveLocalProgress, saveServerProgress, setPendingLocalProgress } from '../lib/progress/storage'
import { expectedOwnerMatchesSession, isCurrentProgressScope } from '../lib/progress/scope'

afterEach(() => vi.unstubAllGlobals())

describe('progress persistence contract', () => {
  it('accepts the complete current progress model and rejects unknown or malformed fields', () => {
    expect(validProgress(structuredClone(DEFAULT_PROGRESS))).toBe(true)
    expect(validProgress({ ...structuredClone(DEFAULT_PROGRESS), injected: true })).toBe(false)
    expect(validProgress({
      ...structuredClone(DEFAULT_PROGRESS),
      exercises: { lesson: { bestScore: 101, completed: 1 } },
    })).toBe(false)
  })

  it('binds every save request to its expected authenticated owner', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      ok: true,
      lastSavedAt: '2026-09-20T12:00:00.000Z',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(saveServerProgress(DEFAULT_PROGRESS, 'account-a')).resolves.toBe('2026-09-20T12:00:00.000Z')
    const request = fetchMock.mock.calls[0]
    expect(JSON.parse(request[1].body)).toMatchObject({ ownerId: 'account-a', progress: DEFAULT_PROGRESS })
    expect(expectedOwnerMatchesSession('account-a', 'account-a')).toBe(true)
    expect(expectedOwnerMatchesSession('account-a', 'account-b')).toBe(false)
    expect(expectedOwnerMatchesSession(undefined, 'account-a')).toBe(false)
  })

  it('never turns a failed server response into an empty successful load or save', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 503 })))
    await expect(fetchServerProgress('account-a')).rejects.toThrow('Progress load failed (503)')
    await expect(saveServerProgress(DEFAULT_PROGRESS, 'account-a')).rejects.toThrow('Progress save failed (503)')
  })
})

describe('account switching isolation', () => {
  it('uses separate browser caches for synthetic accounts A and B', () => {
    const values = new Map<string, string>()
    vi.stubGlobal('window', {})
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    })
    const accountA = structuredClone(DEFAULT_PROGRESS)
    accountA.stats.lastLessonId = 'lesson-a'
    const accountB = structuredClone(DEFAULT_PROGRESS)
    accountB.stats.lastLessonId = 'lesson-b'

    saveLocalProgress(accountA, 'account-a')
    saveLocalProgress(accountB, 'account-b')

    expect(loadLocalProgress('account-a').stats.lastLessonId).toBe('lesson-a')
    expect(loadLocalProgress('account-b').stats.lastLessonId).toBe('lesson-b')
    expect(loadLocalProgress(null).stats.lastLessonId).toBe(DEFAULT_PROGRESS.stats.lastLessonId)
    setPendingLocalProgress('account-a', true)
    expect(hasPendingLocalProgress('account-a')).toBe(true)
    expect(hasPendingLocalProgress('account-b')).toBe(false)
    setPendingLocalProgress('account-a', false)
    expect(hasPendingLocalProgress('account-a')).toBe(false)
  })

  it('rejects a GET response whose authenticated owner changed in flight', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      ownerId: 'account-b', progress: DEFAULT_PROGRESS,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })))
    await expect(fetchServerProgress('account-a')).rejects.toThrow('another account')
  })

  it('uploads a locally pending snapshot on a later login before reporting it recovered', async () => {
    const values = new Map<string, string>()
    vi.stubGlobal('window', {})
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    })
    const pending = structuredClone(DEFAULT_PROGRESS)
    pending.stats.lastLessonId = 'unfinished-lesson'
    pending.ui.exerciseIndex = 6
    pending.stats.lastSavedAt = '2026-09-20T10:00:00.000Z'
    saveLocalProgress(pending, 'account-a')
    setPendingLocalProgress('account-a', true)

    const server = structuredClone(DEFAULT_PROGRESS)
    server.stats.lastSavedAt = '2026-09-19T10:00:00.000Z'
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ ownerId: 'account-a', progress: server }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, lastSavedAt: '2026-09-20T12:00:00.000Z' }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)

    const recovered = await recoverServerProgress('account-a', loadLocalProgress('account-a'), undefined, async () => undefined)
    expect(recovered.stats.lastLessonId).toBe('unfinished-lesson')
    expect(recovered.ui.exerciseIndex).toBe(6)
    expect(recovered.stats.lastSavedAt).toBe('2026-09-20T12:00:00.000Z')
    expect(hasPendingLocalProgress('account-a')).toBe(false)
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).ownerId).toBe('account-a')
  })

  it('restores a six-month-old server checkpoint on a fresh device after re-authentication', async () => {
    const values = new Map<string, string>()
    vi.stubGlobal('window', {})
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    })
    const sixMonthsAgo = structuredClone(DEFAULT_PROGRESS)
    sixMonthsAgo.stats.lastSavedAt = '2026-03-20T12:00:00.000Z'
    sixMonthsAgo.stats.lastLessonId = 'l3'
    sixMonthsAgo.ui.activeTab = 'learn'
    sixMonthsAgo.ui.learnView = JSON.stringify({ kind: 'vocabulary' })
    sixMonthsAgo.ui.guidedLessonKey = 'lesson-greetings:0'
    sixMonthsAgo.ui.guidedConversationStep = 5
    sixMonthsAgo.ui.guidedExerciseIndex = 3
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      ownerId: 'account-a', progress: sixMonthsAgo,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })))

    const recovered = await recoverServerProgress('account-a', loadLocalProgress('account-a'))
    expect(recovered.stats.lastLessonId).toBe('l3')
    expect(recovered.ui).toMatchObject({
      activeTab: 'learn',
      guidedLessonKey: 'lesson-greetings:0',
      guidedConversationStep: 5,
      guidedExerciseIndex: 3,
    })
  })

  it('ignores a delayed response from A after B becomes current', async () => {
    const scopeA = { ownerId: 'account-a', generation: 1 }
    const scopeB = { ownerId: 'account-b', generation: 2 }
    expect(isCurrentProgressScope(scopeA, scopeB.ownerId, scopeB.generation)).toBe(false)
    expect(isCurrentProgressScope(scopeB, scopeB.ownerId, scopeB.generation)).toBe(true)
  })

  it('keeps B displayed when real fetch promises for A and B resolve in reverse order', async () => {
    let resolveA!: (response: Response) => void
    let resolveB!: (response: Response) => void
    const responseA = new Promise<Response>((resolve) => { resolveA = resolve })
    const responseB = new Promise<Response>((resolve) => { resolveB = resolve })
    vi.stubGlobal('fetch', vi.fn((url: string) => url.includes('account-a') ? responseA : responseB))
    const progressA = structuredClone(DEFAULT_PROGRESS)
    progressA.stats.lastLessonId = 'lesson-a'
    const progressB = structuredClone(DEFAULT_PROGRESS)
    progressB.stats.lastLessonId = 'lesson-b'
    let current = { ownerId: 'account-a', generation: 1 }
    let displayed = 'none'
    const scopeA = { ...current }
    const loadA = fetchServerProgress('account-a').then((progress) => {
      if (isCurrentProgressScope(scopeA, current.ownerId, current.generation)) displayed = progress.stats.lastLessonId ?? 'none'
    })
    current = { ownerId: 'account-b', generation: 2 }
    const scopeB = { ...current }
    const loadB = fetchServerProgress('account-b').then((progress) => {
      if (isCurrentProgressScope(scopeB, current.ownerId, current.generation)) displayed = progress.stats.lastLessonId ?? 'none'
    })

    resolveB(new Response(JSON.stringify({ ownerId: 'account-b', progress: progressB }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    await loadB
    resolveA(new Response(JSON.stringify({ ownerId: 'account-a', progress: progressA }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    await loadA
    expect(displayed).toBe('lesson-b')
  })

  it('invalidates an authenticated response after logout to guest mode', () => {
    expect(isCurrentProgressScope({ ownerId: 'account-a', generation: 3 }, null, 4)).toBe(false)
  })
})
