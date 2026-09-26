import fs from 'node:fs/promises'; import path from 'node:path'
const root=path.resolve(process.cwd(),'../..'), names=['yusuf','ayyub','shuayb','musa','harun','dhulkifl','dawud','sulayman'], entries=await fs.readdir(path.join(root,'work'))
for(const name of names) for(const dir of entries.filter(v=>v.startsWith(`${name}-production-`))){
  const file=path.join(root,'work',dir,'quran-inserts.json')
  try{const inserts=JSON.parse(await fs.readFile(file,'utf8'));for(const insert of inserts)for(const verse of insert.verses){if(verse.translation)continue;const response=await fetch(`https://api.quran.com/api/v4/verses/by_key/${verse.key}?language=fr&translations=31`);if(!response.ok)throw new Error(`${response.status} ${verse.key}`);const data=await response.json();verse.translation=(data.verse.translations?.[0]?.text??'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim()}await fs.writeFile(file,JSON.stringify(inserts,null,2));process.stdout.write(`${dir}\n`)}catch(error){if(error.code!=='ENOENT')throw error}
}
