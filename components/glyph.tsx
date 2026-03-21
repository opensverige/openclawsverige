export type GlyphVariant =
  | 'braille'
  | 'dots'
  | 'moon'
  | 'quarter'
  | 'triangle'
  | 'arrow'
  | 'blocks'
  | 'classic'
  | 'hex'
  | 'binary'
  | 'timeline-fika'
  | 'timeline-build'
  | 'timeline-pause'
  | 'timeline-type'
  | 'timeline-demo'

interface GlyphProps {
  variant: GlyphVariant
  className?: string
  style?: React.CSSProperties
}

export function Glyph({ variant, className, style }: GlyphProps) {
  return (
    <span
      className={['g', `g-${variant}`, className].filter(Boolean).join(' ')}
      style={style}
      aria-hidden="true"
    />
  )
}
