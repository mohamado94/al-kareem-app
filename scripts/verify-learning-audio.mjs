import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

const audioRoot = join(process.cwd(), 'public', 'audio')

// Every collection used by a clickable learning card must be complete before
// a build can be published.
const numberedCollections = {
  'short-fatha': 28,
  'short-kasra': 28,
  'short-damma': 28,
  'long-fatha': 28,
  'long-kasra': 28,
  'long-damma-recorded': 28,
  'tanwin-fatha-recorded': 28,
  'tanwin-kasra-recorded': 28,
  'tanwin-damma-recorded': 28,
  'short-fatha-words': 15,
  'short-kasra-words': 15,
  'short-damma-words': 15,
}

const namedCollections = {
  'alphabet-elevenlabs': [
    'alif', 'ba', 'ta', 'tha', 'jim', 'ha', 'kha', 'dal', 'dhal', 'ra',
    'zay', 'sin', 'shin', 'sad', 'dad', 'taa', 'zaa', 'ayn', 'ghayn',
    'fa', 'qaf', 'kaf', 'lam', 'mim', 'nun', 'ha2', 'waw', 'ya',
  ],
}

const failures = []
let verified = 0

async function verifyMp3(relativePath) {
  const absolutePath = join(audioRoot, relativePath)
  try {
    const metadata = await stat(absolutePath)
    if (!metadata.isFile()) throw new Error('not a file')
    if (metadata.size < 1024) throw new Error(`too small (${metadata.size} bytes)`)

    const header = await readFile(absolutePath, { encoding: null, flag: 'r' })
    const isId3 = header.subarray(0, 3).toString('ascii') === 'ID3'
    const isMpegFrame = header[0] === 0xff && (header[1] & 0xe0) === 0xe0
    if (!isId3 && !isMpegFrame) throw new Error('invalid MP3 header')
    verified += 1
  } catch (error) {
    failures.push(`${relativePath}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

for (const [directory, count] of Object.entries(numberedCollections)) {
  for (let index = 1; index <= count; index += 1) {
    await verifyMp3(`${directory}/${index}.mp3`)
  }
}

for (const [directory, names] of Object.entries(namedCollections)) {
  for (const name of names) await verifyMp3(`${directory}/${name}.mp3`)
}

// Noun Tanwin Damma intentionally uses the separately reviewed replacement.
await verifyMp3('tanwin-damma-recorded/25-nun-replacement.mp3')

if (failures.length > 0) {
  console.error('Learning audio verification failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Learning audio verification passed: ${verified} MP3 files are bundled and valid.`)
