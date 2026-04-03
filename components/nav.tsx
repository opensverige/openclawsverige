'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useLayoutEffect, useState } from 'react'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)
  const menuId = useId()
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useLayoutEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const sync = () => setIsNarrow(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)
  const panelInert = isNarrow && !menuOpen

  return (
    <>
      {menuOpen && isNarrow ? (
        <button
          type="button"
          className="nav-backdrop"
          aria-label="Stäng meny"
          onClick={closeMenu}
        />
      ) : null}
      <nav
        className={`nav${scrolled ? ' scrolled' : ''}${menuOpen ? ' nav-open' : ''}`}
        aria-label="Primär"
      >
        <div className="nav-top">
          <Link href="/" className="nav-logo" onClick={closeMenu}>
            opensverige
          </Link>
          <button
            type="button"
            className={`nav-burger${menuOpen ? ' nav-burger--open' : ''}`}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? 'Stäng meny' : 'Öppna meny'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="nav-burger-lines" aria-hidden>
              <span className="nav-burger-line" />
              <span className="nav-burger-line" />
              <span className="nav-burger-line" />
            </span>
          </button>
        </div>
        <div
          id={menuId}
          className="nav-links"
          inert={panelInert ? true : undefined}
        >
          <Link href="/blogg" className="nav-link" onClick={closeMenu}>
            Blogg <span className="aw">→</span>
          </Link>
          <Link href="/showcase" className="nav-link" onClick={closeMenu}>
            Showcase <span className="aw">→</span>
          </Link>
          <Link href="/varfor" className="nav-link" onClick={closeMenu}>
            Varför <span className="aw">→</span>
          </Link>
          <a
            href="https://discord.gg/CSphbTk8En"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-cta"
            onClick={closeMenu}
          >
            Discord <span className="aw">→</span>
          </a>
        </div>
      </nav>
    </>
  )
}
