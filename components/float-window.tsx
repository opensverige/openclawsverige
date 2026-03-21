interface FloatWindowProps {
  position: 1 | 2 | 3 | 4
  title: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export function FloatWindow({ position, title, style, children }: FloatWindowProps) {
  return (
    <div className={`fw fw-${position}`} style={style}>
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
