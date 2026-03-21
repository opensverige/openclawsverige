import Link from 'next/link'
import type { DiscordData } from '@/lib/discord'
import { StatBar } from './stat-bar'

interface HeroProps {
  discord: DiscordData | null
}

const DISCORD_FAIL_CHAT: {
  user: string
  userClass: 'dc-u1' | 'dc-u2' | 'dc-u3' | 'dc-u4'
  time: string
  text: string
}[] = [
  {
    user: 'elin',
    userClass: 'dc-u1',
    time: '14:02',
    text: 'MCP-servern svarar 500 igen.',
  },
  {
    user: 'ossian',
    userClass: 'dc-u2',
    time: '14:03',
    text: 'Agenten loopar tomma verktyg.',
  },
  {
    user: 'nina',
    userClass: 'dc-u3',
    time: '14:05',
    text: 'LangGraph fastnar i waiting state.',
  },
  {
    user: 'sora',
    userClass: 'dc-u4',
    time: '14:07',
    text: 'OpenClaw ser inte min .env.',
  },
  {
    user: 'meja',
    userClass: 'dc-u1',
    time: '14:09',
    text: 'CrewAI glömde minnet från tråden.',
  },
]

export function Hero({ discord }: HeroProps) {
  return (
    <section className="hero">
      {/* Crayfish background image */}
      <div className="hero-img" />

      {/* Grid overlay */}
      <div className="hero-grid" />

      {/* Gold glow */}
      <div className="hero-glow" />

      {/* Floating windows — hidden on mobile via CSS */}
      <div className="float-windows" aria-hidden="true">
        {/* Window 1: build.log */}
        <div
          className="fw fw-1"
          style={{ top: '14%', right: '8%', width: 220 }}
        >
          <div className="fw-head">
            <span className="d r" />
            <span className="d y" />
            <span className="d g" />
            <span className="t">build.log</span>
          </div>
          <div className="fw-body">
            <div style={{ color: 'var(--success)' }}>✔ compiled</div>
            <div style={{ color: 'var(--fail-red)' }}>✗ vat_parsing</div>
            <div style={{ color: 'var(--gold)' }}>↻ retry</div>
            <div style={{ color: 'var(--success)' }}>✔ deployed</div>
            <div style={{ color: 'var(--gold)' }}>◆ shipped</div>
          </div>
        </div>

        {/* Window 2: agent-monitor */}
        <div
          className="fw fw-2"
          style={{ top: '52%', right: '4%', width: 200 }}
        >
          <div className="fw-head">
            <span className="d r" />
            <span className="d y" />
            <span className="d g" />
            <span className="t">agent-monitor</span>
          </div>
          <div className="fw-body">
            <div>
              <span
                className="g g-braille"
                style={{ color: 'var(--crayfish-light)' }}
              />{' '}
              <span style={{ color: 'var(--text-secondary)' }}>
                fortnox-agent
              </span>{' '}
              <span style={{ color: 'var(--success)' }}>running</span>
            </div>
            <div>
              <span
                className="g g-moon"
                style={{ color: 'var(--gold)' }}
              />{' '}
              <span style={{ color: 'var(--text-secondary)' }}>scb-data</span>{' '}
              <span style={{ color: 'var(--gold)' }}>fetching</span>
            </div>
            <div>
              <span style={{ color: 'var(--fail-red)' }}>✗</span>{' '}
              <span style={{ color: 'var(--text-secondary)' }}>email-bot</span>{' '}
              <span style={{ color: 'var(--fail-red)' }}>error</span>
            </div>
          </div>
        </div>

        {/* Window 3: fail-log */}
        <div
          className="fw fw-3"
          style={{ bottom: '22%', right: '10%', width: 210 }}
        >
          <div className="fw-head">
            <span className="d r" />
            <span className="d y" />
            <span className="d g" />
            <span className="t">fail-log</span>
          </div>
          <div className="fw-body">
            <div
              style={{
                textDecoration: 'line-through',
                color: 'var(--text-dim)',
              }}
            >
              cors i prod
            </div>
            <div style={{ color: 'var(--success)' }}>→ proxy rule fixar det</div>
            <div
              style={{
                textDecoration: 'line-through',
                color: 'var(--text-dim)',
              }}
            >
              rate limit 429
            </div>
            <div style={{ color: 'var(--success)' }}>→ exponential backoff</div>
          </div>
        </div>

        {/* Window 4: Discord — bygg som går snett */}
        <div
          className="fw fw-4 fw-discord"
          style={{ bottom: '14%', right: '6%', width: 260 }}
        >
          <div className="fw-head fw-discord-head">
            <span className="d r" />
            <span className="d y" />
            <span className="d g" />
            <span className="fw-discord-channel">bygg-skiten</span>
          </div>
          <div className="fw-body fw-discord-body">
            {DISCORD_FAIL_CHAT.map((m) => (
              <div key={`${m.user}-${m.time}`} className="dc-msg">
                <div className="dc-meta">
                  <span className={`dc-user ${m.userClass}`}>{m.user}</span>
                  <span className="dc-time">{m.time}</span>
                </div>
                <p className="dc-text">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="hero-content">
        <h1 className="hero-h1">
          Bygg AI-agenter.
          <br />
          Tillsammans.
        </h1>

        <div className="hero-sub-line">
          <span className="strike">Misslyckas.</span>{' '}
          <span className="fix">Lär dig.</span>
        </div>

        <p className="hero-sub">
          opensverige är Sveriges öppna community för AI-agenter och
          vibecoding. Kod, fika och folk som bygger på riktigt.
        </p>

        <div className="hero-ctas">
          <a
            href="https://discord.gg/CSphbTk8En"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-btn primary"
          >
            Gå med i Discord <span className="aw">→</span>
          </a>
          <Link href="/showcase" className="hero-btn secondary">
            Se vad vi byggt <span className="aw aw-down">↓</span>
          </Link>
        </div>
      </div>

      {/* Stat bar */}
      <StatBar discord={discord} />

      {/* Scroll hint */}
      <div className="scroll-hint" aria-hidden="true">
        <span className="arrow">↓</span>
        <span className="label">scroll</span>
      </div>
    </section>
  )
}
