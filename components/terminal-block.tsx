interface TerminalBlockProps {
  title?: string
  children: React.ReactNode
}

export function TerminalBlock({ title = 'terminal', children }: TerminalBlockProps) {
  return (
    <div className="fw">
      <div className="fw-head">
        <span className="d r" />
        <span className="d y" />
        <span className="d g" />
        <span className="t">{title}</span>
      </div>
      <div className="fw-body">{children}</div>
    </div>
  )
}
