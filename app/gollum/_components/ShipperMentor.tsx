import type { Lang } from '../_lib/types'

interface ShipperMentorProps {
  lang: Lang
}

const COPY = {
  title: { sv: 'Dra upp en Gollum', en: 'Pull up a Gollum' },
  sub: {
    sv: 'Du är den personen som andra i communityn behöver lära sig av. Tre sätt att bidra:',
    en: "You're the person others in the community need to learn from. Three ways to contribute:",
  },
  actions: [
    { sv: 'Dela din process i Discord', en: 'Share your process in Discord' },
    { sv: 'Posta en demo den här veckan', en: 'Post a demo this week' },
    { sv: 'Tagga en Gollum — skicka länken', en: 'Tag a Gollum — send the link' },
  ],
}

export function ShipperMentor({ lang }: ShipperMentorProps) {
  return (
    <div
      style={{
        border: '1px solid var(--success-border)',
        background: 'var(--success-glow)',
        borderRadius: 10,
        padding: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 6, background: 'rgba(74,222,128,0.1)', border: '1px solid var(--success-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--success)' }}>
          →
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400, color: 'var(--text-primary)' }}>
          {COPY.title[lang]}
        </span>
      </div>

      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
        {COPY.sub[lang]}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {COPY.actions.map((action, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              background: 'rgba(74,222,128,0.06)',
              border: '1px solid var(--success-border)',
              borderRadius: 8,
              fontSize: 14,
              color: 'var(--text-primary)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--success)', flexShrink: 0 }}>→</span>
            {action[lang]}
          </div>
        ))}
      </div>
    </div>
  )
}
