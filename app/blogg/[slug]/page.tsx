import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import Image from "next/image";
import {
  getPostBySlug,
  getAllSlugs,
  getPrevNext,
} from "@/lib/blog";
import { mdxRehypePlugins } from "@/lib/mdx-options";
import { getHeadingId, sanitizePathSegment, sanitizeForDisplay } from "@/lib/slugify";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  User,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Callout } from "@/components/mdx/callout";
import { Steps, Step } from "@/components/mdx/steps";
import { Tabs, Tab } from "@/components/mdx/tabs";
import { MdxImage } from "@/components/mdx/mdx-image";
import { PreWithCopyBar } from "@/components/blog/pre-with-copy";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { ArticleTocMobile } from "@/components/blog/article-toc-mobile";
import {
  buildPageMetadata,
  DEFAULT_OG_IMAGE_PATH,
  SITE_NAME,
  absoluteUrl,
} from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Inlagg hittades inte" };

  return buildPageMetadata({
    title: post.frontmatter.title,
    description: post.frontmatter.summary,
    path: `/blogg/${slug}`,
    type: "article",
    imagePath: post.frontmatter.image ?? DEFAULT_OG_IMAGE_PATH,
    imageAlt: post.frontmatter.title,
  });
}

function createMdxComponents() {
  return {
    Callout,
    Steps,
    Step,
    Tabs,
    Tab,
    MdxImage,
    a: ({
      href,
      children,
      ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a
        href={href}
        className="font-medium text-[var(--gold)] underline underline-offset-4 hover:text-[var(--gold-light)]"
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
        {...props}
      >
        {children}
      </a>
    ),
    h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
      const id = getHeadingId(children);
      return (
        <h2
          id={id}
          className="group relative mt-10 scroll-mt-24 text-xl font-semibold tracking-tight first:mt-0"
          {...props}
        >
          <a
            href={`#${id}`}
            className="absolute -left-6 top-0 opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          >
            <span className="text-muted-foreground hover:text-[var(--gold)]">#</span>
          </a>
          {children}
        </h2>
      );
    },
    h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
      const id = getHeadingId(children);
      return (
        <h3
          id={id}
          className="group relative mt-8 scroll-mt-24 text-lg font-semibold"
          {...props}
        >
          <a
            href={`#${id}`}
            className="absolute -left-6 top-0 opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          >
            <span className="text-muted-foreground hover:text-[var(--gold)]">#</span>
          </a>
          {children}
        </h3>
      );
    },
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className="mt-4 leading-relaxed text-foreground" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
      <ul className="mt-4 list-disc space-y-2 pl-6 text-foreground" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
      <ol className="mt-4 list-decimal space-y-2 pl-6 text-foreground" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
      <li className="leading-relaxed" {...props}>
        {children}
      </li>
    ),
    pre: PreWithCopyBar,
    table: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLTableElement>) => (
      <div className="my-6 overflow-x-auto">
        <table
          className="w-full border-collapse border border-border"
          {...props}
        >
          {children}
        </table>
      </div>
    ),
    th: ({
      children,
      ...props
    }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
      <th
        className="border border-border bg-muted/50 px-4 py-2 text-left text-sm font-semibold"
        {...props}
      >
        {children}
      </th>
    ),
    td: ({
      children,
      ...props
    }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
      <td className="border border-border px-4 py-2 text-sm" {...props}>
        {children}
      </td>
    ),
  };
}

export default async function BloggSlugPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { content } = await compileMDX({
    source: post.content,
    options: {
      mdxOptions: {
        // @ts-expect-error rehype plugin tuple type is readonly
rehypePlugins: mdxRehypePlugins,
      },
    },
    components: createMdxComponents(),
  });

  const { prev, next } = getPrevNext(slug);

  const pageUrl = absoluteUrl(`/blogg/${slug}`);
  const breadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: { "@id": absoluteUrl("/"), name: "Hem" },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: { "@id": absoluteUrl("/blogg"), name: "Blogg" },
      },
      {
        "@type": "ListItem",
        position: 3,
        item: { "@id": pageUrl, name: post.frontmatter.title },
      },
    ],
  };

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.frontmatter.title,
    description: post.frontmatter.summary,
    datePublished: post.frontmatter.date,
    dateModified: post.frontmatter.date,
    inLanguage: "sv",
    url: pageUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    author: {
      "@type": "Organization",
      name: post.frontmatter.author,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbsSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostingSchema),
        }}
      />
          <article
            className="site-sections"
            aria-labelledby="post-title"
          >
            <div>
          <Link
            href="/blogg"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-[var(--gold)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Tillbaka till bloggen
          </Link>

          <header className="mb-10">
            {post.frontmatter.image && (
              <div className="mb-8 overflow-hidden rounded-xl border border-border/60">
                <Image
                  src={post.frontmatter.image}
                  alt=""
                  width={1200}
                  height={630}
                  className="w-full object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 1200px"
                />
              </div>
            )}
            <h1
              id="post-title"
              className="text-3xl font-bold leading-tight tracking-tight md:text-4xl"
            >
              {post.frontmatter.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <time
                className="flex items-center gap-1.5"
                dateTime={post.frontmatter.date}
              >
                <Calendar className="h-4 w-4" aria-hidden />
                {formatDate(post.frontmatter.date)}
              </time>
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" aria-hidden />
                {post.frontmatter.author}
              </span>
            </div>
            {post.frontmatter.tags?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {post.frontmatter.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--gold)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_240px] lg:gap-12">
            <div className="min-w-0">
              <ArticleTocMobile />
              <div
                data-blog-article
                className="prose prose-lg prose-invert max-w-none dark:prose-invert [&_pre]:!my-0 [&_pre]:!rounded-none [&_pre]:!border-0 [&_pre]:!bg-transparent [&_.code-block-wrapper_pre]:!py-0"
              >
                {content}
              </div>

              {(prev || next) && (
                <nav
                  className="mt-12 flex flex-col gap-4 border-t border-border/60 pt-8 sm:flex-row sm:justify-between"
                  aria-label="Artikel-navigation"
                >
                  {prev ? (
                    <Link
                      href={`/blogg/${sanitizePathSegment(prev.slug)}`}
                      className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-[var(--gold)]"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                      <span className="truncate">{sanitizeForDisplay(prev.title)}</span>
                    </Link>
                  ) : (
                    <span />
                  )}
                  {next ? (
                    <Link
                      href={`/blogg/${sanitizePathSegment(next.slug)}`}
                      className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-[var(--gold)] sm:ml-auto"
                    >
                      <span className="truncate">{sanitizeForDisplay(next.title)}</span>
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </Link>
                  ) : null}
                </nav>
              )}
            </div>
            <aside className="hidden lg:block">
              <TableOfContents />
            </aside>
          </div>
        </div>
      </article>
    </main>
  );
}

