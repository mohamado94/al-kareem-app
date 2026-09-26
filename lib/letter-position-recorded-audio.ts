import type { LetterPosition } from '@/lib/letter-position-speech'
import type { RecordedAudioSegment } from '@/lib/speech'

const ISOLATED = '/audio/position-labels/isolated.mp3'
const CONNECTED = '/audio/position-labels/initial-medial-final.mp3'

export const POSITION_LABEL_AUDIO: Readonly<Record<LetterPosition, RecordedAudioSegment>> = {
  isolated: { src: ISOLATED, start: 0.02, end: 0.56 },
  initial: { src: CONNECTED, start: 0.02, end: 0.84 },
  medial: { src: CONNECTED, start: 1.04, end: 1.90 },
  final: { src: CONNECTED, start: 2.40, end: 3.08 },
}

export function letterPositionRecordedSequence(
  letterAudio: string,
  position: LetterPosition,
): RecordedAudioSegment[] {
  return [{ src: letterAudio }, POSITION_LABEL_AUDIO[position]]
}
