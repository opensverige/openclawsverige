import type { Metadata } from 'next'
import { dmSans, jetbrainsMono } from '@/lib/fonts'
import '../styles/globals.css'

export const metadata: Metadata = {
  title:
    'opensverige | Sveriges öppna community för AI-agenter, MCP och vibecoding',
  description:
    'Sveriges öppna community för AI-agenter och vibecoding. Bygg med OpenClaw, NemoClaw och MCP. Vi delar kod på Discord och ses IRL i Stockholm, Göteborg och Malmö.',
  openGraph: {
    title: 'opensverige — Bygg AI-agenter i Sverige',
    description:
      'Sveriges öppna community för AI-agenter och vibecoding. Bygg med OpenClaw, NemoClaw och MCP. Vi delar kod på Discord och ses IRL i Stockholm, Göteborg och Malmö.',
    url: 'https://opensverige.se',
    siteName: 'opensverige',
    locale: 'sv_SE',
    type: 'website',
  },
  robots: { index: true, follow: true },
  metadataBase: new URL('https://opensverige.se'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="sv"
      className={`${dmSans.variable} ${jetbrainsMono.variable}`}
      style={{ backgroundColor: '#060606' }}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={dmSans.className}
        style={{
          backgroundColor: '#060606',
          color: '#e8e0d4',
          minHeight: '100vh',
        }}
      >
        {children}
      </body>
    </html>
  )
}
