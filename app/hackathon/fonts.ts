import { Pixelify_Sans, JetBrains_Mono } from 'next/font/google'

// Pixel display-font — korta etiketter, accordion-rubriker, siffror.
export const pixelDisplay = Pixelify_Sans({
  subsets: ['latin'],
  variable: '--font-pixel',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

// Brödtext — JetBrains Mono. Tydligt läsbar monospace för all löpande text.
export const bodyMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-terminal',
  weight: ['400', '500', '600'],
  display: 'swap',
})
