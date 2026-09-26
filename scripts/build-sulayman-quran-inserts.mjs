import fs from 'node:fs/promises'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
const rootDir = path.resolve(process.cwd(), '../..')
const ffmpeg = path.join(rootDir, 'work/video-venv/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1')
const recitationId = 7
const plans = {
  1: [{after:0,verses:['27:15','27:16']},{after:1,verses:['21:78','21:79']},{after:2,verses:['27:16','27:17']},{after:3,verses:['27:18','27:19']},{after:4,verses:['27:19']},{after:5,verses:['34:12']},{after:6,verses:['34:13']},{after:7,verses:['21:81','21:82']}],
  2: [{after:0,verses:['27:20','27:21','27:22']},{after:1,verses:['27:23','27:24','27:25','27:26']},{after:2,verses:['27:27','27:28']},{after:3,verses:['27:29','27:30','27:31']},{after:4,verses:['27:32','27:33','27:34','27:35']},{after:5,verses:['27:36','27:37']},{after:6,verses:['27:38','27:39','27:40']},{after:7,verses:['27:40','27:41','27:42']},{after:8,verses:['27:43','27:44']}],
  3: [{after:0,verses:['38:30','38:31','38:32','38:33']},{after:1,verses:['38:34']},{after:2,verses:['38:35','38:36','38:37','38:38']},{after:3,verses:['38:39','38:40']},{after:6,verses:['34:14']}],
}
const chapters = new Map()
async function chapterData(chapter) {
  if (chapters.has(chapter)) return chapters.get(chapter)
  const response = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${recitationId}/${chapter}?segments=true`)
  if (!response.ok) throw new Error(`Quran chapter API ${response.status}`)
  const { audio_file: audio } = await response.json()
    const target = path.join(rootDir, `work/sulayman-quran-${chapter}-recitation.mp3`)
  try { await fs.access(target) } catch { const d=await fetch(audio.audio_url); await fs.writeFile(target, Buffer.from(await d.arrayBuffer())) }
  const data={audio,target,timestamps:new Map(audio.timestamps.map(i=>[i.verse_key,i]))}; chapters.set(chapter,data); return data
}
async function verseData(key) {
  const url=`https://api.quran.com/api/v4/verses/by_key/${key}?language=fr&words=true&word_fields=text_uthmani&translations=31&fields=text_uthmani`
  const response=await fetch(url); if(!response.ok) throw new Error(`Quran API ${response.status} for ${key}`)
  const {verse}=await response.json(); return {key,arabic:verse.text_uthmani,translation:(verse.translations?.[0]?.text??'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim(),words:verse.words.filter(w=>w.char_type_name==='word').map(w=>w.text_uthmani),source:url}
}
for (let episode=1; episode<=3; episode+=1) {
  const workDir=path.join(rootDir,`work/sulayman-production-${episode}`), output=[]
  for (let index=0; index<plans[episode].length; index+=1) {
    const item=plans[episode][index], chapter=Number(item.verses[0].split(':')[0]), info=await chapterData(chapter)
    const verses=await Promise.all(item.verses.map(verseData)), ranges=item.verses.map(k=>info.timestamps.get(k))
    if(ranges.some(r=>!r)) throw new Error(`Missing timing ${item.verses}`)
    const from=Math.min(...ranges.map(r=>r.timestamp_from)), to=Math.max(...ranges.map(r=>r.timestamp_to))
    const target=path.join(workDir,`quran-${String(index+1).padStart(2,'0')}.mp3`)
    execFileSync(ffmpeg,['-y','-ss',String(from/1000),'-to',String(to/1000),'-i',info.target,'-ar','24000','-ac','1','-c:a','libmp3lame','-q:a','2',target],{stdio:'ignore'})
    const timings=[]; let globalWord=0
    for(let vi=0;vi<verses.length;vi++){const byWord=new Map();for(const [wi,start,end] of ranges[vi].segments??[])byWord.set(wi,{start,end});for(let wi=1;wi<=verses[vi].words.length;wi++){const s=byWord.get(wi);if(s)timings.push({word:verses[vi].words[wi-1],index:globalWord++,startMs:s.start-from,endMs:s.end-from})}}
    output.push({...item,chapter,verses,arabic:verses.map(v=>v.arabic).join(' '),audio:target,timings,reciter:'Mishari Rashid al-`Afasy',recitationId,audioSource:info.audio.audio_url})
    process.stdout.write(`Sulaymân ${episode}/3, Coran ${index+1}/${plans[episode].length}\n`)
  }
  await fs.writeFile(path.join(workDir,'quran-inserts.json'),JSON.stringify(output,null,2))
}
