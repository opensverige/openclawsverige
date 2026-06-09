'use client'

import { useEffect, useState } from 'react'
import { Countdown } from './Countdown'
import { CONTENT, SHARED, type Lang } from './data'
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

function SummaryRow({
  id,
  title,
  copiedId,
  onCopy,
  copyLabel,
}: {
  id: string
  title: string
  copiedId: string | null
  onCopy: (id: string) => void
  copyLabel: string
}) {
  return (
    <summary className={styles.accSummary}>
      <span className={styles.accTitle}>{title}</span>
      <span className={styles.accControls}>
        <button
          type="button"
          className={`${styles.copyLink} ${copiedId === id ? styles.copyLinkDone : ''}`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onCopy(id)
          }}
          aria-label={`${copyLabel}: ${title}`}
          title={copyLabel}
        >
          {copiedId === id ? '✓' : '#'}
        </button>
        <AccIcon />
      </span>
    </summary>
  )
}

function ChannelLink() {
  return (
    <a
      className={styles.channelLink}
      href={SHARED.channelUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      {SHARED.channelName}
    </a>
  )
}

export default function HackathonPage() {
  const [lang, setLang] = useState<Lang>('sv')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const c = CONTENT[lang]
  const copyLabel = lang === 'sv' ? 'Kopiera länk' : 'Copy link'

  const copyAnchor = async (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`
    let ok = false
    try {
      await navigator.clipboard.writeText(url)
      ok = true
    } catch {
      // Fallback för kontexter utan Clipboard API
      try {
        const ta = document.createElement('textarea')
        ta.value = url
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        ok = document.execCommand('copy')
        document.body.removeChild(ta)
      } catch {
        ok = false
      }
    }
    if (ok) {
      setCopiedId(id)
      window.setTimeout(
        () => setCopiedId((cur) => (cur === id ? null : cur)),
        1500,
      )
    }
  }

  // Ankarlänkar: öppna + scrolla till accordion vars id matchar URL-hashen
  // (t.ex. /hackathon#resources), både vid laddning och vid hashbyte.
  useEffect(() => {
    const openFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      if (!id) return
      const el = document.getElementById(id)
      if (el instanceof HTMLDetailsElement) {
        el.open = true
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    openFromHash()
    window.addEventListener('hashchange', openFromHash)
    return () => window.removeEventListener('hashchange', openFromHash)
  }, [])

  return (
    <main id="main-content">
      {/* ============ HERO ============ */}
      <section className={styles.hero}>
        <div className={styles.langToggle} role="group" aria-label="Language / Språk">
          {(['sv', 'en'] as const).map((l) => (
            <button
              key={l}
              type="button"
              className={`${styles.langBtn} ${lang === l ? styles.langBtnActive : ''}`}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.heroImg}
          src="/hackathon-og.png"
          alt="HACKATHON — Open Sverige Spel-Hackathon"
          width={1200}
          height={630}
        />
        <p className={styles.tagline}>{c.tagline}</p>
        <p className={styles.heroMeta}>
          {c.submissionPrefix} · {c.deadlineLabel}
        </p>
        <Countdown deadlineISO={SHARED.deadlineISO} labels={c.countdown} />
        <a
          className={styles.btnPrimary}
          href={SHARED.discordUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {c.cta} <span aria-hidden="true">→</span>
        </a>
      </section>

      {/* ============ DETALJER (accordions) ============ */}
      <div className={styles.wrap}>
        {/* Så deltar du */}
        <details id="delta" className={styles.acc} open>
          <SummaryRow id="delta" title={c.sections.delta} copiedId={copiedId} onCopy={copyAnchor} copyLabel={copyLabel} />
          <div className={styles.accBody}>
            <p className={styles.reqLead}>{c.participationLead}</p>
            <ol className={styles.reqList}>
              {c.requirements.map((r, i) => (
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
                href={SHARED.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {c.cta} <span aria-hidden="true">→</span>
              </a>
              <p className={styles.reqSupport}>{c.support}</p>
            </div>
          </div>
        </details>

        {/* Brief */}
        <details id="brief" className={styles.acc}>
          <SummaryRow id="brief" title={c.sections.brief} copiedId={copiedId} onCopy={copyAnchor} copyLabel={copyLabel} />
          <div className={styles.accBody}>
            <div className={styles.factGrid}>
              {c.facts.map((fact) => (
                <div className={styles.factCard} key={fact.label}>
                  <span className={styles.factLabel}>{fact.label}</span>
                  <span className={styles.factValue}>{fact.value}</span>
                </div>
              ))}
            </div>
          </div>
        </details>

        {/* Så lämnar du in */}
        <details id="submit" className={styles.acc}>
          <SummaryRow id="submit" title={c.sections.submit} copiedId={copiedId} onCopy={copyAnchor} copyLabel={copyLabel} />
          <div className={styles.accBody}>
            <p className={styles.panelIntro}>
              {c.submitPrefix} <ChannelLink /> {c.submitBy} {c.deadlineLabel}:
            </p>
            <ul className={styles.checklist}>
              {c.submit.map((item) => (
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

        {/* Kriterier */}
        <details id="criteria" className={styles.acc}>
          <SummaryRow id="criteria" title={c.sections.criteria} copiedId={copiedId} onCopy={copyAnchor} copyLabel={copyLabel} />
          <div className={styles.accBody}>
            <p className={styles.criteriaLead}>{c.criteriaLead}</p>
            <p className={styles.votingNote}>
              {c.votingPrefix} <ChannelLink /> {c.votingSuffix}
            </p>
            <div className={styles.criteriaList}>
              {c.criteria.map((cr) => (
                <div
                  className={cr.extra ? styles.criterionExtra : ''}
                  key={cr.no}
                >
                  <div className={styles.criterionHead}>
                    <span className={styles.criterionNo}>{cr.no}</span>
                    <span className={styles.criterionName}>{cr.name}</span>
                    {cr.extra && (
                      <span className={styles.extraBadge}>
                        {lang === 'sv' ? 'Väger extra' : 'Weighs extra'}
                      </span>
                    )}
                  </div>
                  <p className={styles.criterionBody}>{cr.body}</p>
                  <Meter weight={cr.weight} extra={cr.extra} />
                </div>
              ))}
            </div>
          </div>
        </details>

        {/* Priser */}
        <details id="prizes" className={styles.acc}>
          <SummaryRow id="prizes" title={c.sections.prizes} copiedId={copiedId} onCopy={copyAnchor} copyLabel={copyLabel} />
          <div className={styles.accBody}>
            <ul className={styles.prizeList}>
              {c.prizes.map((p) => (
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

        {/* Tips */}
        <details id="tips" className={styles.acc}>
          <SummaryRow id="tips" title={c.sections.tips} copiedId={copiedId} onCopy={copyAnchor} copyLabel={copyLabel} />
          <div className={styles.accBody}>
            <ul className={styles.tipsList}>
              {c.tips.map((tip, i) => (
                <li className={styles.tipItem} key={tip}>
                  <span className={styles.tipNum}>{String(i + 1).padStart(2, '0')}</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </details>

        {/* Resurser */}
        <details id="resources" className={styles.acc}>
          <SummaryRow id="resources" title={c.sections.resources} copiedId={copiedId} onCopy={copyAnchor} copyLabel={copyLabel} />
          <div className={styles.accBody}>
            <p className={styles.criteriaLead}>{c.resourcesLead}</p>
            {c.resources.map((g) => (
              <div className={styles.resGroup} key={g.group}>
                <span className={styles.resGroupLabel}>{g.group}</span>
                <ul className={styles.resList}>
                  {g.items.map((it) => (
                    <li className={styles.resItem} key={it.url}>
                      <a
                        className={styles.resName}
                        href={it.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {it.name} <span aria-hidden="true">→</span>
                      </a>
                      <span className={styles.resNote}>{it.note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className={styles.resTip}>{c.resourcesTip}</p>
          </div>
        </details>

        {/* Regler */}
        <details id="rules" className={styles.acc}>
          <SummaryRow id="rules" title={c.sections.rules} copiedId={copiedId} onCopy={copyAnchor} copyLabel={copyLabel} />
          <div className={styles.accBody}>
            <ul className={styles.rulesList}>
              {c.rules.map((rule) => (
                <li className={styles.ruleItem} key={rule}>
                  <span className={styles.ruleMark} aria-hidden="true">§</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </details>

        {/* ============ FOOTER ============ */}
        <footer className={styles.footer}>
          <p className={styles.wipNote}>{c.wipNote}</p>
          <nav className={styles.footerNav} aria-label="Hackathon-footer">
            <a href="/lab">{c.footerBack}</a>
            <a href="/">opensverige.se →</a>
          </nav>
        </footer>
      </div>
    </main>
  )
}
