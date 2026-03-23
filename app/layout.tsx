import type { Metadata } from 'next'
import { dmSans, instrumentSerif, jetbrainsMono } from '@/lib/fonts'
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
    images: [{ url: '/og-image-opsv.jpg', width: 1200, height: 630 }],
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
      className={`${dmSans.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable}`}
      style={{ backgroundColor: '#060606' }}
    >
      <head>
        <link rel="preload" as="image" href="/crayfish.png" />
      </head>
      <body
        className={dmSans.className}
        style={{
          backgroundColor: '#060606',
          color: '#e8e0d4',
          minHeight: '100vh',
        }}
      >
        <a href="#main-content" className="skip-link">Hoppa till innehåll</a>
        {children}
      </body>
    </html>
  )
}
