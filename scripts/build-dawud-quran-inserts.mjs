import fs from 'node:fs/promises'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
const rootDir = path.resolve(process.cwd(), '../..')
const ffmpeg = path.join(rootDir, 'work/video-venv/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1')
const recitationId = 7
const plans = {
  1: [{after:1,verses:['2:246','2:247']},{after:2,verses:['2:249','2:250']},{after:3,verses:['2:251']},{after:4,verses:['38:17','38:18','38:19','38:20']},{after:5,verses:['4:163']},{after:6,verses:['38:17','38:18','38:19']},{after:7,verses:['34:10','34:11']}],
  2: [{after:0,verses:['38:21','38:22']},{after:1,verses:['38:23','38:24']},{after:2,verses:['38:24','38:25']},{after:3,verses:['38:26']},{after:4,verses:['21:78','21:79']},{after:5,verses:['21:79','21:80']},{after:6,verses:['27:15','27:16']}],
}
const chapters = new Map()
async function chapterData(chapter) {
  if (chapters.has(chapter)) return chapters.get(chapter)
  const response = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${recitationId}/${chapter}?segments=true`)
  if (!response.ok) throw new Error(`Quran chapter API ${response.status}`)
  const { audio_file: audio } = await response.json()
  const target = path.join(rootDir, `work/dawud-quran-${chapter}-recitation.mp3`)
  try { await fs.access(target) } catch { const d=await fetch(audio.audio_url); await fs.writeFile(target, Buffer.from(await d.arrayBuffer())) }
  const data={audio,target,timestamps:new Map(audio.timestamps.map(i=>[i.verse_key,i]))}; chapters.set(chapter,data); return data
}
async function verseData(key) {
  const url=`https://api.quran.com/api/v4/verses/by_key/${key}?words=true&word_fields=text_uthmani&fields=text_uthmani`
  const response=await fetch(url); if(!response.ok) throw new Error(`Quran API ${response.status} for ${key}`)
  const {verse}=await response.json(); return {key,arabic:verse.text_uthmani,words:verse.words.filter(w=>w.char_type_name==='word').map(w=>w.text_uthmani),source:url}
}
for (let episode=1; episode<=2; episode+=1) {
  const workDir=path.join(rootDir,`work/dawud-production-${episode}`), output=[]
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
    process.stdout.write(`Dâwûd ${episode}/2, Coran ${index+1}/${plans[episode].length}\n`)
  }
  await fs.writeFile(path.join(workDir,'quran-inserts.json'),JSON.stringify(output,null,2))
}
