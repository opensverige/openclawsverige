'use client'

import { useState } from 'react'
import type { Answer, Lang, Question } from '../_lib/types'

interface QuizQuestionProps {
  question: Question
  questionIndex: number    // 0-based
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

  function handleSelect(answer: Answer) {
    if (selected) return  // prevent double-tap
    setSelected(answer.id)
    setTimeout(() => onAnswer(answer), 500)
  }

  const progress = (questionIndex / totalQuestions) * 100

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

      {/* Progress row */}
      <div style={{ padding: '12px 24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 12, padding: 0, flexShrink: 0 }}
        >
          {lang === 'sv' ? '← tillbaka' : '← back'}
        </button>
        <div style={{ flex: 1, height: 2, background: '#1a1a1a', borderRadius: 1, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--gold)', transition: 'width 300ms var(--ease-out)' }} />
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
            return (
              <button
                key={answer.id}
                onClick={() => handleSelect(answer)}
                disabled={!!selected}
                style={{
                  padding: '14px 18px',
                  borderRadius: 10,
                  textAlign: 'left',
                  cursor: selected ? 'default' : 'pointer',
                  background: isSelected ? 'rgba(201,165,90,0.08)' : 'var(--bg-card)',
                  border: `1px solid ${isSelected ? 'var(--gold)' : 'var(--border)'}`,
                  color: 'var(--text-primary)',
                  fontSize: 15,
                  fontFamily: 'var(--font-body)',
                  lineHeight: 1.5,
                  transition: 'all 200ms var(--ease-out)',
                  boxShadow: isSelected ? '0 0 0 3px rgba(201,165,90,0.12)' : 'none',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: isSelected ? 'var(--gold)' : 'var(--text-dim)', marginRight: 10 }}>
                  {answer.id}
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
