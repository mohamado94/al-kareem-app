import type { Letter } from '@/lib/data'

const KASHIDA = '\u0640' // ـ tatweel — makes connected forms visible

/** Letters that do not connect to the following letter in Arabic script. */
const NON_CONNECTING = new Set(['alif', 'dal', 'dhal', 'ra', 'zay', 'waw'])

/**
 * Pedagogical display glyph for a positional form.
 * Connected letters use kashida so initial/medial/final shapes are clearly visible
 * (e.g. حـ ـحـ ـح instead of faint presentation-form glyphs).
 */
export function pedagogicalPositionGlyph(
  letter: Letter,
  position: 'isolated' | 'initial' | 'medial' | 'final',
): string {
  const g = letter.glyph
  // ا د ذ ر ز و never connect to the letter that follows them. They therefore
  // have only two visual shapes: isolated/initial, and connected-to-previous
  // for medial/final. Keeping the incoming kashida visible makes that real
  // distinction understandable instead of showing four identical cards.
  if (NON_CONNECTING.has(letter.id)) {
    return position === 'medial' || position === 'final' ? KASHIDA + g : g
  }
  switch (position) {
    case 'isolated':
      return g
    case 'initial':
      return g + KASHIDA
    case 'medial':
      return KASHIDA + g + KASHIDA
    case 'final':
      return KASHIDA + g
    default:
      return g
  }
}
