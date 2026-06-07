import { Countdown } from './Countdown'
import {
  HACKATHON,
  REQUIREMENTS,
  SUPPORT_NOTE,
  FACTS,
  SUBMIT,
  CRITERIA,
  PRIZES,
  TIPS,
} from './data'
import styles from './hackathon.module.css'

const TICKER_ITEMS = [
  'NÄR · 9–15 JUNI',
  'TEMA · SKAPA ETT SPEL',
  'DEADLINE · 14 JUNI 00:00',
  'ÖPPEN KOD VÄGER EXTRA',
  'ALLA NIVÅER VÄLKOMNA',
]

function Meter({ weight, extra }: { weight: number; extra?: boolean }) {
  return (
    <div className={styles.meter} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`${styles.seg} ${
            i < weight ? (extra ? styles.segExtra : styles.segOn) : ''
          }`}
        />
      ))}
    </div>
  )
}

export default function HackathonPage() {
  return (
    <main id="main-content">
      {/* ============ HERO ============ */}
      <section className={styles.hero}>
        <div className={styles.heroMedia} aria-hidden="true" />
        <div className={styles.heroScrim} aria-hidden="true" />
        <div className={styles.heroGrid} aria-hidden="true" />

        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>{HACKATHON.eyebrow}</p>
          <h1 className={styles.title} data-text={HACKATHON.title}>
            {HACKATHON.title}
          </h1>
          <p className={styles.subtitle}>
            {HACKATHON.tagline}
            <span className={styles.cursor} aria-hidden="true" />
          </p>

          <Countdown deadlineISO={HACKATHON.deadlineISO} />

          <div className={styles.heroCtas}>
            <a
              className={styles.btnPrimary}
              href={HACKATHON.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Gå med i {HACKATHON.discordChannel} <span aria-hidden="true">→</span>
            </a>
            <a className={styles.btnGhost} href="#brief">
              Läs reglerna <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </section>

      {/* ============ TICKER ============ */}
      <div className={styles.ticker} aria-hidden="true">
        <div className={styles.tickerTrack}>
          {[0, 1].map((dup) => (
            <span className={styles.tickerGroup} key={dup}>
              {TICKER_ITEMS.map((item) => (
                <span className={styles.tickerItem} key={item}>
                  {item} <span className={styles.tickerSep}>◆</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.wrap}>
        {/* ============ SÅ DELTAR DU (KRAV) ============ */}
        <section className={styles.section}>
          <h2 className={styles.sectionLabel}>&gt;&gt; Så deltar du</h2>
          <div className={styles.reqCallout}>
            <span className={styles.reqBadge}>Krav för att delta</span>
            <ol className={styles.reqList}>
              {REQUIREMENTS.map((r, i) => (
                <li className={styles.reqItem} key={r.title}>
                  <span className={styles.reqNum}>{String(i + 1).padStart(2, '0')}</span>
                  <div className={styles.reqText}>
                    <span className={styles.reqTitle}>{r.title}</span>
                    <p className={styles.reqBody}>{r.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className={styles.reqActions}>
              <a
                className={styles.btnPrimary}
                href={HACKATHON.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Gå med i Discord <span aria-hidden="true">→</span>
              </a>
              <p className={styles.reqSupport}>{SUPPORT_NOTE}</p>
            </div>
          </div>
        </section>

        {/* ============ BRIEF ============ */}
        <section id="brief" className={styles.section}>
          <h2 className={styles.sectionLabel}>&gt;&gt; Brief</h2>
          <div className={styles.factGrid}>
            {FACTS.map((fact) => (
              <div className={styles.factCard} key={fact.label}>
                <span className={styles.factLabel}>{fact.label}</span>
                <span className={styles.factValue}>{fact.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ============ SUBMIT ============ */}
        <section className={styles.section}>
          <h2 className={styles.sectionLabel}>&gt;&gt; Så lämnar du in</h2>
          <div className={styles.panel}>
            <p className={styles.panelIntro}>
              Posta i <strong>{HACKATHON.discordChannel}</strong> senast{' '}
              {HACKATHON.deadlineLabel}:
            </p>
            <ul className={styles.checklist}>
              {SUBMIT.map((item) => (
                <li className={styles.checkItem} key={item.text}>
                  <span className={styles.checkBox} aria-hidden="true">
                    {item.bonus ? '★' : '✓'}
                  </span>
                  <span>
                    {item.bonus && <span className={styles.bonusTag}>Bonus</span>}
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============ HUR MAN VINNER ============ */}
        <section className={styles.section}>
          <h2 className={styles.sectionLabel}>&gt;&gt; Hur man vinner</h2>
          <div className={styles.panel}>
            <p className={styles.winLead}>Blandning av community + jury.</p>
            <ul className={styles.winList}>
              <li>
                <strong>Community</strong> röstar på spelglädje — roligast att
                spela.
              </li>
              <li>
                <strong>En liten jury</strong> (inklusive en gamer) bedömer
                helheten.
              </li>
              <li>
                Varje kriterium ger <strong>1–5 poäng</strong>. Högst totalpoäng
                vinner.
              </li>
            </ul>
          </div>
        </section>

        {/* ============ KRITERIER ============ */}
        <section className={styles.section}>
          <h2 className={styles.sectionLabel}>&gt;&gt; Kriterier</h2>
          <div className={styles.criteriaList}>
            {CRITERIA.map((c) => (
              <div
                className={`${styles.criterion} ${c.extra ? styles.criterionExtra : ''}`}
                key={c.no}
              >
                <div className={styles.criterionHead}>
                  <span className={styles.criterionNo}>{c.no}</span>
                  <span className={styles.criterionName}>{c.name}</span>
                  {c.extra && <span className={styles.extraBadge}>Väger extra</span>}
                </div>
                <p className={styles.criterionBody}>{c.body}</p>
                <Meter weight={c.weight} extra={c.extra} />
              </div>
            ))}
          </div>
        </section>

        {/* ============ PRISER ============ */}
        <section className={styles.section}>
          <h2 className={styles.sectionLabel}>&gt;&gt; Priser</h2>
          <div className={styles.prizeGrid}>
            {PRIZES.map((p) => (
              <div
                className={`${styles.prizeCard} ${p.featured ? styles.prizeFeatured : ''}`}
                key={p.rank}
              >
                <span className={styles.prizeRank}>{p.rank}</span>
                <span className={styles.prizeTitle}>{p.title}</span>
                <ul className={styles.prizeItems}>
                  {p.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ============ TIPS ============ */}
        <section className={styles.section}>
          <h2 className={styles.sectionLabel}>&gt;&gt; Tips</h2>
          <ul className={styles.tipsList}>
            {TIPS.map((tip, i) => (
              <li className={styles.tipItem} key={tip}>
                <span className={styles.tipNum}>{String(i + 1).padStart(2, '0')}</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ============ FOOTER ============ */}
        <footer className={styles.footer}>
          <p className={styles.wipNote}>{HACKATHON.wipNote}</p>
          <div className={styles.footerCtas}>
            <a
              className={styles.btnPrimary}
              href={HACKATHON.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Gå med i Discord <span aria-hidden="true">→</span>
            </a>
            <a
              className={styles.btnGhost}
              href={HACKATHON.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub <span aria-hidden="true">→</span>
            </a>
          </div>
          <nav className={styles.footerNav} aria-label="Hackathon-footer">
            <a href="/lab">← opensverige / lab</a>
            <a href="/">opensverige.se →</a>
          </nav>
        </footer>
      </div>
    </main>
  )
}
