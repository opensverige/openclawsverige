import type { Lang, ResultData } from '../_lib/types'

interface BadgeCardProps {
  result: ResultData
  lang: Lang
}

export function BadgeCard({ result, lang }: BadgeCardProps) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {/* Art area — placeholder until illustration is ready */}
      <div
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          background: '#0d0a0a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          borderBottom: '1px solid #1a1a1a',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 52, opacity: 0.18 }}>{result.emoji}</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: 3,
              color: 'rgba(196,57,26,0.3)',
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            {result.slug}.gif<br />custom illustration
          </span>
        </div>
      </div>

      {/* Text area */}
      <div style={{ padding: '20px 22px 22px' }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 44,
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: '-1px',
            color: 'var(--text-primary)',
            margin: '0 0 10px',
          }}
        >
          {result.name[lang]}
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          {result.headline[lang]}
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '10px 22px',
          borderTop: '1px solid #1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--gold)', opacity: 0.5 }}>
          opensverige
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>
          opensverige.se/gollum
        </span>
      </div>
    </div>
  )
}
