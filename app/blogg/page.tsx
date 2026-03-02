import { BlogCard } from "@/components/blog/blog-card";
import { BlogEmptyState } from "@/components/blog/blog-empty-state";
import { getPosts } from "@/lib/blog";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Blogg",
  description:
    "Artiklar och tankar om AI-agenter, multi-agent-system och det svenska AI-agent-communityt.",
  path: "/blogg",
});

export default function BloggPage() {
  const posts = getPosts();

  return (
    <main className="min-h-screen">
          <section
            className="site-sections"
            aria-labelledby="blogg-heading"
          >
            <h1
              id="blogg-heading"
              style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--sp-4)" }}
            >
              Blogg
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", marginBottom: "var(--sp-8)" }}>
              Tankar och guider om AI-agenter och communityt.
            </p>
            {posts.length === 0 ? (
              <BlogEmptyState />
            ) : (
              <ul
                className="grid-2"
                style={{ marginTop: 0, listStyle: "none", padding: 0 }}
                aria-label="Blogginlägg"
              >
                {posts.map((post) => (
                  <li key={post.slug}>
                    <BlogCard post={post} />
                  </li>
                ))}
              </ul>
            )}
          </section>
    </main>
  );
}
