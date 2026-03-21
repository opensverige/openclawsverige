import { DM_Sans, JetBrains_Mono } from 'next/font/google'

export const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body-loaded',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-loaded',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})
