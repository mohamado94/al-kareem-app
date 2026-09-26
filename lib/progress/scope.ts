export type ProgressScope = { ownerId: string | null; generation: number }

export function isCurrentProgressScope(
  scope: ProgressScope,
  currentOwnerId: string | null,
  currentGeneration: number,
): boolean {
  return scope.ownerId === currentOwnerId && scope.generation === currentGeneration
}

export function expectedOwnerMatchesSession(expectedOwnerId: unknown, sessionUserId: string): boolean {
  return typeof expectedOwnerId === 'string' && expectedOwnerId === sessionUserId
}
