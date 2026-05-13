import type { Metadata, Viewport } from 'next'
import { dmSans, instrumentSerif, jetbrainsMono } from '@/lib/fonts'
import { Analytics } from '@vercel/analytics/next'
import '../styles/globals.css'

const SITE_URL = 'https://opensverige.se'
const SITE_NAME = 'opensverige'
const SITE_TITLE =
  'opensverige | Sveriges öppna community för AI-agenter, MCP och vibecoding'
const SITE_DESCRIPTION =
  'Sveriges öppna community för AI-agenter och vibecoding. Bygg med OpenClaw, NemoClaw, CrewAI och MCP. Vi delar kod på Discord och ses IRL i Stockholm, Göteborg och Malmö. Gratis, öppen källkod, ingen styrelse.'

export const viewport: Viewport = {
  themeColor: '#060606',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s | opensverige',
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: 'opensverige community', url: SITE_URL }],
  creator: 'opensverige',
  publisher: 'opensverige',
  generator: 'Next.js',
  category: 'technology',
  keywords: [
    'AI-agenter',
    'AI agents Sverige',
    'OpenClaw',
    'NemoClaw',
    'MCP',
    'Model Context Protocol',
    'vibecoding',
    'svenska AI-utvecklare',
    'AI community Sverige',
    'Cursor',
    'Claude Code',
    'Claude Agent SDK',
    'OpenAI Agents SDK',
    'CrewAI',
    'LangGraph',
    'AutoGen',
    'Google ADK',
    'Pydantic AI',
    'Fortnox AI',
    'Bankgirot',
    'SCB',
    'Skatteverket',
    'open source Sverige',
    'AI Stockholm',
    'AI Göteborg',
    'AI Malmö',
    'multi-agent system',
    'autonoma agenter',
    'svensk AI',
    'opensverige',
    'open sverige',
  ],
  alternates: {
    canonical: SITE_URL,
    languages: {
      'sv-SE': SITE_URL,
      'x-default': SITE_URL,
    },
    types: {
      'application/json': '/openapi.json',
      'text/plain': '/llms.txt',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'sv_SE',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'opensverige — Bygg AI-agenter i Sverige',
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og-image-opsv.jpg',
        width: 1200,
        height: 630,
        alt: 'opensverige — Sveriges öppna community för AI-agenter, MCP och vibecoding',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'opensverige — Bygg AI-agenter i Sverige',
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og-image-opsv.jpg',
        alt: 'opensverige — Sveriges öppna community för AI-agenter',
      },
    ],
    site: '@opensverige',
    creator: '@opensverige',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: {
      'msvalidate.01': '24F3DFDC3D5D58845C3671C62FDE0AD3',
    },
  },
  referrer: 'strict-origin-when-cross-origin',
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="sv-SE"
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
        <Analytics />
      </body>
    </html>
  )
}
