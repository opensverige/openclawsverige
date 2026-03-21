import Link from 'next/link'
import type { BlogPost } from '@/lib/mdx'

interface CardBlogProps {
  post: BlogPost
}

export function CardBlog({ post }: CardBlogProps) {
  return (
    <div className="card-blog">
      <div className="card-blog-date">{post.date}</div>
      <div className="card-blog-content">
        <Link href={`/blogg/${post.slug}`} className="card-blog-title">
          {post.title}
        </Link>
        <div className="card-blog-meta">
          {post.author} · {post.date}
        </div>
        {post.tags.length > 0 && (
          <div className="card-blog-tags">
            {post.tags.map((tag) => (
              <span key={tag} className="tag" style={{ cursor: 'default' }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
