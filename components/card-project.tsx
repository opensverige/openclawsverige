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

  const content = (
    <>
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
          <span key={tag} className="tag" style={{ cursor: 'inherit' }}>
            {tag}
          </span>
        ))}
      </div>
      {project.url && (
        <div className="card-project-footer">
          <span className="card-project-footer-url">
            {project.url.replace(/^https?:\/\//, '')}
          </span>
          <span className="card-project-footer-arrow">→</span>
        </div>
      )}
    </>
  )

  if (project.url) {
    return (
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="card card-project"
        aria-label={`${project.name} — öppnas i ny flik`}
      >
        {content}
      </a>
    )
  }

  return <div className="card card-project">{content}</div>
}
