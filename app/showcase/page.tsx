import type { Metadata } from 'next'
import Link from 'next/link'
import { Footer } from '@/components/footer'
import { Nav } from '@/components/nav'
import { SwedenMap } from '@/components/sweden-map'
import { RegionChips } from '@/components/sweden-map/region-chips'
import { getShowcaseProjects } from '@/lib/mdx'
import { ShowcaseClient } from './showcase-client'

const SHOWCASE_URL = 'https://opensverige.se/showcase'
const SHOWCASE_DESC =
  'AI-agenter, MCP-servrar och verktyg byggt av opensverige-communityn. Open source projekt från svenska builders i Stockholm, Göteborg och Malmö.'

export const metadata: Metadata = {
  title: 'Showcase',
  description: SHOWCASE_DESC,
  alternates: { canonical: SHOWCASE_URL },
  openGraph: {
    type: 'website',
    url: SHOWCASE_URL,
    title: 'opensverige showcase — projekt byggda av communityn',
    description: SHOWCASE_DESC,
    siteName: 'opensverige',
    locale: 'sv_SE',
    images: [
      {
        url: '/og-image-opsv.jpg',
        width: 1200,
        height: 630,
        alt: 'opensverige showcase — AI-projekt byggda av svenska builders',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'opensverige showcase',
    description: SHOWCASE_DESC,
    images: ['/og-image-opsv.jpg'],
    site: '@opensverige',
  },
}

interface PageProps {
  searchParams: Promise<{ region?: string }>
}

export default async function ShowcasePage({ searchParams }: PageProps) {
  const projects = getShowcaseProjects()
  const allTags = Array.from(new Set(projects.flatMap((p) => p.tags))).sort(
    (a, b) => a.localeCompare(b, 'sv'),
  )

  const regionCounts = projects.reduce<Record<string, number>>((acc, p) => {
    const key = p.region ?? 'Övrigt'
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  const params = await searchParams
  const activeRegion = params.region ?? null

  const filteredByRegion = activeRegion
    ? projects.filter((p) => (p.region ?? 'Övrigt') === activeRegion)
    : projects

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SHOWCASE_URL}#collection`,
    name: 'opensverige showcase',
    description: SHOWCASE_DESC,
    url: SHOWCASE_URL,
    inLanguage: 'sv-SE',
    isPartOf: { '@id': 'https://opensverige.se/#website' },
    about: { '@id': 'https://opensverige.se/#organization' },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: projects.length,
      itemListElement: projects.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'SoftwareApplication',
          name: p.name,
          description: p.description,
          url: p.url ?? `${SHOWCASE_URL}#${p.slug}`,
          applicationCategory: 'AI agent',
          operatingSystem: 'Web',
          keywords: p.tags.join(', '),
        },
      })),
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Start',
        item: 'https://opensverige.se',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Showcase',
        item: SHOWCASE_URL,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Nav />
      <main>
        <div className="showcase-header">
          <Link href="/" className="showcase-back">
            <span className="showcase-back-aw" aria-hidden="true">
              ←
            </span>
            Startsida
          </Link>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 400,
              letterSpacing: '-0.5px',
              color: 'var(--text-primary)',
              marginBottom: 'var(--sp-3)',
            }}
          >
            Showcase
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 15,
              marginBottom: 'var(--sp-6)',
            }}
          >
            Projekt byggt av communityn.
          </p>
          <div className="showcase-map-wrap">
            <SwedenMap
              projects={filteredByRegion}
              interactive
              totalCount={projects.length}
              activeRegion={activeRegion}
            />
          </div>
          <div className="showcase-region-chips">
            <RegionChips counts={regionCounts} totalCount={projects.length} />
          </div>
        </div>
        <ShowcaseClient projects={filteredByRegion} allTags={allTags} />
      </main>
      <Footer />
    </>
  )
}
