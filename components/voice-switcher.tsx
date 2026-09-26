'use client'

import { AudioLines } from 'lucide-react'

/** Indicates that lesson audio comes from bundled, reviewed recordings. */
export function VoiceSwitcher() {
  return (
    <div
      className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card/60 px-3 backdrop-blur"
      aria-label="Audios ElevenLabs intégrés"
      title="Audios ElevenLabs intégrés"
    >
      <AudioLines className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">Audio</span>
    </div>
  )
}
