# Design: agent.opensverige.se — AI Readiness Scanner Landing Page
**Date:** 2026-03-30
**Status:** Approved
**Scope:** `/scan` route in existing Next.js project (opensverige.se)

---

## Overview

A full landing page at `/scan` that validates interest for Sweden's first AI-readiness scanner. One primary flow: user enters a URL → gets a scan result → shares or joins Discord. Three beats: scanner, integration voting, Discord CTA.

---

## Architecture

**Approach:** Server-rendered `page.tsx` + separate client components per beat (Next.js app router pattern).

### Files changed / created

**New:**
```
app/scan/_components/ScannerSection.tsx   # Beat 1: scanner flow
app/scan/_components/IntegrationVote.tsx  # Beat 2: voting
app/scan/_components/CTA.tsx              # Beat 3: Discord CTA
app/scan/_components/PixelBlock.tsx       # Shared canvas animation (from marketplace-landing.jsx)
app/api/scan/route.ts                     # Unified scan endpoint
lib/claude.ts                             # Claude API + demo fallback
supabase/migrations/002_scans.sql         # scans + integration_votes tables
```

**Updated:**
```
app/scan/page.tsx                         # Renders all 3 beats
app/scan/_components/Scanner.tsx          # Kept for reference, superseded by ScannerSection
```

---

## Beat 1: ScannerSection

### State machine
```
idle → scanning → result_summary → result_full
```

**idle**
- Nav (sticky): `agent.opensverige` logo left, Discord button right
- Hero: "Hur agent-redo är ditt företag?" (Instrument Serif)
- Subtext: "Vi scannar din sajt och visar vad AI-agenter ser. Gratis. Öppet."
- URL input (`https://` prefix, JetBrains Mono) + "Scanna →" button (red)
- Demo chips: fortnox.se, visma.net, bokio.se, spotify.com

**scanning**
- "Kollar {domain}..." label
- 3 animated steps (tick every 750ms):
  1. Tillgänglighet för agenter
  2. GDPR & dataskydd
  3. EU AI Act-beredskap
- Progress bar (animates to ~88%, completes when API responds)
- API call fires at scan start, runs in parallel with animation

**result_summary** (progressive disclosure — step 1)
- Badge: colored dot + label (REDO / DELVIS REDO / INTE REDO)
- One-sentence summary from Claude
- DEMO banner if no API key
- Button: "Visa detaljer ↓"

**result_full** (progressive disclosure — step 2, expands inline)
- "VAD VI HITTADE" — ✓/✗ list (3–5 findings)
- "NÄSTA STEG" — → list (2–4 recommendations)
- CTA row: "Dela resultat →" (Web Share / clipboard) | "Gå med i Discord →" (red)
- "← Scanna en till" reset button
- Legal disclaimer (small text)

---

## Beat 2: IntegrationVote

- 7 systems, all starting at 0 votes
- Votes stored in localStorage (Supabase table scaffolded for future)
- Each row: ▲ + count | Name + description | background bar (relative width %)
- Click toggles vote, row sorts dynamically by vote count
- Voted state: red ▲, red border on row
- Header: "VILKA SYSTEM BEHÖVER AGENTER?" + "Rösta. Builders bygger det som efterfrågas mest."

Systems: Fortnox, Visma, BankID, Skatteverket, Bolagsverket, Swish, Bankgirot

---

## Beat 3: CTA

- PixelBlock animation (reused from marketplace-landing.jsx)
- "250+ builders bygger redan. Häng med."
- "Öppen källkod. Stockholm, Göteborg, Malmö."
- Primary button: "Gå med i Discord →" (red)
- Text link: "Dela med någon som behöver det här" (Web Share / clipboard)

---

## API: `POST /api/scan`

**Input:** `{ domain: string }`

**Server-side flow:**
1. Validate and sanitize domain
2. Run 3 parallel live checks with 5s timeout each:
   - `robots.txt` — exists + allows AI bots (GPTBot, ClaudeBot, Anthropic-AI)
   - `sitemap.xml` — exists (HTTP 200)
   - `llms.txt` — exists (HTTP 200)
3. Send domain + check results to Claude Sonnet (`claude-sonnet-4-6`)
4. Parse Claude JSON response
5. Fire-and-forget save to Supabase `scans` table
6. Return result

**Claude system prompt:** Receives domain name + 3 technical check results. Returns JSON: `{ company, industry, status, summary, findings[], next_steps[] }`. Status: `REDO | DELVIS_REDO | INTE_REDO`. 3–5 findings, 2–4 next steps. Swedish, GDPR/EU AI Act aware.

**Demo fallback:** If `ANTHROPIC_API_KEY` not set, deterministic result based on live check results with DEMO banner.

**Output:** `{ company, industry, status, summary, findings, next_steps, isDemo }`

**No rate limiting in this version** (Supabase table not yet deployed).

---

## Data

### `scans` table (new)
```sql
id, domain, status, industry, findings (JSONB), next_steps (JSONB),
technical_checks (JSONB), is_demo, scanned_at
```

### `integration_votes` table (new, for future)
```sql
id, system_name, session_id, created_at
```

---

## Design tokens (light theme)

| Token | Value |
|-------|-------|
| Background | `#F8F7F4` |
| Text | `#111` |
| Accent (red) | `#c4391a` |
| Gold | `#c9a55a` |
| Border primary | `2px solid #111` |
| Border secondary | `1.5px solid #EDECE8` |
| Card radius | `10–12px` |
| Font display | Instrument Serif |
| Font body | Libre Franklin |
| Font mono | JetBrains Mono |

---

## Out of scope

- Email opt-in / notifications
- User login / dashboard
- Permalink per scan result
- Real-time vote counts from Supabase (localStorage for now)
- Deep scan (API docs, compliance PDF)
- Any other page than `/scan`
