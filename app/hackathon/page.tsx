import { Countdown } from './Countdown'
import {
  HACKATHON,
  PARTICIPATION_LEAD,
  REQUIREMENTS,
  SUPPORT_NOTE,
  FACTS,
  SUBMIT,
  CRITERIA,
  PRIZES,
  TIPS,
} from './data'
import styles from './hackathon.module.css'

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

function AccIcon() {
  return (
    <span className={styles.accIcon} aria-hidden="true">
      +
    </span>
  )
}

export default function HackathonPage() {
  return (
    <main id="main-content">
      {/* ============ HERO ============ */}
      <section className={styles.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.heroImg}
          src="/hackathon-og.png"
          alt="HACKATHON — Open Sverige Spel-Hackathon"
          width={1200}
          height={630}
        />
        <p className={styles.tagline}>{HACKATHON.tagline}</p>
        <p className={styles.heroMeta}>Inlämning · {HACKATHON.deadlineLabel}</p>
        <Countdown deadlineISO={HACKATHON.deadlineISO} />
        <a
          className={styles.btnPrimary}
          href={HACKATHON.discordUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Gå med i {HACKATHON.discordChannel} <span aria-hidden="true">→</span>
        </a>
      </section>

      {/* ============ DETALJER (accordions) ============ */}
      <div className={styles.wrap}>
        <details className={styles.acc} open>
          <summary className={styles.accSummary}>
            <span className={styles.accTitle}>Så deltar du</span>
            <AccIcon />
          </summary>
          <div className={styles.accBody}>
            <p className={styles.reqLead}>{PARTICIPATION_LEAD}</p>
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
        </details>

        <details className={styles.acc}>
          <summary className={styles.accSummary}>
            <span className={styles.accTitle}>Brief</span>
            <AccIcon />
          </summary>
          <div className={styles.accBody}>
            <div className={styles.factGrid}>
              {FACTS.map((fact) => (
                <div className={styles.factCard} key={fact.label}>
                  <span className={styles.factLabel}>{fact.label}</span>
                  <span className={styles.factValue}>{fact.value}</span>
                </div>
              ))}
            </div>
          </div>
        </details>

        <details className={styles.acc}>
          <summary className={styles.accSummary}>
            <span className={styles.accTitle}>Så lämnar du in</span>
            <AccIcon />
          </summary>
          <div className={styles.accBody}>
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
        </details>

        <details className={styles.acc}>
          <summary className={styles.accSummary}>
            <span className={styles.accTitle}>Kriterier</span>
            <AccIcon />
          </summary>
          <div className={styles.accBody}>
            <p className={styles.criteriaLead}>
              Community röstar på spelglädje, en liten jury bedömer helheten.
              1–5 poäng per kriterium — högst total vinner.
            </p>
            <div className={styles.criteriaList}>
              {CRITERIA.map((c) => (
                <div
                  className={c.extra ? styles.criterionExtra : ''}
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
          </div>
        </details>

        <details className={styles.acc}>
          <summary className={styles.accSummary}>
            <span className={styles.accTitle}>Priser</span>
            <AccIcon />
          </summary>
          <div className={styles.accBody}>
            <ul className={styles.prizeList}>
              {PRIZES.map((p) => (
                <li className={styles.prizeRow} key={p.name}>
                  <span className={styles.prizeMark} aria-hidden="true">★</span>
                  <span>
                    <span className={styles.prizeName}>{p.name}</span>
                    {p.detail && <span className={styles.prizeDetail}> · {p.detail}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </details>

        <details className={styles.acc}>
          <summary className={styles.accSummary}>
            <span className={styles.accTitle}>Tips</span>
            <AccIcon />
          </summary>
          <div className={styles.accBody}>
            <ul className={styles.tipsList}>
              {TIPS.map((tip, i) => (
                <li className={styles.tipItem} key={tip}>
                  <span className={styles.tipNum}>{String(i + 1).padStart(2, '0')}</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </details>

        {/* ============ FOOTER ============ */}
        <footer className={styles.footer}>
          <p className={styles.wipNote}>{HACKATHON.wipNote}</p>
          <nav className={styles.footerNav} aria-label="Hackathon-footer">
            <a href="/lab">← opensverige / lab</a>
            <a href="/">opensverige.se →</a>
          </nav>
        </footer>
      </div>
    </main>
  )
}
