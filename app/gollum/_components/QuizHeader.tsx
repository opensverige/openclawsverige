import type { Lang } from '../_lib/types'

interface QuizHeaderProps {
  lang: Lang
  onToggleLang: () => void
}

export function QuizHeader({ lang, onToggleLang }: QuizHeaderProps) {
  return (
    <header
      style={{
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #111',
        flexShrink: 0,
      }}
    >
      <a
        href="https://opensverige.se"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 16,
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.3px',
          textDecoration: 'none',
        }}
      >
        opensverige
      </a>

      <button
        onClick={onToggleLang}
        style={{
          display: 'flex',
          gap: 4,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
        aria-label="Toggle language"
      >
        {(['sv', 'en'] as Lang[]).map((l) => (
          <span
            key={l}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              padding: '4px 10px',
              borderRadius: 4,
              color: lang === l ? 'var(--text-primary)' : 'var(--text-muted)',
              border: `1px solid ${lang === l ? 'var(--border)' : 'transparent'}`,
              background: lang === l ? 'var(--bg-card)' : 'transparent',
              transition: 'var(--transition-fast)',
            }}
          >
            {l === 'sv' ? 'SV' : 'EN'}
          </span>
        ))}
      </button>
    </header>
  )
}
