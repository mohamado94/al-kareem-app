import fs from 'node:fs/promises'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const appDir = process.cwd()
const rootDir = path.resolve(appDir, '../..')
const workDir = path.join(rootDir, 'work/ilyas-production-1')
const ffmpeg = path.join(rootDir, 'work/video-venv/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1')
const recitationId = 7
const plan = [
  { after: 0, verses: ['37:123'] },
  { after: 1, verses: ['37:124', '37:125', '37:126'] },
  { after: 3, verses: ['37:127', '37:128'] },
  { after: 4, verses: ['37:129', '37:130', '37:131', '37:132'] },
  { after: 5, verses: ['6:85'] },
]

async function verseData(key) {
  const url = `https://api.quran.com/api/v4/verses/by_key/${key}?language=fr&words=true&word_fields=text_uthmani&translations=31&fields=text_uthmani`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Quran API ${response.status} for ${key}`)
  const { verse } = await response.json()
  return { key, arabic: verse.text_uthmani, translation: (verse.translations?.[0]?.text ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(), words: verse.words.filter((word) => word.char_type_name === 'word').map((word) => word.text_uthmani), source: url }
}

const chapters = new Map()
async function chapterData(chapter) {
  if (chapters.has(chapter)) return chapters.get(chapter)
  const response = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${recitationId}/${chapter}?segments=true`)
  if (!response.ok) throw new Error(`Quran chapter audio API ${response.status}`)
  const { audio_file: audio } = await response.json()
  const target = path.join(rootDir, `work/ilyas-quran-${chapter}-recitation.mp3`)
  try { await fs.access(target) } catch {
    const download = await fetch(audio.audio_url)
    if (!download.ok) throw new Error(`Quran audio download ${download.status}`)
    await fs.writeFile(target, Buffer.from(await download.arrayBuffer()))
  }
  const data = { audio, target, timestamps: new Map(audio.timestamps.map((item) => [item.verse_key, item])) }
  chapters.set(chapter, data)
  return data
}

const output = []
for (let index = 0; index < plan.length; index += 1) {
  const item = plan[index]
  const chapter = Number(item.verses[0].split(':')[0])
  const chapterInfo = await chapterData(chapter)
  const verses = []
  for (const key of item.verses) verses.push(await verseData(key))
  const ranges = item.verses.map((key) => chapterInfo.timestamps.get(key))
  if (ranges.some((range) => !range)) throw new Error(`Missing timing for ${item.verses.join(', ')}`)
  const from = ranges[0].timestamp_from
  const to = ranges.at(-1).timestamp_to
  const target = path.join(workDir, `quran-${String(index + 1).padStart(2, '0')}.mp3`)
  execFileSync(ffmpeg, ['-y', '-ss', String(from / 1000), '-to', String(to / 1000), '-i', chapterInfo.target, '-ar', '24000', '-ac', '1', '-c:a', 'libmp3lame', '-q:a', '2', target], { stdio: 'ignore' })
  const timings = []
  let globalWord = 0
  for (let verseIndex = 0; verseIndex < verses.length; verseIndex += 1) {
    const byWord = new Map()
    for (const [wordIndex, start, end] of ranges[verseIndex].segments ?? []) {
      if (!byWord.has(wordIndex)) byWord.set(wordIndex, { start, end })
      else byWord.get(wordIndex).end = end
    }
    for (let wordIndex = 1; wordIndex <= verses[verseIndex].words.length; wordIndex += 1) {
      const segment = byWord.get(wordIndex)
      if (!segment) continue
      timings.push({ word: verses[verseIndex].words[wordIndex - 1], index: globalWord++, startMs: segment.start - from, endMs: segment.end - from })
    }
  }
  output.push({ ...item, chapter, verses, arabic: verses.map((v) => v.arabic).join(' '), audio: target, timings, reciter: 'Mishari Rashid al-`Afasy', recitationId, audioSource: chapterInfo.audio.audio_url })
  process.stdout.write(`Ilyâs, passage ${index + 1}/${plan.length}: ${item.verses.join(', ')}\n`)
}
await fs.writeFile(path.join(workDir, 'quran-inserts.json'), JSON.stringify(output, null, 2))
