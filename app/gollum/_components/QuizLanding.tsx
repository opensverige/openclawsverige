import type { Lang } from '../_lib/types'

interface QuizLandingProps {
  lang: Lang
  onStart: () => void
}

const COPY = {
  heading: { sv: 'Är du Gollum?', en: 'Are you Gollum?' },
  sub: {
    sv: 'Fem frågor. Brutalt ärliga svar. Ta reda på om du bygger — eller bara hoardar.',
    en: "Five questions. Brutally honest answers. Find out if you're building — or just hoarding.",
  },
  cta: { sv: 'Starta testet', en: 'Take the test' },
  fine: {
    sv: 'Tar 90 sekunder. Inga email. Ingen bullshit.',
    en: 'Takes 90 seconds. No email. No bullshit.',
  },
}

export function QuizLanding({ lang, onStart }: QuizLandingProps) {
  return (
    <main
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        gap: 0,
        background: 'linear-gradient(180deg, rgba(196,57,26,0.04) 0%, transparent 60%)',
      }}
    >
      {/* Hero illustration placeholder — swap src when artwork is ready */}
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: 16,
          background: '#111',
          border: '1px dashed #2a2a2a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
          gap: 6,
        }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: 3, color: 'rgba(196,57,26,0.3)', textAlign: 'center', lineHeight: 1.6 }}>
          gollum<br />illustration
        </span>
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 52,
          fontWeight: 400,
          letterSpacing: '-1.5px',
          lineHeight: 1.05,
          color: 'var(--text-primary)',
          margin: '0 0 16px',
        }}
      >
        {COPY.heading[lang]}
      </h1>

      <p
        style={{
          fontSize: 17,
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          maxWidth: 320,
          margin: '0 0 40px',
        }}
      >
        {COPY.sub[lang]}
      </p>

      <button
        onClick={onStart}
        style={{
          background: 'var(--crayfish-red)',
          color: 'white',
          border: 'none',
          borderRadius: 10,
          padding: '16px 32px',
          fontSize: 17,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          letterSpacing: '-0.2px',
          marginBottom: 20,
        }}
      >
        {COPY.cta[lang]} →
      </button>

      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--text-dim)',
          margin: 0,
        }}
      >
        {COPY.fine[lang]}
      </p>
    </main>
  )
}
