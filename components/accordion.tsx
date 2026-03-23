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
          <button
            type="button"
            className="acc-head"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            aria-controls={`acc-body-${i}`}
          >
            <span className="acc-arrow">▸</span>
            {item.q}
          </button>
          {open === i && <div id={`acc-body-${i}`} className="acc-body">{item.a}</div>}
        </div>
      ))}
    </div>
  )
}
