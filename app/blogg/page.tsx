import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { CardBlog } from '@/components/card-blog'
import { getBlogPosts } from '@/lib/mdx'

export const metadata = {
  title: 'Blogg | opensverige',
  description:
    'Guider och tankar om AI-agenter, MCP och vibecoding från opensverige-communityn.',
}

export default function BlogPage() {
  const posts = getBlogPosts()

  return (
    <>
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
