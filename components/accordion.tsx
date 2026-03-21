'use client'

import { useState } from 'react'

interface AccordionItem {
  q: string
  a: string
}

interface AccordionProps {
  items: AccordionItem[]
}

export function Accordion({ items }: AccordionProps) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="accordion">
      {items.map((item, i) => (
        <div key={i} className={`acc-item${open === i ? ' open' : ''}`}>
          <div
            className="acc-head"
            onClick={() => setOpen(open === i ? null : i)}
            role="button"
            tabIndex={0}
            aria-expanded={open === i}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setOpen(open === i ? null : i)
              }
            }}
          >
            <span className="acc-arrow">▸</span>
            {item.q}
          </div>
          {open === i && <div className="acc-body">{item.a}</div>}
        </div>
      ))}
    </div>
  )
}
