'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Answer, Lang, QuizView, ResultSlug } from '../_lib/types'
import { QUESTIONS, RESULTS } from '../_lib/quiz-data'
import { calculateScores } from '../_lib/scoring'
import { QuizHeader } from './QuizHeader'
import { QuizLanding } from './QuizLanding'
import { QuizQuestion } from './QuizQuestion'
import { QuizResult } from './QuizResult'

export function GollumQuiz() {
  const searchParams = useSearchParams()
  const r = searchParams.get('r')

  const [lang, setLang] = useState<Lang>('sv')
  const [view, setView] = useState<QuizView>(() => {
    if (r && r in RESULTS) {
      return { screen: 'result', slug: r as ResultSlug, scoringResult: null }
    }
    return { screen: 'landing' }
  })
  const [answers, setAnswers] = useState<Answer[]>([])

  function toggleLang() {
    setLang((l) => (l === 'sv' ? 'en' : 'sv'))
  }

  function handleStart() {
    setAnswers([])
    setView({ screen: 'question', index: 0 })
  }

  function handleAnswer(answer: Answer) {
    if (view.screen !== 'question') return
    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)

    if (view.index < QUESTIONS.length - 1) {
      setView({ screen: 'question', index: view.index + 1 })
    } else {
      const scoringResult = calculateScores(newAnswers)
      setView({ screen: 'result', slug: scoringResult.archetype, scoringResult })
    }
  }

  function handleBack() {
    if (view.screen === 'question') {
      if (view.index === 0) {
        setView({ screen: 'landing' })
        setAnswers([])
      } else {
        setView({ screen: 'question', index: view.index - 1 })
        setAnswers((prev) => prev.slice(0, -1))
      }
    }
  }

  return (
    <div
      className="gollum-quiz"
      style={{
        minHeight: '100vh',
        background: 'var(--bg-deep)',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 480,
        margin: '0 auto',
      }}
    >
      <QuizHeader lang={lang} onToggleLang={toggleLang} />

      {view.screen === 'landing' && (
        <QuizLanding lang={lang} onStart={handleStart} />
      )}

      {view.screen === 'question' && (
        <QuizQuestion
          key={view.index}
          question={QUESTIONS[view.index]}
          questionIndex={view.index}
          totalQuestions={QUESTIONS.length}
          lang={lang}
          onAnswer={handleAnswer}
          onBack={handleBack}
        />
      )}

      {view.screen === 'result' && (
        <QuizResult slug={view.slug} lang={lang} scoringResult={view.scoringResult} />
      )}
    </div>
  )
}
