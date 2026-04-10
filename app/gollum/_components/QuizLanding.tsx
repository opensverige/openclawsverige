'use client'

import { useEffect, useRef } from 'react'
import type { Lang } from '../_lib/types'

interface QuizLandingProps {
  lang: Lang
  onStart: () => void
  completions: number | null
}

const COPY = {
  heading: { sv: 'Är du Gollum?', en: 'Are you Gollum?' },
  sub: {
    sv: 'Nio frågor. Brutalt ärliga svar. Ta reda på om du bygger — eller bara hoardar.',
    en: "Nine questions. Brutally honest answers. Find out if you're building — or just hoarding.",
  },
  cta: { sv: 'Starta testet', en: 'Take the test' },
  fine: {
    sv: 'Tar 90 sekunder. Inga email. Ingen bullshit.',
    en: 'Takes 90 seconds. No email. No bullshit.',
  },
}

function CountUp({ target }: { target: number }) {
  const elRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!elRef.current) return
    const duration = 900
    const start = performance.now()
    const from = Math.max(0, target - 60)

    function step(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(from + (target - from) * eased)
      if (elRef.current) elRef.current.textContent = String(current)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target])

  return <span ref={elRef}>{target}</span>
}

export function QuizLanding({ lang, onStart, completions }: QuizLandingProps) {
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
      {/* Hero illustration */}
      <img
        src="/gollum/precious.png"
        alt=""
        style={{
          width: 160,
          height: 160,
          borderRadius: 16,
          objectFit: 'cover',
          marginBottom: 32,
        }}
      />

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
          margin: '0 0 32px',
        }}
      >
        {COPY.sub[lang]}
      </p>

      {completions !== null && completions > 0 && (
        <div className="quiz-counter">
          <span className="quiz-counter-dot" aria-hidden="true" />
          <span className="quiz-counter-num">
            <CountUp target={completions} />
          </span>
          <span className="quiz-counter-label">genomförda</span>
        </div>
      )}

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
