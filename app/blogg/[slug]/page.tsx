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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPosts().find((p) => p.slug === slug)
  if (!post) return {}
  return {
    title: `${post.title} | opensverige`,
    description: `${post.title} — av ${post.author}`,
  }
}

const CONTENT: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  'fortnox-agent-guide': () =>
    import('../../../content/blogg/fortnox-agent-guide.mdx'),
  'vad-ar-ai-agenter': () =>
    import('../../../content/blogg/vad-ar-ai-agenter.mdx'),
  'mcp-vs-rest': () => import('../../../content/blogg/mcp-vs-rest.mdx'),
  'gollum-testet': () => import('../../../content/blogg/gollum-testet.mdx'),
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params
  const post = getBlogPosts().find((p) => p.slug === slug)
  if (!post) notFound()

  const loader = CONTENT[slug]
  if (!loader) notFound()

  const { default: Content } = await loader()

  return (
    <>
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
