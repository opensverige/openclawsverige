'use client';

import { useState } from 'react';
import type { Project } from './projects';
import styles from './lab.module.css';

interface ProjectCardProps {
  project: Project;
}

const STATUS_LABELS: Record<string, string> = {
  live: 'live',
  wip: 'wip',
  idea: 'idé',
};

export function ProjectCard({ project }: ProjectCardProps) {
  const [open, setOpen] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a')) return;
    setOpen((o) => !o);
  };

  return (
    <article
      className={`${styles.card} ${open ? styles.cardOpen : ''}`}
      onClick={handleCardClick}
      aria-expanded={open}
    >
      <div className={styles.cardHead}>
        <div className={styles.cardMeta}>
          <span className={styles.cardId}>{project.id}</span>
          <span className={`badge ${project.status}`}>
            {(project.status === 'live' || project.status === 'wip') && (
              <span className="bd" aria-hidden="true" />
            )}
            {STATUS_LABELS[project.status]}
          </span>
          <span className={styles.cardCategory}>{project.category}</span>
        </div>
        <button
          type="button"
          className={`${styles.cardToggle} ${open ? styles.cardToggleOpen : ''}`}
          aria-label={open ? 'Stäng' : 'Expandera'}
          tabIndex={-1}
        >
          +
        </button>
      </div>

      <h2 className={styles.cardTitle}>{project.title}</h2>
      <p className={styles.cardTagline}>{project.tagline}</p>

      <div className={styles.cardTags}>
        {project.tags.map((tag) => (
          <span key={tag} className={styles.cardTag}>{tag}</span>
        ))}
      </div>

      <div className={styles.cardDetail}>
        <dl className={styles.cardDl}>
          {project.meta.map((m) => (
            <div key={m.label} className={styles.cardDlRow}>
              <dt className={styles.cardDt}>{m.label}</dt>
              <dd className={styles.cardDd}>
                {typeof m.value === 'object' ? (
                  <a
                    href={m.value.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.cardLink}
                  >
                    {m.value.text}
                  </a>
                ) : (
                  m.value
                )}
              </dd>
            </div>
          ))}
        </dl>

        <div className={styles.cardDesc}>
          {project.description.map((d) => (
            <p key={d.label} className={styles.cardDescPara}>
              <strong className={styles.cardDescLabel}>{d.label} — </strong>
              {d.body}
            </p>
          ))}
        </div>

        <div className={styles.cardLinks}>
          {project.links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.cardLinkBtn} ${l.primary ? styles.cardLinkBtnPrimary : ''}`}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}
