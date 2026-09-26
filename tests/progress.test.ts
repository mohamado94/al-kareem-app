import { describe, expect, it } from 'vitest'
import { DEFAULT_PROGRESS, mergeProgress } from '../lib/progress/types'

describe('mergeProgress', () => {
  it('keeps the furthest learning progress from both devices', () => {
    const local = structuredClone(DEFAULT_PROGRESS)
    local.topics.alphabet = 75
    local.levels.l1.done = 5
    local.stats.lessonsDone = 5

    const server = structuredClone(DEFAULT_PROGRESS)
    server.topics.alphabet = 25
    server.topics.reading = 60
    server.levels.l1.done = 3
    server.stats.lessonsDone = 8

    const merged = mergeProgress(local, server)
    expect(merged.topics.alphabet).toBe(75)
    expect(merged.topics.reading).toBe(60)
    expect(merged.levels.l1.done).toBe(5)
    expect(merged.stats.lessonsDone).toBe(8)
  })

  it('never locks content already unlocked on another device', () => {
    const local = structuredClone(DEFAULT_PROGRESS)
    local.levels.l2.locked = false
    const server = structuredClone(DEFAULT_PROGRESS)
    server.levels.l2.locked = true
    expect(mergeProgress(local, server).levels.l2.locked).toBe(false)
  })

  it('keeps the most recently watched media position', () => {
    const local = structuredClone(DEFAULT_PROGRESS)
    local.mediaPositions.story = { seconds: 40, updatedAt: '2026-09-12T10:00:00.000Z' }
    const server = structuredClone(DEFAULT_PROGRESS)
    server.mediaPositions.story = { seconds: 15, updatedAt: '2026-09-12T11:00:00.000Z' }
    expect(mergeProgress(local, server).mediaPositions.story.seconds).toBe(15)
  })

  it('restores the exact saved screen and exercise position on a device without local history', () => {
    const freshDevice = structuredClone(DEFAULT_PROGRESS)
    const server = structuredClone(DEFAULT_PROGRESS)
    server.stats.lastSavedAt = '2026-09-20T12:00:00.000Z'
    server.stats.lastLessonId = 'l2'
    server.stats.lastTopicId = 'vocabulary'
    server.ui.activeTab = 'exercises'
    server.ui.learnView = JSON.stringify({ kind: 'reading' })
    server.ui.readingWordIndex = 7
    server.ui.exerciseType = 'listening'
    server.ui.exerciseIndex = 4
    server.ui.exerciseScore = 3

    const restored = mergeProgress(freshDevice, server)
    expect(restored.stats.lastLessonId).toBe('l2')
    expect(restored.stats.lastTopicId).toBe('vocabulary')
    expect(restored.ui).toMatchObject({
      activeTab: 'exercises',
      learnView: JSON.stringify({ kind: 'reading' }),
      readingWordIndex: 7,
      exerciseType: 'listening',
      exerciseIndex: 4,
      exerciseScore: 3,
    })
  })
})
