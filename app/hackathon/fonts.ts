import { Pixelify_Sans, VT323 } from 'next/font/google'

// Pixel display-font — rubriker, etiketter, knappar. Pixelify Sans är klart
// pixel/8-bit men byggd för läsbarhet (till skillnad från Press Start 2P).
export const pixelDisplay = Pixelify_Sans({
  subsets: ['latin'],
  variable: '--font-pixel',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

// Readable terminal/pixel-font — brödtext, tips, beskrivningar.
export const vt323 = VT323({
  subsets: ['latin'],
  variable: '--font-terminal',
  weight: '400',
  display: 'swap',
})
