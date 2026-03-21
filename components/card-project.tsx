import type { ShowcaseProject } from '@/lib/mdx'
import { StatusBadge } from './status-badge'

interface CardProjectProps {
  project: ShowcaseProject
}

const GLYPHS: Record<string, React.ReactNode> = {
  lunaraistorm: <span style={{ color: 'var(--gold)' }}>◆</span>,
  kammaren: (
    <span
      className="g g-braille"
      style={{ color: 'var(--crayfish-light)' }}
      aria-hidden="true"
    />
  ),
  'fortnox-skill': <span style={{ color: 'var(--success)' }}>▸</span>,
  'agent-radar': (
    <span
      className="g g-dots"
      style={{ color: 'var(--status-wip)' }}
      aria-hidden="true"
    />
  ),
  faver: (
    <span style={{ color: 'var(--gold-light)' }} aria-hidden="true">
      ◎
    </span>
  ),
}

export function CardProject({ project }: CardProjectProps) {
  const glyph = GLYPHS[project.slug] ?? (
    <span style={{ color: 'var(--text-dim)' }}>◇</span>
  )

  return (
    <div className="card card-project">
      <div className="card-project-head">
        <div>
          <div className="card-project-glyph">{glyph}</div>
          <div className="card-project-title">{project.name}</div>
        </div>
        <StatusBadge status={project.status} />
      </div>
      <div className="card-project-body">{project.description}</div>
      <div className="card-project-tags">
        {project.tags.map((tag) => (
          <span key={tag} className="tag" style={{ cursor: 'default' }}>
            {tag}
          </span>
        ))}
      </div>
      {project.author && (
        <div className="card-project-author">{project.author}</div>
      )}
      {project.url && (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="card-project-link"
          style={{ marginTop: 12, display: 'inline-flex' }}
          aria-label={`${project.url.replace(/^https?:\/\//, '')} (öppnas i ny flik)`}
        >
          <span className="card-project-link-host">
            {project.url.replace(/^https?:\/\//, '')}
          </span>
          <span className="card-project-external" aria-hidden="true">
            <svg
              className="card-project-external-svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="15 3 21 3 21 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="10"
                y1="14"
                x2="21"
                y2="3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </a>
      )}
    </div>
  )
}
