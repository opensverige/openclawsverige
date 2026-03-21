import type { DiscordData } from '@/lib/discord'

interface StatBarProps {
  discord: DiscordData | null
}

export function StatBar({ discord }: StatBarProps) {
  return (
    <div className="hero-stats">
      <div className="stat">
        <span className="stat-val live">{discord ? discord.online : '—'}</span>
        <span className="stat-label">online</span>
      </div>
      <span className="stat-sep">·</span>
      <div className="stat">
        <span className="stat-val">{discord ? discord.channels : '—'}</span>
        <span className="stat-label">voice-kanaler</span>
      </div>
      <span className="stat-sep">·</span>
      <div className="stat">
        <span className="stat-label">meetups varje söndag</span>
      </div>
    </div>
  )
}
