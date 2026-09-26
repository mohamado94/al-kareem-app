import { readFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const input = process.argv[2]
if (!input) process.exit(2)
const encoded = (await readFile(input)).toString('base64')
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const result = await page.evaluate(async (base64) => {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  const context = new AudioContext()
  const audio = await context.decodeAudioData(bytes.buffer)
  const samples = audio.getChannelData(0)
  const windowSize = Math.max(1, Math.floor(audio.sampleRate * 0.02))
  const rms = []
  let peak = 0
  for (let start = 0; start < samples.length; start += windowSize) {
    let sum = 0
    const end = Math.min(samples.length, start + windowSize)
    for (let i = start; i < end; i++) sum += samples[i] * samples[i]
    const value = Math.sqrt(sum / Math.max(1, end - start))
    rms.push(value)
    peak = Math.max(peak, value)
  }
  const candidates = []
  for (const fraction of [0.012, 0.018, 0.025, 0.035, 0.05]) {
    const threshold = peak * fraction
    const raw = []
    let activeStart = null
    for (let index = 0; index < rms.length; index++) {
      if (rms[index] > threshold && activeStart === null) activeStart = index
      if (rms[index] <= threshold && activeStart !== null) {
        if ((index - activeStart) * 0.02 >= 0.08) raw.push([activeStart * 0.02, index * 0.02])
        activeStart = null
      }
    }
    const merged = []
    for (const segment of raw) {
      const last = merged.at(-1)
      if (last && segment[0] - last[1] < 0.16) last[1] = segment[1]
      else merged.push(segment)
    }
    candidates.push({ fraction, threshold, segments: merged })
  }
  await context.close()
  return { duration: audio.duration, sampleRate: audio.sampleRate, peak, candidates }
}, encoded)
console.log(JSON.stringify(result, null, 2))
await browser.close()
