'use client'

interface TagProps {
  label: string
  active?: boolean
  onClick?: () => void
}

export function Tag({ label, active = false, onClick }: TagProps) {
  return (
    <button
      className={`tag${active ? ' on' : ''}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}
