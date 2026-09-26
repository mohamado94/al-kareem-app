export function addUniqueMistake(indexes: number[], index: number) {
  return indexes.includes(index) ? indexes : [...indexes, index]
}

export function initialAttemptSummary(total: number, mistakeIndexes: number[]) {
  const uniqueMistakes = new Set(mistakeIndexes).size
  return { score: Math.max(0, total - uniqueMistakes), mistakes: uniqueMistakes }
}

export type CorrectionAdvance =
  | { kind: 'next'; position: number }
  | { kind: 'repeat'; queue: number[] }
  | { kind: 'complete' }

export function advanceCorrection(queue: number[], position: number, missedThisRound: number[]): CorrectionAdvance {
  if (position + 1 < queue.length) return { kind: 'next', position: position + 1 }
  const nextQueue = [...new Set(missedThisRound)]
  if (nextQueue.length) return { kind: 'repeat', queue: nextQueue }
  return { kind: 'complete' }
}
