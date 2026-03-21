import fs from 'fs'
import path from 'path'

export interface BlogPost {
  slug: string
  title: string
  date: string
  author: string
  tags: string[]
}

export interface ShowcaseProject {
  slug: string
  name: string
  description: string
  tags: string[]
  status: 'live' | 'wip' | 'oss'
  url?: string
  author?: string
}

function parseFrontmatter(content: string): Record<string, unknown> {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const result: Record<string, unknown> = {}
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const raw = line.slice(idx + 1).trim()
    if (raw.startsWith('[')) {
      result[key] = raw
        .slice(1, -1)
        .split(',')
        .map(s => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    } else {
      result[key] = raw.replace(/^["']|["']$/g, '')
    }
  }
  return result
}

export function getBlogPosts(): BlogPost[] {
  const dir = path.join(process.cwd(), 'content/blogg')
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.mdx'))
    .map(filename => {
      const slug = filename.replace('.mdx', '')
      const content = fs.readFileSync(path.join(dir, filename), 'utf-8')
      const fm = parseFrontmatter(content)
      return {
        slug,
        title: (fm.title as string) || slug,
        date: (fm.date as string) || '',
        author: (fm.author as string) || 'anonym',
        tags: (fm.tags as string[]) || [],
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function getShowcaseProjects(): ShowcaseProject[] {
  const dir = path.join(process.cwd(), 'content/showcase')
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.mdx'))
    .map(filename => {
      const slug = filename.replace('.mdx', '')
      const content = fs.readFileSync(path.join(dir, filename), 'utf-8')
      const fm = parseFrontmatter(content)
      const status = fm.status as string
      return {
        slug,
        name: (fm.name as string) || slug,
        description: (fm.description as string) || '',
        tags: (fm.tags as string[]) || [],
        status: (status === 'live' || status === 'wip' || status === 'oss' ? status : 'wip') as 'live' | 'wip' | 'oss',
        url: fm.url as string | undefined,
        author: fm.author as string | undefined,
      }
    })
    .sort((a, b) => a.slug.localeCompare(b.slug, 'sv'))
}
