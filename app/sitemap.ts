import type { MetadataRoute } from 'next'
import { getBlogPosts, getShowcaseProjects } from '@/lib/mdx'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getBlogPosts()
  const projects = getShowcaseProjects()

  return [
    {
      url: 'https://opensverige.se',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://opensverige.se/blogg',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://opensverige.se/showcase',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://opensverige.se/varfor',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://opensverige.se/integritet',
      lastModified: new Date('2026-03-25'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...posts.map((p) => ({
      url: `https://opensverige.se/blogg/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...projects.map((p) => ({
      url: `https://opensverige.se/showcase/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ]
}
