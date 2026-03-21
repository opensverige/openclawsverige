'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CardProject } from '@/components/card-project'
import { Tag } from '@/components/tag'
import type { ShowcaseProject } from '@/lib/mdx'

interface ShowcaseClientProps {
  projects: ShowcaseProject[]
  allTags: string[]
}

export function ShowcaseClient({ projects, allTags }: ShowcaseClientProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)

  const filtered = activeTag
    ? projects.filter((p) => p.tags.includes(activeTag))
    : projects

  return (
    <main>
        <div className="showcase-header">
          <Link href="/" className="showcase-back">
            <span className="showcase-back-aw" aria-hidden="true">
              ←
            </span>
            Startsida
          </Link>
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
            Showcase
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 15,
              marginBottom: 'var(--sp-4)',
            }}
          >
            Projekt byggt av communityn.
          </p>
          <div className="showcase-filter-bar">
            <button
              type="button"
              className="showcase-filter-toggle"
              onClick={() => setFilterOpen((o) => !o)}
              aria-expanded={filterOpen}
              aria-controls="showcase-tag-panel"
            >
              Filtrera taggar
              <span
                className={`showcase-filter-chevron${filterOpen ? ' is-open' : ''}`}
                aria-hidden="true"
              >
                →
              </span>
            </button>
            {activeTag !== null && (
              <span className="showcase-filter-active">
                {activeTag}
                <button
                  type="button"
                  className="showcase-filter-clear"
                  onClick={() => setActiveTag(null)}
                  aria-label={`Ta bort filter ${activeTag}`}
                >
                  ×
                </button>
              </span>
            )}
          </div>
          {filterOpen && (
            <div
              id="showcase-tag-panel"
              className="showcase-filters"
              role="region"
              aria-label="Taggfiler"
            >
              <Tag
                label="alla"
                active={activeTag === null}
                onClick={() => {
                  setActiveTag(null)
                  setFilterOpen(false)
                }}
              />
              {allTags.map((tag) => (
                <Tag
                  key={tag}
                  label={tag}
                  active={activeTag === tag}
                  onClick={() => {
                    setActiveTag(activeTag === tag ? null : tag)
                    setFilterOpen(false)
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="showcase-grid">
          {filtered.map((p) => (
            <CardProject key={p.slug} project={p} />
          ))}
        </div>
    </main>
  )
}
