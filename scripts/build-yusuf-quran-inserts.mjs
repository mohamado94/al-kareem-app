import fs from 'node:fs/promises'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const appDir = process.cwd()
const rootDir = path.resolve(appDir, '../..')
const ffmpeg = path.join(rootDir, 'work/video-venv/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1')
// Mishari Rashid al-`Afasy, murattal. A genuine human recitation is used here;
// the general-purpose Edge voices remain limited to ordinary Arabic speech.
const recitationId = 7
const plan = {
  1: [
    { after: 2, verses: ['12:4', '12:5'] },
    { after: 5, verses: ['12:15'] },
    { after: 6, verses: ['12:18'] },
    { after: 9, verses: ['12:23'] },
    { after: 12, verses: ['12:33'] },
  ],
  2: [
    { after: 2, verses: ['12:40'] },
    { after: 5, verses: ['12:43'] },
    { after: 7, verses: ['12:47', '12:48', '12:49'] },
    { after: 10, verses: ['12:51'] },
    { after: 12, verses: ['12:55', '12:56'] },
  ],
  3: [
    { after: 4, verses: ['12:83'] },
    { after: 5, verses: ['12:86', '12:87'] },
    { after: 7, verses: ['12:90'] },
    { after: 8, verses: ['12:92'] },
    { after: 10, verses: ['12:96'] },
    { after: 12, verses: ['12:100'] },
    { after: 13, verses: ['12:101'] },
  ],
}

async function verseData(key) {
  const url = `https://api.quran.com/api/v4/verses/by_key/${key}?language=fr&words=true&word_fields=text_uthmani&translations=31&fields=text_uthmani`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Quran API ${response.status} for ${key}`)
  const { verse } = await response.json()
  return {
    key,
    arabic: verse.text_uthmani,
    words: verse.words.filter((word) => word.char_type_name === 'word').map((word) => word.text_uthmani),
    translation: verse.translations?.[0]?.text?.replace(/<[^>]+>/g, '') ?? '',
    source: url,
  }
}

const chapterResponse = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${recitationId}/12?segments=true`)
if (!chapterResponse.ok) throw new Error(`Quran chapter audio API ${chapterResponse.status}`)
const { audio_file: chapterAudio } = await chapterResponse.json()
const chapterTarget = path.join(rootDir, 'work/yusuf-quran-12-recitation.mp3')
try {
  await fs.access(chapterTarget)
} catch {
  const response = await fetch(chapterAudio.audio_url)
  if (!response.ok) throw new Error(`Quran audio download ${response.status}`)
  await fs.writeFile(chapterTarget, Buffer.from(await response.arrayBuffer()))
}
const timestamps = new Map(chapterAudio.timestamps.map((item) => [item.verse_key, item]))

for (const [episodeText, inserts] of Object.entries(plan)) {
  const episode = Number(episodeText)
  const workDir = path.join(rootDir, `work/yusuf-production-${episode}`)
  const output = []
  for (let index = 0; index < inserts.length; index += 1) {
    const item = inserts[index]
    const verses = []
    for (const key of item.verses) verses.push(await verseData(key))
    const arabic = verses.map((verse) => verse.arabic).join(' ')
    const target = path.join(workDir, `quran-${String(index + 1).padStart(2, '0')}.mp3`)
    const ranges = item.verses.map((key) => timestamps.get(key))
    if (ranges.some((range) => !range)) throw new Error(`Missing recitation timing for ${item.verses.join(', ')}`)
    const from = ranges[0].timestamp_from
    const to = ranges.at(-1).timestamp_to
    execFileSync(ffmpeg, ['-y', '-ss', String(from / 1000), '-to', String(to / 1000), '-i', chapterTarget, '-c:a', 'libmp3lame', '-q:a', '2', target], { stdio: 'ignore' })
    const timings = []
    let globalWord = 0
    for (let verseIndex = 0; verseIndex < verses.length; verseIndex += 1) {
      const verse = verses[verseIndex]
      const range = ranges[verseIndex]
      const byWord = new Map()
      for (const [wordIndex, start, end] of range.segments ?? []) {
        if (!byWord.has(wordIndex)) byWord.set(wordIndex, { start, end })
        else byWord.get(wordIndex).end = end
      }
      for (let wordIndex = 1; wordIndex <= verse.words.length; wordIndex += 1) {
        const segment = byWord.get(wordIndex)
        if (!segment) continue
        timings.push({
          word: verse.words[wordIndex - 1],
          index: globalWord,
          startMs: segment.start - from,
          endMs: segment.end - from,
        })
        globalWord += 1
      }
    }
    output.push({ ...item, verses, arabic, audio: target, timings, reciter: 'Mishari Rashid al-`Afasy', recitationId, audioSource: chapterAudio.audio_url })
    process.stdout.write(`episode ${episode}, Quran insert ${index + 1}/${inserts.length}: ${item.verses.join(', ')}\n`)
  }
  await fs.writeFile(path.join(workDir, 'quran-inserts.json'), JSON.stringify(output, null, 2))
}
