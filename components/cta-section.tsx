interface CtaSectionProps {
  heading: React.ReactNode
  body?: string
  children: React.ReactNode
}

export function CtaSection({ heading, body, children }: CtaSectionProps) {
  return (
    <div className="cta-section">
      <h3 className="cta-h3">{heading}</h3>
      {body && <p className="cta-body">{body}</p>}
      <div className="cta-btns">{children}</div>
    </div>
  )
}
