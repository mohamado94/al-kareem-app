import { describe, expect, it } from 'vitest'
import { isRecord, readJson, rejectCrossOrigin, validEmail } from '../lib/api-security'

describe('API security helpers', () => {
  it('accepts the configured application origin and rejects another origin', () => {
    const previous = process.env.PUBLIC_APP_URL
    process.env.PUBLIC_APP_URL = 'https://app.alkareem.test'
    expect(rejectCrossOrigin(new Request('https://app.alkareem.test/api/progress', { headers: { origin: 'https://app.alkareem.test' } }))).toBeNull()
    expect(rejectCrossOrigin(new Request('https://app.alkareem.test/api/progress', { headers: { origin: 'https://attacker.test' } }))?.status).toBe(403)
    process.env.PUBLIC_APP_URL = previous
  })

  it('validates email and record shapes', () => {
    expect(validEmail('person@example.com')).toBe(true)
    expect(validEmail('not-an-email')).toBe(false)
    expect(isRecord({ ok: true })).toBe(true)
    expect(isRecord([])).toBe(false)
  })

  it('rejects a JSON body above its byte limit', async () => {
    const request = new Request('https://app.alkareem.test/api/test', { method: 'POST', body: JSON.stringify({ value: 'long' }) })
    await expect(readJson(request, 5)).rejects.toThrow('BODY_TOO_LARGE')
  })
})
