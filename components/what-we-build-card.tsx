'use client'

import type { CSSProperties } from 'react'
import { useId, useLayoutEffect, useRef, useState } from 'react'

export interface WhatWeBuildCardProps {
  title: string
  body: string
}

export function WhatWeBuildCard({ title, body }: WhatWeBuildCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [collapsedPx, setCollapsedPx] = useState<number | null>(null)
  const [shortText, setShortText] = useState(false)
  const pRef = useRef<HTMLParagraphElement>(null)
  const contentId = useId()

  useLayoutEffect(() => {
    const el = pRef.current
    if (!el) return
    const full = el.scrollHeight
    if (full < 72) {
      setShortText(true)
      setCollapsedPx(null)
      return
    }
    setShortText(false)
    setCollapsedPx(Math.round(full * 0.5))
  }, [body])

  let innerStyle: CSSProperties | undefined
  if (expanded) {
    innerStyle = { maxHeight: '80rem' }
  } else if (!shortText && collapsedPx !== null) {
    innerStyle = { maxHeight: collapsedPx }
  }

  return (
    <div className="card what-card">
      <div className="card-title">{title}</div>
      <div className="what-card-stack">
        <div className="what-card-text-wrap">
          <div
            className={`what-card-text-inner ${expanded ? 'is-open' : ''} ${shortText ? 'is-short' : ''}`}
            style={innerStyle}
          >
            <p
              ref={pRef}
              id={contentId}
              className="card-body what-card-body-full"
            >
              {body}
            </p>
          </div>
          {!expanded && !shortText && (
            <div className="what-card-text-fade" aria-hidden="true" />
          )}
        </div>
        {!shortText && (
          <button
            type="button"
            className="what-card-expand-btn"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls={contentId}
          >
            <span>{expanded ? 'Visa mindre' : 'Visa mer'}</span>
            <span className="what-card-expand-aw" aria-hidden="true">
              →
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
