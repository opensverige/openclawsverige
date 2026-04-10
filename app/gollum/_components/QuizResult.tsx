import type { Lang, ResultSlug, ScoringResult } from '../_lib/types'
import { RESULTS } from '../_lib/quiz-data'
import { BadgeCard } from './BadgeCard'
import { ShareButtons } from './ShareButtons'
import { AntiSycophancy } from './AntiSycophancy'
import { ShipperMentor } from './ShipperMentor'

interface QuizResultProps {
  slug: ResultSlug
  lang: Lang
  scoringResult: ScoringResult | null
}

const COPY = {
  solutionHeading: { sv: 'Lösningen.', en: 'The fix.' },
  solutionSub: {
    sv: 'Du vet vad du behöver göra. Här är det svart på vitt.',
    en: 'You know what you need to do. Here it is in black and white.',
  },
  recipeLabel:  { sv: 'Receptet', en: 'The recipe' },
  mirrorLabel:  { sv: 'Dina svar avslöjar', en: 'Your answers reveal' },
  comboLabel:   { sv: 'Mönster detekterat', en: 'Pattern detected' },
  discord:      { sv: 'Gå med i Discord →', en: 'Join Discord →' },
  discordSub:   { sv: '+100 builders som faktiskt shippar & failar', en: '+100 builders who actually ship & fail' },
}

export function QuizResult({ slug, lang, scoringResult }: QuizResultProps) {
  const result = RESULTS[slug]
  const isShipper = slug === 'shipper'
  const recipeColor = isShipper ? 'var(--success)' : 'var(--gold)'
  const recipeGlow  = isShipper ? 'var(--success-glow)' : 'rgba(201,165,90,0.05)'

  return (
    <main style={{ flex: 1, padding: '28px 24px 48px', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Zon 1 — Badge */}
      <BadgeCard result={result} lang={lang} />

      {/* Zon 2 — Share */}
      <ShareButtons slug={slug} lang={lang} />

      {/* Mirror section — only shown when quiz was completed (not URL-restored) */}
      {scoringResult && scoringResult.mirrors.length > 0 && (
        <div
          style={{
            border: '1px solid #1e1e1e',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1a1a', background: '#0a0808' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-dim)', margin: 0 }}>
              {COPY.mirrorLabel[lang]}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {scoringResult.mirrors.map((mirror, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 16px',
                  borderBottom: i < scoringResult.mirrors.length - 1 ? '1px solid #111' : 'none',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--crayfish-red)', marginTop: 3, flexShrink: 0 }}>→</span>
                <p style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                  {mirror[lang]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Combo callouts — subtle, only when triggered */}
      {scoringResult && scoringResult.triggeredCombos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--crayfish-light)', margin: 0 }}>
            {COPY.comboLabel[lang]}
          </p>
          {scoringResult.triggeredCombos.map((combo) => (
            <div
              key={combo.id}
              style={{
                padding: '10px 14px',
                background: 'rgba(196,57,26,0.04)',
                border: '1px solid rgba(196,57,26,0.15)',
                borderRadius: 8,
              }}
            >
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {combo.callout[lang]}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Zon 3 — Lösningen */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 400, letterSpacing: '-0.5px', lineHeight: 1.1, marginBottom: 6 }}>
            {COPY.solutionHeading[lang]}
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {COPY.solutionSub[lang]}
          </p>
        </div>

        {/* Recipe */}
        <div style={{ borderLeft: `3px solid ${recipeColor}`, padding: '14px 16px', background: recipeGlow, borderRadius: '0 8px 8px 0' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: recipeColor, marginBottom: 8 }}>
            {COPY.recipeLabel[lang]}
          </p>
          <p style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.6 }}>
            {result.recipe[lang]}
          </p>
        </div>

        {/* Anti-sycophancy or Shipper mentor */}
        {isShipper ? (
          <ShipperMentor lang={lang} />
        ) : (
          <AntiSycophancy lang={lang} />
        )}

        {/* Discord CTA */}
        {(isShipper || lang === 'sv') && (
          <a
            href="https://discord.gg/CSphbTk8En"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: isShipper ? 'rgba(74,222,128,0.08)' : 'var(--crayfish-red)',
              border: isShipper ? '1px solid var(--success-border)' : 'none',
              color: isShipper ? 'var(--success)' : 'white',
              borderRadius: 10,
              padding: '18px 22px',
              textDecoration: 'none',
            }}
          >
            <div>
              <p style={{ fontSize: 17, fontWeight: 700 }}>{COPY.discord[lang]}</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, opacity: 0.7, marginTop: 3 }}>{COPY.discordSub[lang]}</p>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22 }}>→</span>
          </a>
        )}
      </div>

    </main>
  )
}
