import fs from 'node:fs/promises'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const appDir = process.cwd()
const rootDir = path.resolve(appDir, '../..')
const ffmpeg = path.join(rootDir, 'work/video-venv/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1')
const recitationId = 7
const plans = {
  1: [{after:1, verses:['28:3','28:4','28:5','28:6']},{after:2,verses:['28:7']},{after:4,verses:['28:11','28:12','28:13']},{after:6,verses:['28:15','28:16','28:17']},{after:8,verses:['28:20','28:21','28:22']},{after:9,verses:['28:23','28:24']},{after:11,verses:['28:25','28:26','28:27','28:28']}],
  2: [{after:1,verses:['20:11','20:12','20:13','20:14']},{after:3,verses:['20:17','20:18','20:19','20:20','20:21','20:22','20:23','20:24']},{after:4,verses:['20:25','20:26','20:27','20:28','20:29','20:30','20:31','20:32','20:33','20:34','20:35','20:36']},{after:7,verses:Array.from({length:11},(_,i)=>`26:${18+i}`)}],
  3: [{after:2,verses:Array.from({length:6},(_,i)=>`20:${65+i}`)},{after:4,verses:['7:130','7:133']},{after:7,verses:['26:61','26:62']},{after:9,verses:['10:90','10:91','10:92']}],
  4: [{after:0,verses:['7:138','7:139','7:140','7:141']},{after:3,verses:Array.from({length:7},(_,i)=>`20:${85+i}`)},{after:5,verses:['20:95','20:96','20:97','20:98']},{after:8,verses:Array.from({length:7},(_,i)=>`5:${20+i}`)}],
  5: [{after:1,verses:Array.from({length:6},(_,i)=>`18:${60+i}`)},{after:4,verses:Array.from({length:5},(_,i)=>`18:${78+i}`)},{after:8,verses:Array.from({length:7},(_,i)=>`28:${76+i}`)}],
}

const chapters = new Map()
async function chapterData(chapter) {
  if (chapters.has(chapter)) return chapters.get(chapter)
  const response = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${recitationId}/${chapter}?segments=true`)
  if (!response.ok) throw new Error(`Quran chapter audio API ${response.status}`)
  const { audio_file: audio } = await response.json()
  const target = path.join(rootDir, `work/musa-quran-${chapter}-recitation.mp3`)
  try { await fs.access(target) } catch {
    const download = await fetch(audio.audio_url)
    if (!download.ok) throw new Error(`Quran audio download ${download.status}`)
    await fs.writeFile(target, Buffer.from(await download.arrayBuffer()))
  }
  const data = { audio, target, timestamps: new Map(audio.timestamps.map((item) => [item.verse_key, item])) }
  chapters.set(chapter, data)
  return data
}

async function verseData(key) {
  const url = `https://api.quran.com/api/v4/verses/by_key/${key}?words=true&word_fields=text_uthmani&fields=text_uthmani`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Quran API ${response.status} for ${key}`)
  const { verse } = await response.json()
  return { key, arabic: verse.text_uthmani, words: verse.words.filter((word) => word.char_type_name === 'word').map((word) => word.text_uthmani), source: url }
}

for (let episode = 1; episode <= 5; episode += 1) {
  const workDir = path.join(rootDir, `work/musa-production-${episode}`)
  const output = []
  for (let index = 0; index < plans[episode].length; index += 1) {
    const item = plans[episode][index]
    const chapter = Number(item.verses[0].split(':')[0])
    const chapterInfo = await chapterData(chapter)
    const verses = await Promise.all(item.verses.map(verseData))
    const ranges = item.verses.map((key) => chapterInfo.timestamps.get(key))
    if (ranges.some((range) => !range)) throw new Error(`Missing timing for ${item.verses.join(', ')}`)
    const from = Math.min(...ranges.map((r) => r.timestamp_from))
    const to = Math.max(...ranges.map((r) => r.timestamp_to))
    const target = path.join(workDir, `quran-${String(index + 1).padStart(2, '0')}.mp3`)
    execFileSync(ffmpeg, ['-y','-ss',String(from/1000),'-to',String(to/1000),'-i',chapterInfo.target,'-c:a','libmp3lame','-q:a','2',target], {stdio:'ignore'})
    const timings=[]; let globalWord=0
    for (let vi=0; vi<verses.length; vi+=1) {
      const byWord=new Map()
      for (const [wi,start,end] of ranges[vi].segments ?? []) byWord.set(wi,{start,end})
      for (let wi=1; wi<=verses[vi].words.length; wi+=1) {
        const segment=byWord.get(wi); if (!segment) continue
        timings.push({word:verses[vi].words[wi-1],index:globalWord++,startMs:segment.start-from,endMs:segment.end-from})
      }
    }
    output.push({...item,chapter,verses,arabic:verses.map(v=>v.arabic).join(' '),audio:target,timings,reciter:'Mishari Rashid al-`Afasy',recitationId,audioSource:chapterInfo.audio.audio_url})
    process.stdout.write(`Mûsâ ${episode}/5, Coran ${index+1}/${plans[episode].length}\n`)
  }
  await fs.writeFile(path.join(workDir,'quran-inserts.json'),JSON.stringify(output,null,2))
}
