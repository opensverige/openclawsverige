import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { getBlogPosts } from '@/lib/mdx'

export async function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPosts().find((p) => p.slug === slug)
  if (!post) return {}

  const url = `https://opensverige.se/blogg/${post.slug}`
  const title = post.title
  const description = `${post.title} — guide från opensverige-communityn av ${post.author}. ${post.tags.join(', ')}.`

  return {
    title,
    description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      siteName: 'opensverige',
      locale: 'sv_SE',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: '/og-image-opsv.jpg',
          width: 1200,
          height: 630,
          alt: `${post.title} — opensverige`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image-opsv.jpg'],
      site: '@opensverige',
    },
  }
}

const CONTENT: Record<
  string,
  () => Promise<{ default: React.ComponentType }>
> = {
  'fortnox-agent-guide': () =>
    import('../../../content/blogg/fortnox-agent-guide.mdx'),
  'vad-ar-ai-agenter': () =>
    import('../../../content/blogg/vad-ar-ai-agenter.mdx'),
  'mcp-vs-rest': () => import('../../../content/blogg/mcp-vs-rest.mdx'),
  'gollum-testet': () => import('../../../content/blogg/gollum-testet.mdx'),
  'bygg-spel-med-ai': () =>
    import('../../../content/blogg/bygg-spel-med-ai.mdx'),
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params
  const post = getBlogPosts().find((p) => p.slug === slug)
  if (!post) notFound()

  const loader = CONTENT[slug]
  if (!loader) notFound()

  const { default: Content } = await loader()

  const url = `https://opensverige.se/blogg/${post.slug}`
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: post.title,
    name: post.title,
    description: `${post.title} — guide från opensverige-communityn.`,
    keywords: post.tags.join(', '),
    inLanguage: 'sv-SE',
    datePublished: post.date,
    dateModified: post.date,
    url,
    isPartOf: { '@id': 'https://opensverige.se/#website' },
    publisher: { '@id': 'https://opensverige.se/#organization' },
    author: {
      '@type': 'Person',
      name: post.author,
    },
    image: {
      '@type': 'ImageObject',
      url: 'https://opensverige.se/og-image-opsv.jpg',
      width: 1200,
      height: 630,
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
        name: 'Blogg',
        item: 'https://opensverige.se/blogg',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: url,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Nav />
      <main>
        <div className="blog-post">
          <Link href="/blogg" className="blog-back">
            ← blogg
          </Link>
          <header className="blog-post-header">
            <h1 className="blog-post-title">{post.title}</h1>
            <div className="blog-post-meta">
              <div className="blog-post-meta-line">
                <time dateTime={post.date}>{post.date}</time>
                <span className="blog-post-meta-dot" aria-hidden>
                  ·
                </span>
                <span>{post.author}</span>
              </div>
              {post.tags.length > 0 ? (
                <ul className="blog-post-tags" aria-label="Taggar">
                  {post.tags.map((tag) => (
                    <li key={tag}>
                      <span className="blog-post-tag">{tag}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </header>
          <article className="blog-body">
            <Content />
          </article>
        </div>
      </main>
      <Footer />
    </>
  )
}
