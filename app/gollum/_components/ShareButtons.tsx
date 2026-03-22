'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { Lang, ResultSlug } from '../_lib/types'
import { RESULTS } from '../_lib/quiz-data'

interface ShareButtonsProps {
  slug: ResultSlug
  lang: Lang
}

const TWEET_TEXT = {
  sv: (name: string) => `Jag fick ${name} på Gollum-testet. Är du builder eller hoardar du? 🦞 opensverige.se/gollum`,
  en: (name: string) => `I got ${name} on the Gollum Test. Are you a builder or a hoarder? 🦞 opensverige.se/gollum`,
}

const LABELS = {
  twitter: { sv: 'Dela på Twitter/X', en: 'Share on Twitter/X' },
  copy:    { sv: 'Kopiera länk',       en: 'Copy link' },
  copied:  { sv: 'Kopierat!',          en: 'Copied!' },
  download:{ sv: 'Ladda ner badge',    en: 'Download badge' },
}

const BTN: CSSProperties = {
  width: '100%',
  padding: '16px 20px',
  borderRadius: 10,
  fontFamily: 'var(--font-body)',
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  transition: 'all var(--transition)',
}

export function ShareButtons({ slug, lang }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const result = RESULTS[slug]
  const resultName = result.name[lang].replace(/^Du är |^You are /, '')

  const shareUrl = `https://opensverige.se/gollum?r=${slug}`

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDownload() {
    const res = await fetch(`/gollum/og?r=${slug}&size=square`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `opensverige-${slug}.png`
    a.click()
    URL.revokeObjectURL(url)
  }

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(TWEET_TEXT[lang](resultName))}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Twitter/X */}
      <a
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...BTN, background: '#111', color: 'var(--text-primary)', border: '1px solid #2a2a2a', textDecoration: 'none' }}
      >
        <span style={{ fontSize: 18 }}>𝕏</span>
        {LABELS.twitter[lang]}
      </a>

      {/* Copy link */}
      <button
        onClick={handleCopy}
        style={{ ...BTN, background: '#111', color: copied ? 'var(--success)' : 'var(--text-primary)', border: `1px solid ${copied ? 'var(--success-border)' : '#2a2a2a'}` }}
      >
        <span style={{ fontSize: 18 }}>⎘</span>
        {copied ? LABELS.copied[lang] : LABELS.copy[lang]}
      </button>

      {/* Download */}
      <button
        onClick={handleDownload}
        style={{ ...BTN, background: 'var(--gold-glow)', color: 'var(--gold)', border: '1px solid var(--gold-border)' }}
      >
        <span style={{ fontSize: 18 }}>↓</span>
        {LABELS.download[lang]}
      </button>
    </div>
  )
}
