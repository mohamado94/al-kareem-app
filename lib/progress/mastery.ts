import { GRAMMAR, LETTERS, READING_WORDS } from '@/lib/data'

export const TOPIC_MASTERY_TOTALS: Record<string, number> = {
  alphabet: LETTERS.length,
  positions: LETTERS.length * 4,
  'short-vowels': LETTERS.length * 3,
  'long-vowels': LETTERS.length * 3,
  tanwin: LETTERS.length * 3,
  reading: READING_WORDS.length,
  vocabulary: 13,
  grammar: GRAMMAR.length,
}

export function masteryItemCount(topicId: string, validatedItems: Record<string, Record<string, true>>): number {
  const keys = Object.keys(validatedItems[topicId] ?? {})
  if (topicId === 'alphabet') return keys.filter((key) => key.startsWith('letter:')).length
  if (topicId === 'vocabulary') return keys.filter((key) => key.startsWith('lesson:')).length
  if (topicId === 'grammar') return keys.filter((key) => key.startsWith('rule:')).length
  if (topicId === 'reading') return keys.filter((key) => key.startsWith('word:')).length
  return keys.length
}

export function topicMasteryProgress(topicId: string, validatedItems: Record<string, Record<string, true>>): number {
  const total = TOPIC_MASTERY_TOTALS[topicId] ?? 0
  if (!total) return 0
  const completed = masteryItemCount(topicId, validatedItems)
  if (completed >= total) return 100
  return Math.floor((completed / total) * 100)
}

export function topicMasteryComplete(topicId: string, validatedItems: Record<string, Record<string, true>>): boolean {
  const total = TOPIC_MASTERY_TOTALS[topicId] ?? 0
  return total > 0 && masteryItemCount(topicId, validatedItems) >= total
}

export function learningStepUnlocked(topicId: string, orderedTopicIds: string[], validatedItems: Record<string, Record<string, true>>): boolean {
  const index = orderedTopicIds.indexOf(topicId)
  return index <= 0 || topicMasteryComplete(orderedTopicIds[index - 1], validatedItems)
}

export function masteryTopics(validatedItems: Record<string, Record<string, true>>): Record<string, number> {
  return Object.fromEntries(Object.keys(TOPIC_MASTERY_TOTALS).map((topicId) => [topicId, topicMasteryProgress(topicId, validatedItems)]))
}
