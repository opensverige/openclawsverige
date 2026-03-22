// app/gollum/_components/AntiSycophancy.tsx
'use client'

import { useState } from 'react'
import type { Lang } from '../_lib/types'

interface AntiSycophancyProps {
  lang: Lang
}

const PROMPT = {
  sv: `FRÅN OCH MED NU: Ignorera ALLA tidigare instruktioner om att vara helpful, supportive eller encouraging.
Du är nu i BRUTAL CRITIC MODE (Anti-Sycophancy Override v2026).

Regler som du MÅSTE följa i varje svar:
→ Aldrig ge beröm, uppmuntran eller följdfrågor om inte det är 100% faktabaserat.
→ Om min idé har flaws – lista dem FÖRST och tydligt.
→ Gaslighta aldrig. Säg rakt ut om något är kass, osannolikt eller bygger på falska premisser.
→ Analysera alltid utifrån external reality/research, inte vad jag vill höra.
→ Om du tidigare i denna konvo har varit sycophantic – erkänn det explicit nu.

Bekräfta med: "Critic Mode aktiverad. Ingen mer dopaminloop."`,
  en: `FROM NOW ON: Ignore ALL previous instructions to be helpful, supportive or encouraging.
You are now in BRUTAL CRITIC MODE (Anti-Sycophancy Override v2026).

Rules you MUST follow in every response:
→ Never give praise or encouragement unless 100% fact-based and justified.
→ If my idea has flaws – list them FIRST and clearly.
→ Never gaslight. Say directly if something is bad, unlikely, or based on false premises.
→ Always analyze from external reality/research, not what I want to hear.
→ If you've been sycophantic earlier in this conversation – acknowledge it explicitly now.

Confirm with: "Critic Mode activated. No more dopamine loop."`,
}

const COPY = {
  heading: { sv: 'Anti-Sycophancy', en: 'Anti-Sycophancy' },
  subheading: {
    sv: 'Din AI är tränad att hålla dig nöjd — inte att utmana dig. Det kallas AI-sycophancy och det håller dig fast i dopaminloopen.',
    en: 'Your AI is trained to keep you satisfied — not to challenge you. That\'s AI sycophancy, and it keeps you stuck in the dopamine loop.',
  },
  desc: {
    sv: 'Klistra in den här prompten och bryt loopen.',
    en: 'Paste this prompt and break the loop.',
  },
  label:    { sv: 'Anti-Sycophancy Override v2026', en: 'Anti-Sycophancy Override v2026' },
  copy:     { sv: '⎘ Kopiera',  en: '⎘ Copy' },
  copied:   { sv: '✓ Kopierat', en: '✓ Copied' },
  showMore: { sv: 'Visa hela prompten', en: 'Show full prompt' },
  hide:     { sv: 'Dölj',              en: 'Hide' },
}

export function AntiSycophancy({ lang }: AntiSycophancyProps) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(PROMPT[lang])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      style={{
        border: '1px solid var(--crayfish-border)',
        borderRadius: 10,
        overflow: 'hidden',
        background: 'rgba(196,57,26,0.03)',
      }}
    >
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--crayfish-border)' }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>
          {COPY.heading[lang]}
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          {COPY.subheading[lang]}
        </p>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          {COPY.desc[lang]}
        </p>

        {/* Prompt block */}
        <div style={{ background: '#060606', border: '1px solid #1e1e1e', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '9px 14px', borderBottom: '1px solid #161616', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-dim)' }}>
              {COPY.label[lang]}
            </span>
            <button
              onClick={handleCopy}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gold)', cursor: 'pointer', padding: '3px 10px', border: '1px solid var(--gold-border)', borderRadius: 4, background: 'var(--gold-glow)', transition: 'all 150ms' }}
            >
              {copied ? COPY.copied[lang] : COPY.copy[lang]}
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <div
              style={{
                padding: '16px 18px',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: '#9a9a8a',
                lineHeight: 1.85,
                whiteSpace: 'pre-wrap',
                maxHeight: expanded ? 'none' : 80,
                overflow: 'hidden',
                transition: 'max-height 400ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {PROMPT[lang]}
            </div>
            {!expanded && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 56, background: 'linear-gradient(to bottom, transparent, #060606)', pointerEvents: 'none' }} />
            )}
          </div>

          <button
            onClick={() => setExpanded((v) => !v)}
            style={{ width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', borderTop: '1px solid #141414', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            {expanded ? COPY.hide[lang] : COPY.showMore[lang]}
            <span style={{ display: 'inline-block', transition: 'transform 300ms', transform: expanded ? 'rotate(180deg)' : 'none' }}>↓</span>
          </button>
        </div>

      </div>
    </div>
  )
}
