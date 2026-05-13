import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { CardBlog } from '@/components/card-blog'
import { getBlogPosts } from '@/lib/mdx'

const URL = 'https://opensverige.se/blogg'
const TITLE = 'Blogg'
const DESCRIPTION =
  'Guider och tankar om AI-agenter, MCP-servrar och vibecoding från opensverige-communityn. OpenClaw, NemoClaw, CrewAI, Fortnox och svenska AI-integrationer.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    type: 'website',
    url: URL,
    title: 'opensverige blogg',
    description: DESCRIPTION,
    siteName: 'opensverige',
    locale: 'sv_SE',
    images: [
      {
        url: '/og-image-opsv.jpg',
        width: 1200,
        height: 630,
        alt: 'opensverige blogg — guider om AI-agenter och MCP',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'opensverige blogg',
    description: DESCRIPTION,
    images: ['/og-image-opsv.jpg'],
    site: '@opensverige',
  },
}

export default function BlogPage() {
  const posts = getBlogPosts()

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${URL}#blog`,
    name: 'opensverige blogg',
    url: URL,
    inLanguage: 'sv-SE',
    description: DESCRIPTION,
    isPartOf: { '@id': 'https://opensverige.se/#website' },
    publisher: { '@id': 'https://opensverige.se/#organization' },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      datePublished: post.date,
      url: `https://opensverige.se/blogg/${post.slug}`,
      author: { '@type': 'Person', name: post.author },
      keywords: post.tags.join(', '),
    })),
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
      { '@type': 'ListItem', position: 2, name: 'Blogg', item: URL },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Nav />
      <main>
        <div className="blog-header">
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
            Blogg
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-dim)',
            }}
          >
            {posts.length} inlägg · senaste först
          </p>
        </div>
        <div className="blog-list">
          {posts.map((post) => (
            <CardBlog key={post.slug} post={post} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
