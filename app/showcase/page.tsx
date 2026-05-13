import type { Metadata } from 'next'
import { Footer } from '@/components/footer'
import { Nav } from '@/components/nav'
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

export default function ShowcasePage() {
  const projects = getShowcaseProjects()
  const allTags = Array.from(new Set(projects.flatMap((p) => p.tags))).sort(
    (a, b) => a.localeCompare(b, 'sv'),
  )

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
      <ShowcaseClient projects={projects} allTags={allTags} />
      <Footer />
    </>
  )
}
