import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { speechErrorText } from '../lib/ui-copy'

const source = readFileSync(resolve(process.cwd(), 'lib/i18n.tsx'), 'utf8')
const extra = readFileSync(resolve(process.cwd(), 'lib/i18n-extra.ts'), 'utf8')
const screens = [
  readFileSync(resolve(process.cwd(), 'components/screens/learn-screen.tsx'), 'utf8'),
  readFileSync(resolve(process.cwd(), 'components/screens/exercises-screen.tsx'), 'utf8'),
].join('\n')

function dictionaryKeys(body: string, declaration: string) {
  const start = body.indexOf(declaration)
  expect(start).toBeGreaterThanOrEqual(0)
  const nextExport = body.indexOf('export const ', start + declaration.length)
  const nextLocal = body.indexOf('const ', start + declaration.length)
  const candidates = [nextExport, nextLocal].filter((index) => index >= 0)
  const end = candidates.length ? Math.min(...candidates) : body.length
  return new Set([...body.slice(start, end).matchAll(/'([^']+)':/g)].map((match) => match[1]))
}

describe('i18n completeness', () => {
  it('keeps all five dictionaries aligned', () => {
    const dictionaries = [
      dictionaryKeys(source, 'const fr: Dict = {'),
      dictionaryKeys(source, 'const en: Dict = {'),
      dictionaryKeys(source, 'const ar: Dict = {'),
      dictionaryKeys(extra, 'export const id: Dict = {'),
      dictionaryKeys(extra, 'export const ms: Dict = {'),
    ]
    const reference = [...dictionaries[0]].sort()
    for (const dictionary of dictionaries.slice(1)) expect([...dictionary].sort()).toEqual(reference)
  })

  it('defines every translation key used by the corrected learning and exercise screens', () => {
    const keys = dictionaryKeys(source, 'const fr: Dict = {')
    const used = [...screens.matchAll(/\bt\('([^']+)'\)/g)].map((match) => match[1])
    expect(used.length).toBeGreaterThan(0)
    for (const key of used) expect(keys.has(key), `missing translation: ${key}`).toBe(true)
  })

  it('provides localized microphone feedback for all five languages', () => {
    const values = (['fr', 'en', 'ar', 'id', 'ms'] as const).map((lang) => speechErrorText(lang, 'permission'))
    expect(new Set(values).size).toBe(5)
  })

  it('keeps language persistence unchanged', () => {
    expect(source).toContain("const LANG_STORAGE_KEY = 'alkarim_lang'")
    expect(source).toContain('localStorage.setItem(LANG_STORAGE_KEY, l)')
  })
})
