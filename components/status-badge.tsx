type Status = 'live' | 'wip' | 'oss'

interface StatusBadgeProps {
  status: Status
}

const LABELS: Record<Status, string> = {
  live: 'live',
  wip: 'wip',
  oss: 'open source',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`badge ${status}`}>
      {(status === 'live' || status === 'wip') && (
        <span className="bd" aria-hidden="true" />
      )}
      {LABELS[status]}
    </span>
  )
}
