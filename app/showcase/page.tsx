import type { Metadata } from 'next'
import { Footer } from '@/components/footer'
import { Nav } from '@/components/nav'
import { getShowcaseProjects } from '@/lib/mdx'
import { ShowcaseClient } from './showcase-client'

export const metadata: Metadata = {
  title: 'Showcase | opensverige',
  description:
    'AI-agenter, MCP-servrar och verktyg byggt av opensverige-communityn.',
}

export default function ShowcasePage() {
  const projects = getShowcaseProjects()
  const allTags = Array.from(new Set(projects.flatMap((p) => p.tags))).sort(
    (a, b) => a.localeCompare(b, 'sv'),
  )

  return (
    <>
      <Nav />
      <ShowcaseClient projects={projects} allTags={allTags} />
      <Footer />
    </>
  )
}
