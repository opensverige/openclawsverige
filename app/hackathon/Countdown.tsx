'use client'

import { useEffect, useState } from 'react'
import styles from './hackathon.module.css'

interface CountdownProps {
  deadlineISO: string
}

type TimeLeft = { days: number; hours: number; mins: number; secs: number }

function computeTimeLeft(deadline: number): TimeLeft | null {
  const diff = deadline - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    mins: Math.floor((diff / 60_000) % 60),
    secs: Math.floor((diff / 1_000) % 60),
  }
}

const UNITS: Array<{ key: keyof TimeLeft; label: string }> = [
  { key: 'days', label: 'dgr' },
  { key: 'hours', label: 'tim' },
  { key: 'mins', label: 'min' },
  { key: 'secs', label: 'sek' },
]

export function Countdown({ deadlineISO }: CountdownProps) {
  // null tills komponenten mountat — undviker hydration-mismatch (servern och
  // klienten har olika "nu").
  const [time, setTime] = useState<TimeLeft | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const deadline = new Date(deadlineISO).getTime()
    setMounted(true)
    setTime(computeTimeLeft(deadline))
    const id = setInterval(() => setTime(computeTimeLeft(deadline)), 1000)
    return () => clearInterval(id)
  }, [deadlineISO])

  if (mounted && time === null) {
    return (
      <div className={styles.countdown} role="timer" aria-label="Inlämning stängd">
        <span className={styles.countdownClosed}>INLÄMNING STÄNGD</span>
      </div>
    )
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className={styles.countdown} role="timer" aria-label="Tid kvar till inlämning">
      {UNITS.map(({ key, label }) => (
        <div key={key} className={styles.countdownUnit}>
          <span className={styles.countdownNum}>{time ? pad(time[key]) : '––'}</span>
          <span className={styles.countdownLabel}>{label}</span>
        </div>
      ))}
    </div>
  )
}
