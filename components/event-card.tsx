interface EventCardProps {
  city: string
  date: string
  venue?: string
}

export function EventCard({ city, date, venue }: EventCardProps) {
  return (
    <div className="card" style={{ maxWidth: 320 }}>
      <div className="card-glyph" style={{ color: 'var(--crayfish-light)' }}>
        ▸
      </div>
      <div className="card-title">{city}</div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-dim)',
          marginBottom: 8,
        }}
      >
        {date}
      </div>
      {venue && <div className="card-body">{venue}</div>}
      <a
        href="https://discord.gg/CSphbTk8En"
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-sm btn-secondary"
        style={{ marginTop: 16 }}
      >
        Anmäl dig i Discord <span className="aw">→</span>
      </a>
    </div>
  )
}
