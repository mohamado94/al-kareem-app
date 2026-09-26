import type { UserProgressData } from './types'

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasOnlyKeys(value: UnknownRecord, allowed: readonly string[]): boolean {
  const allowedKeys = new Set(allowed)
  return Object.keys(value).every((key) => allowedKeys.has(key))
}

function isBoundedRecord(value: unknown, maximum: number): value is UnknownRecord {
  return isRecord(value) && Object.keys(value).length <= maximum
}

function isValidDate(value: unknown): value is string | null {
  if (value === null) return true
  if (typeof value !== 'string' || value.length > 40) return false
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) && timestamp <= Date.now() + 5 * 60_000
}

function isFiniteNumber(value: unknown, minimum = 0, maximum = Number.MAX_SAFE_INTEGER): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= minimum && value <= maximum
}

export function validProgress(value: unknown): value is UserProgressData {
  if (!isRecord(value) || !hasOnlyKeys(value, [
    'levels', 'topics', 'prophets', 'exercises', 'validatedItems', 'introducedTopics',
    'stats', 'achievements', 'skills', 'mediaPositions', 'weekActivity',
    'notificationsEnabled', 'lastReminderSentAt', 'ui',
  ])) return false

  const { stats, ui } = value
  if (!isRecord(stats) || !hasOnlyKeys(stats, [
    'streak', 'lessonsDone', 'lastActivityAt', 'lastLessonId', 'lastLessonProgress',
    'lastTopicId', 'letterIndex', 'lastSavedAt',
  ])) return false
  if (!isFiniteNumber(stats.streak) || !isFiniteNumber(stats.lessonsDone)
    || !isFiniteNumber(stats.lastLessonProgress, 0, 100) || !isFiniteNumber(stats.letterIndex)
    || !isValidDate(stats.lastActivityAt) || !isValidDate(stats.lastSavedAt)
    || !(stats.lastLessonId === null || typeof stats.lastLessonId === 'string')
    || !(stats.lastTopicId === null || typeof stats.lastTopicId === 'string')) return false

  if (!isBoundedRecord(value.levels, 20)
    || !Object.values(value.levels).every((entry) => isRecord(entry)
      && hasOnlyKeys(entry, ['done', 'locked'])
      && isFiniteNumber(entry.done) && typeof entry.locked === 'boolean')) return false
  if (!isBoundedRecord(value.topics, 100)
    || !Object.values(value.topics).every((entry) => isFiniteNumber(entry, 0, 100))) return false
  if (!isBoundedRecord(value.prophets, 100)
    || !Object.values(value.prophets).every((entry) => isRecord(entry)
      && hasOnlyKeys(entry, ['locked', 'episodesWatched'])
      && typeof entry.locked === 'boolean' && isFiniteNumber(entry.episodesWatched))) return false
  if (!isBoundedRecord(value.exercises, 200)
    || !Object.values(value.exercises).every((entry) => isRecord(entry)
      && hasOnlyKeys(entry, ['bestScore', 'completed'])
      && isFiniteNumber(entry.bestScore, 0, 100) && isFiniteNumber(entry.completed))) return false
  if (!isBoundedRecord(value.validatedItems, 100)
    || !Object.values(value.validatedItems).every((items) => isBoundedRecord(items, 500)
      && Object.values(items).every((entry) => entry === true))) return false
  if (!isBoundedRecord(value.introducedTopics, 100)
    || !Object.values(value.introducedTopics).every((entry) => entry === true)) return false
  if (!isBoundedRecord(value.achievements, 100)
    || !Object.values(value.achievements).every((entry) => typeof entry === 'boolean')) return false
  if (!isBoundedRecord(value.skills, 100)
    || !Object.values(value.skills).every((entry) => isFiniteNumber(entry, 0, 100))) return false
  if (!isBoundedRecord(value.mediaPositions, 500)
    || !Object.values(value.mediaPositions).every((entry) => isRecord(entry)
      && hasOnlyKeys(entry, ['seconds', 'updatedAt'])
      && isFiniteNumber(entry.seconds, 0, 86_400) && isValidDate(entry.updatedAt))) return false
  if (!Array.isArray(value.weekActivity) || value.weekActivity.length !== 7
    || !value.weekActivity.every((entry) => isFiniteNumber(entry, 0, 100))) return false
  if (typeof value.notificationsEnabled !== 'boolean' || !isValidDate(value.lastReminderSentAt)) return false

  if (!isRecord(ui) || !hasOnlyKeys(ui, [
    'activeTab', 'learnView', 'learnLetterIndex', 'readingWordIndex', 'exerciseType',
    'exerciseSessionSeed', 'exerciseIndex', 'exerciseScore', 'exerciseSelected', 'exerciseChecked',
    'guidedLessonKey', 'guidedExerciseIndex', 'guidedAnswer', 'guidedBuiltTokens', 'guidedMistakes',
    'guidedFinished', 'guidedChoiceSeed', 'guidedConversationStep', 'guidedPracticeStarted',
    'guidedChapterStarted', 'guidedValidated', 'guidedValidationCorrect', 'guidedInitialMistakeIndexes',
    'guidedInitialPassComplete', 'guidedReviewQueue', 'guidedReviewPosition',
    'guidedReviewMistakeIndexes', 'guidedReviewRound',
  ])) return false
  return typeof ui.activeTab === 'string'
    && typeof ui.learnView === 'string'
    && isFiniteNumber(ui.learnLetterIndex)
    && isFiniteNumber(ui.readingWordIndex)
    && (ui.exerciseType === null || typeof ui.exerciseType === 'string')
    && (ui.exerciseSessionSeed === null || typeof ui.exerciseSessionSeed === 'string')
    && isFiniteNumber(ui.exerciseIndex)
    && isFiniteNumber(ui.exerciseScore)
    && (ui.exerciseSelected === null || isFiniteNumber(ui.exerciseSelected))
    && typeof ui.exerciseChecked === 'boolean'
    && (ui.guidedLessonKey === null || typeof ui.guidedLessonKey === 'string')
    && isFiniteNumber(ui.guidedExerciseIndex)
    && (ui.guidedAnswer === null || typeof ui.guidedAnswer === 'string')
    && Array.isArray(ui.guidedBuiltTokens) && ui.guidedBuiltTokens.length <= 30 && ui.guidedBuiltTokens.every((item) => typeof item === 'string')
    && isFiniteNumber(ui.guidedMistakes)
    && typeof ui.guidedFinished === 'boolean'
    && isFiniteNumber(ui.guidedChoiceSeed)
    && isFiniteNumber(ui.guidedConversationStep)
    && typeof ui.guidedPracticeStarted === 'boolean'
    && typeof ui.guidedChapterStarted === 'boolean'
    && typeof ui.guidedValidated === 'boolean'
    && (ui.guidedValidationCorrect === null || typeof ui.guidedValidationCorrect === 'boolean')
    && validIndexArray(ui.guidedInitialMistakeIndexes)
    && typeof ui.guidedInitialPassComplete === 'boolean'
    && (ui.guidedReviewQueue === null || validIndexArray(ui.guidedReviewQueue))
    && isFiniteNumber(ui.guidedReviewPosition)
    && validIndexArray(ui.guidedReviewMistakeIndexes)
    && isFiniteNumber(ui.guidedReviewRound)
}

function validIndexArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.length <= 200 && value.every((item) => Number.isInteger(item) && item >= 0)
}
