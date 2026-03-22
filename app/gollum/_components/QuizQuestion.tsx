'use client'

import { useState } from 'react'
import type { Answer, Lang, Question } from '../_lib/types'

interface QuizQuestionProps {
  question: Question
  questionIndex: number
  totalQuestions: number
  lang: Lang
  onAnswer: (answer: Answer) => void
  onBack: () => void
}

export function QuizQuestion({
  question,
  questionIndex,
  totalQuestions,
  lang,
  onAnswer,
  onBack,
}: QuizQuestionProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  function handleSelect(answer: Answer) {
    if (selected) return
    setSelected(answer.id)
    setTimeout(() => onAnswer(answer), 500)
  }

  const progress = ((questionIndex + 1) / totalQuestions) * 100

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes card-select {
          0%   { transform: scale(1); }
          35%  { transform: scale(1.025); }
          100% { transform: scale(1); }
        }
        @keyframes badge-confirm {
          0%   { transform: scale(1);   opacity: 1; }
          40%  { transform: scale(1.6); opacity: 0.7; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes progress-pulse {
          0%   { opacity: 1; }
          50%  { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>

      {/* Progress row */}
      <div style={{ padding: '12px 24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 12, padding: 0, flexShrink: 0 }}
        >
          {lang === 'sv' ? '← tillbaka' : '← back'}
        </button>
        <div style={{ flex: 1, height: 2, background: '#1a1a1a', borderRadius: 1, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--gold)',
              transition: 'width 400ms cubic-bezier(0.16, 1, 0.3, 1)',
              animation: selected ? 'progress-pulse 400ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
            }}
          />
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', flexShrink: 0 }}>
          {questionIndex + 1} / {totalQuestions}
        </span>
      </div>

      {/* Question */}
      <div style={{ padding: '32px 24px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 18, color: 'var(--text-primary)', lineHeight: 1.5, margin: 0, fontFamily: 'var(--font-body)' }}>
          {question.text[lang]}
        </p>

        {/* Answer cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {question.answers.map((answer) => {
            const isSelected = selected === answer.id
            const isHovered = !selected && hovered === answer.id
            const isDimmed  = !!selected && !isSelected

            return (
              <button
                key={answer.id}
                onClick={() => handleSelect(answer)}
                onMouseEnter={() => setHovered(answer.id)}
                onMouseLeave={() => setHovered(null)}
                disabled={!!selected}
                style={{
                  padding: '14px 18px',
                  borderRadius: 10,
                  textAlign: 'left',
                  cursor: selected ? 'default' : 'pointer',
                  background: isSelected
                    ? 'rgba(201,165,90,0.1)'
                    : isHovered
                      ? 'rgba(196,57,26,0.06)'
                      : 'var(--bg-card)',
                  border: `1px solid ${
                    isSelected ? 'var(--gold)'
                    : isHovered ? 'rgba(196,57,26,0.5)'
                    : 'var(--border)'
                  }`,
                  color: isDimmed ? 'var(--text-dim)' : 'var(--text-primary)',
                  fontSize: 15,
                  fontFamily: 'var(--font-body)',
                  lineHeight: 1.5,
                  transition: 'background 150ms var(--ease-out), border-color 150ms var(--ease-out), color 200ms var(--ease-out), box-shadow 150ms var(--ease-out)',
                  boxShadow: isSelected
                    ? '0 0 0 3px rgba(201,165,90,0.15)'
                    : isHovered
                      ? '0 0 0 3px rgba(196,57,26,0.08)'
                      : 'none',
                  animation: isSelected ? 'card-select 400ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
                  opacity: isDimmed ? 0.4 : 1,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: isSelected ? 'var(--gold)' : isHovered ? 'var(--crayfish-light)' : 'var(--text-dim)',
                    marginRight: 10,
                    display: 'inline-block',
                    transition: 'color 150ms var(--ease-out)',
                    animation: isSelected ? 'badge-confirm 350ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
                  }}
                >
                  {isSelected ? '✓' : answer.id}
                </span>
                {answer.text[lang]}
              </button>
            )
          })}
        </div>
      </div>
    </main>
  )
}
