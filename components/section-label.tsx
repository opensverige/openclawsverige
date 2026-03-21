interface SectionLabelProps {
  num: string
  text: string
}

export function SectionLabel({ num, text }: SectionLabelProps) {
  return (
    <div className="section-label">
      <span className="n">{num}</span>
      {' — '}
      {text}
    </div>
  )
}
