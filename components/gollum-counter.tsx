'use client'

import { useEffect, useState } from 'react'

export function GollumCounter() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/gollum-count')
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => {})
  }, [])

  if (count === null) return null

  return (
    <a href="/gollum" className="footer-gollum">
      <span className="footer-gollum-label">GOLLUM-TESTET</span>
      <span className="footer-gollum-count">{count}</span>
      <span className="footer-gollum-sub">genomförda</span>
    </a>
  )
}
