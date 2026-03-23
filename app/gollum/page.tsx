import type { Metadata } from 'next'
import { Suspense } from 'react'
import { GollumQuiz } from './_components/GollumQuiz'
import { RESULTS } from './_lib/quiz-data'

interface Props {
  searchParams: Promise<{ r?: string }>
}

const RESULT_META: Record<string, { title: string; description: string }> = {
  gollum:       { title: 'Du är Gollum — Gollum-testet',       description: 'Du hoardar koden, låter AI:n validera varje beslut och vägrar exponera det du bygger. Din precious håller dig fast i dopaminloopen. Gollum-testet avslöjade dig.' },
  dreambuilder: { title: 'Du är Drömbyggaren — Gollum-testet', description: 'Episka roadmaps, briljanta idéer — men ingenting shippat. Gollum-testet avslöjade att du planerar som en gud och levererar som ett spöke. Dags att deploya.' },
  speedrunner:  { title: 'Du är Speedrunnern — Gollum-testet', description: 'Du shippar snabbt men har outsourcat tänkandet till din AI. Velocity utan förståelse. Gollum-testet: kan du förklara rad 47 utan att fråga din copilot?' },
  shipper:      { title: 'Du är Shipparen — Gollum-testet',    description: 'Du söker friktion, inte bekräftelse. Bygger, exponerar och validerar med riktiga människor. Gollum-testet bekräftade: du är den personen andra behöver lära av.' },
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { r } = await searchParams
  const safeSlug = (r && r in RESULTS) ? r : null
  const meta = (safeSlug ? RESULT_META[safeSlug] : undefined) ?? {
    title: 'Gollum-testet — Är du Gollum?',
    description: 'Är du Gollum? Nio brutalt ärliga frågor avslöjar om du faktiskt bygger eller är fast i AI-dopaminloopen. Ta testet och se din builder-profil. 90 sekunder, inga email.',
  }

  const ogImage = '/gollum/og-image-gollum.jpg'

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: safeSlug ? `https://opensverige.se/gollum?r=${safeSlug}` : 'https://opensverige.se/gollum',
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [ogImage],
    },
  }
}

export default function GollumPage() {
  return (
    <Suspense>
      <GollumQuiz />
    </Suspense>
  )
}
