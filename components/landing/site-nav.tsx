"use client";

import Link from "next/link";
import { useState, useCallback, useEffect } from "react";

const DISCORD_URL = "https://discord.gg/CSphbTk8En";

const MENU_LINKS = [
  { href: "/radar", label: "Agent Radar" },
  { href: "/blogg", label: "Blogg" },
  { href: "/manifest", label: "Manifestet" },
];

export function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <nav className="site-nav">
        <Link href="/" className="site-nav-logo" onClick={closeMenu}>
          open<span>sverige</span>
        </Link>
        <div className="site-nav-right">
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary site-nav-discord-btn"
          >
            Discord →
          </a>
          <button
            type="button"
            className="site-nav-hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Stäng meny" : "Öppna meny"}
          >
            <span className="site-nav-hamburger-bar" />
            <span className="site-nav-hamburger-bar" />
            <span className="site-nav-hamburger-bar" />
          </button>
        </div>
      </nav>

      <div
        className={`site-nav-overlay ${menuOpen ? "site-nav-overlay--open" : ""}`}
        aria-hidden={!menuOpen}
        onClick={closeMenu}
      />
      <div
        className={`site-nav-drawer ${menuOpen ? "site-nav-drawer--open" : ""}`}
        role="dialog"
        aria-label="Meny"
      >
        <div className="site-nav-drawer-inner">
          <button
            type="button"
            className="site-nav-drawer-close"
            onClick={closeMenu}
            aria-label="Stäng meny"
          >
            ×
          </button>
          <ul className="site-nav-drawer-list">
            {MENU_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="site-nav-drawer-link"
                  onClick={closeMenu}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
