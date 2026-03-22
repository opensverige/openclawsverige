import type { Metadata } from 'next'
import { GollumQuiz } from './_components/GollumQuiz'

interface Props {
  searchParams: Promise<{ r?: string }>
}

const RESULT_META: Record<string, { title: string; description: string }> = {
  gollum:       { title: 'Du är Gollum — Gollum-testet',       description: 'Du sitter på din precious och din AI klappar dig på huvudet varje dag.' },
  dreambuilder: { title: 'Du är Drömbyggaren — Gollum-testet', description: 'Du har idéer. Bra idéer, faktiskt. Men du väntar på rätt tillfälle.' },
  speedrunner:  { title: 'Du är Speedrunnern — Gollum-testet', description: 'Du shippar. Men du shippar det din AI sa att du skulle shippa.' },
  shipper:      { title: 'Du är Shipparen — Gollum-testet',    description: 'Du bygger, du visar, du testar med riktiga människor.' },
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { r } = await searchParams
  const meta = (r ? RESULT_META[r] : undefined) ?? {
    title: 'Gollum-testet — Är du Gollum?',
    description: 'Fem frågor. Brutalt ärliga svar. Ta reda på om du bygger — eller bara hoardar.',
  }

  const ogUrl = r ? `/gollum/og?r=${r}` : '/gollum/og?r=gollum'

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: r ? `https://opensverige.se/gollum?r=${r}` : 'https://opensverige.se/gollum',
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [ogUrl],
    },
  }
}

export default function GollumPage() {
  return <GollumQuiz />
}
