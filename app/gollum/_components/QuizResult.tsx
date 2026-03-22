import type { Lang, ResultSlug } from '../_lib/types'
import { RESULTS } from '../_lib/quiz-data'
import { BadgeCard } from './BadgeCard'
import { ShareButtons } from './ShareButtons'
import { AntiSycophancy } from './AntiSycophancy'
import { ShipperMentor } from './ShipperMentor'

interface QuizResultProps {
  slug: ResultSlug
  lang: Lang
}

const COPY = {
  solutionHeading: { sv: 'Lösningen.', en: 'The fix.' },
  solutionSub: {
    sv: 'Du vet vad du behöver göra. Här är det svart på vitt.',
    en: "You know what you need to do. Here it is in black and white.",
  },
  recipeLabel: { sv: 'Receptet', en: 'The recipe' },
  discord: { sv: 'Gå med i Discord →', en: 'Join Discord →' },
  discordSub: { sv: '+100 builders som faktiskt shippar & failar', en: '+100 builders who actually ship & fail' },
}

export function QuizResult({ slug, lang }: QuizResultProps) {
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

        {/* Discord CTA — shown for Shipparen (all langs) + all other results in SV.
            EN non-Shippers get the X CTA inside AntiSycophancy instead. */}
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
