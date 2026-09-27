/**
 * Deterministic, well-mixed shuffling for exercise choices.
 *
 * Every permutation is a full Fisher–Yates shuffle driven by a PRNG seeded
 * from a string key. Callers include the question identity in the key, so two
 * consecutive questions get independent permutations: options shared by both
 * questions are repositioned too, instead of keeping their slot while only one
 * choice is replaced. The same key always yields the same order, which keeps a
 * restored session stable.
 */
export function seedFromKey(key: string) {
  let value = 2166136261
  for (let index = 0; index < key.length; index++) {
    value ^= key.charCodeAt(index)
    value = Math.imul(value, 16777619)
  }
  // Final avalanche so that keys differing by one character diverge fully.
  value ^= value >>> 16
  value = Math.imul(value, 0x85ebca6b)
  value ^= value >>> 13
  value = Math.imul(value, 0xc2b2ae35)
  value ^= value >>> 16
  return value >>> 0
}

export function mulberry32(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seededShuffle<T>(items: readonly T[], key: string): T[] {
  const rnd = mulberry32(seedFromKey(key))
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index--) {
    const target = Math.floor(rnd() * (index + 1))
    ;[copy[index], copy[target]] = [copy[target], copy[index]]
  }
  return copy
}
