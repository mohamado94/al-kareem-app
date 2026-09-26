export type ProgressStats = {
  streak: number
  lessonsDone: number
  lastActivityAt: string | null
  lastLessonId: string | null
  lastLessonProgress: number
  lastTopicId: string | null
  letterIndex: number
  lastSavedAt: string | null
}

export type UserProgressData = {
  levels: Record<string, { done: number; locked: boolean }>
  topics: Record<string, number>
  prophets: Record<string, { locked: boolean; episodesWatched: number }>
  exercises: Record<string, { bestScore: number; completed: number }>
  validatedItems: Record<string, Record<string, true>>
  introducedTopics: Record<string, true>
  stats: ProgressStats
  achievements: Record<string, boolean>
  skills: Record<string, number>
  mediaPositions: Record<string, { seconds: number; updatedAt: string }>
  weekActivity: number[]
  notificationsEnabled: boolean
  lastReminderSentAt: string | null
  ui: {
    activeTab: string
    learnView: string
    learnLetterIndex: number
    readingWordIndex: number
    exerciseType: string | null
    exerciseSessionSeed: string | null
    exerciseIndex: number
    exerciseScore: number
    exerciseSelected: number | null
    exerciseChecked: boolean
    guidedLessonKey: string | null
    guidedExerciseIndex: number
    guidedAnswer: string | null
    guidedBuiltTokens: string[]
    guidedMistakes: number
    guidedFinished: boolean
    guidedChoiceSeed: number
    guidedConversationStep: number
    guidedPracticeStarted: boolean
    guidedChapterStarted: boolean
    guidedValidated: boolean
    guidedValidationCorrect: boolean | null
    guidedInitialMistakeIndexes: number[]
    guidedInitialPassComplete: boolean
    guidedReviewQueue: number[] | null
    guidedReviewPosition: number
    guidedReviewMistakeIndexes: number[]
    guidedReviewRound: number
  }
}

export const DEFAULT_PROGRESS: UserProgressData = {
  levels: {
    l1: { done: 0, locked: false },
    l2: { done: 0, locked: true },
    l3: { done: 0, locked: true },
    l4: { done: 0, locked: true },
  },
  topics: {
    alphabet: 0,
    positions: 0,
    'short-vowels': 0,
    'long-vowels': 0,
    tanwin: 0,
    reading: 0,
    vocabulary: 0,
    grammar: 0,
  },
  prophets: {
    adam: { locked: false, episodesWatched: 0 },
  },
  exercises: {},
  validatedItems: {},
  introducedTopics: {},
  stats: {
    streak: 0,
    lessonsDone: 0,
    lastActivityAt: null,
    lastLessonId: 'l1',
    lastLessonProgress: 0,
    lastTopicId: 'alphabet',
    letterIndex: 0,
    lastSavedAt: null,
  },
  achievements: {},
  skills: {
    letters: 0,
    vowels: 0,
    reading: 0,
    vocabulary: 0,
    grammar: 0,
  },
  mediaPositions: {},
  weekActivity: [0, 0, 0, 0, 0, 0, 0],
  notificationsEnabled: false,
  lastReminderSentAt: null,
  ui: {
    activeTab: 'home',
    learnView: 'menu',
    learnLetterIndex: 0,
    readingWordIndex: 0,
    exerciseType: null,
    exerciseSessionSeed: null,
    exerciseIndex: 0,
    exerciseScore: 0,
    exerciseSelected: null,
    exerciseChecked: false,
    guidedLessonKey: null,
    guidedExerciseIndex: 0,
    guidedAnswer: null,
    guidedBuiltTokens: [],
    guidedMistakes: 0,
    guidedFinished: false,
    guidedChoiceSeed: 0,
    guidedConversationStep: 0,
    guidedPracticeStarted: false,
    guidedChapterStarted: false,
    guidedValidated: false,
    guidedValidationCorrect: null,
    guidedInitialMistakeIndexes: [],
    guidedInitialPassComplete: false,
    guidedReviewQueue: null,
    guidedReviewPosition: 0,
    guidedReviewMistakeIndexes: [],
    guidedReviewRound: 0,
  },
}

export const PROGRESS_STORAGE_KEY = 'alkarim_progress'

export function mergeProgress(
  base: UserProgressData,
  incoming: Partial<UserProgressData>,
): UserProgressData {
  const maxNumbers = (left: Record<string, number>, right?: Record<string, number>) => {
    const merged = { ...left }
    for (const [key, value] of Object.entries(right ?? {})) {
      if (Number.isFinite(value)) merged[key] = Math.max(merged[key] ?? 0, value)
    }
    return merged
  }
  const levels = { ...base.levels }
  for (const [key, value] of Object.entries(incoming.levels ?? {})) {
    const current = levels[key]
    levels[key] = {
      done: Math.max(current?.done ?? 0, value.done),
      locked: Boolean(current?.locked && value.locked),
    }
  }
  const prophets = { ...base.prophets }
  for (const [key, value] of Object.entries(incoming.prophets ?? {})) {
    const current = prophets[key]
    prophets[key] = {
      episodesWatched: Math.max(current?.episodesWatched ?? 0, value.episodesWatched),
      locked: Boolean(current?.locked && value.locked),
    }
  }
  const exercises = { ...base.exercises }
  for (const [key, value] of Object.entries(incoming.exercises ?? {})) {
    const current = exercises[key]
    exercises[key] = {
      bestScore: Math.max(current?.bestScore ?? 0, value.bestScore),
      completed: Math.max(current?.completed ?? 0, value.completed),
    }
  }
  const validatedItems: Record<string, Record<string, true>> = { ...base.validatedItems }
  for (const [topicId, items] of Object.entries(incoming.validatedItems ?? {})) {
    validatedItems[topicId] = { ...(validatedItems[topicId] ?? {}), ...items }
  }
  const mediaPositions = { ...base.mediaPositions }
  for (const [key, value] of Object.entries(incoming.mediaPositions ?? {})) {
    const current = mediaPositions[key]
    if (!current || Date.parse(value.updatedAt) >= Date.parse(current.updatedAt)) {
      mediaPositions[key] = value
    }
  }
  const savedAt = (value: string | null | undefined) => {
    const timestamp = value ? Date.parse(value) : 0
    return Number.isFinite(timestamp) ? timestamp : 0
  }
  const incomingIsNewer = savedAt(incoming.stats?.lastSavedAt) >= savedAt(base.stats.lastSavedAt)
  const newerStats = incomingIsNewer ? incoming.stats : undefined
  return {
    levels,
    topics: maxNumbers(base.topics, incoming.topics),
    prophets,
    exercises,
    validatedItems,
    introducedTopics: { ...base.introducedTopics, ...(incoming.introducedTopics ?? {}) },
    stats: {
      ...base.stats,
      ...newerStats,
      streak: Math.max(base.stats.streak, incoming.stats?.streak ?? 0),
      lessonsDone: Math.max(base.stats.lessonsDone, incoming.stats?.lessonsDone ?? 0),
      letterIndex: Math.max(base.stats.letterIndex, incoming.stats?.letterIndex ?? 0),
      lastLessonProgress: Math.max(base.stats.lastLessonProgress, incoming.stats?.lastLessonProgress ?? 0),
    },
    achievements: { ...base.achievements, ...incoming.achievements },
    skills: maxNumbers(base.skills, incoming.skills),
    mediaPositions,
    weekActivity: base.weekActivity.map((value, index) => Math.max(value, incoming.weekActivity?.[index] ?? 0)),
    notificationsEnabled: incoming.notificationsEnabled ?? base.notificationsEnabled,
    lastReminderSentAt: incoming.lastReminderSentAt ?? base.lastReminderSentAt,
    ui: incomingIsNewer ? { ...base.ui, ...incoming.ui } : base.ui,
  }
}
