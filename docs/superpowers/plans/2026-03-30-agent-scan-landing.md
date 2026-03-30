# Agent Scan Landing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/scan` with a full landing page — scanner + integration voting + Discord CTA — backed by a single `/api/scan` endpoint that runs live checks and calls Claude Sonnet.

**Architecture:** `page.tsx` (server) renders Nav + ScannerSection + IntegrationVote + CTA. Each section is a separate client component. `/api/scan` (POST) runs robots/sitemap/llms checks server-side then calls Claude. Falls back to demo mode if no API key.

**Tech Stack:** Next.js 15 app router, TypeScript strict, Tailwind (inline styles for scan page), Anthropic claude-sonnet-4-6, Supabase REST API (fire-and-forget)

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `lib/claude.ts` | Create | Types + Claude API call + demo fallback |
| `app/api/scan/route.ts` | Create | Unified scan endpoint (replaces probe+analyze) |
| `app/scan/_components/PixelBlock.tsx` | Create | Canvas animations (PixelBlock + PixelDot) |
| `app/scan/_components/Nav.tsx` | Create | Sticky nav bar |
| `app/scan/_components/ScannerSection.tsx` | Create | Beat 1: hero + scanner state machine |
| `app/scan/_components/IntegrationVote.tsx` | Create | Beat 2: voting with localStorage |
| `app/scan/_components/CTA.tsx` | Create | Beat 3: Discord CTA |
| `app/scan/page.tsx` | Replace | Server component rendering all sections |
| `app/scan/_components/Scanner.tsx` | Delete | Superseded by ScannerSection |
| `supabase/migrations/002_scans.sql` | Create | scans + integration_votes tables |

---

## Task 1: `lib/claude.ts` — Types + Claude integration

**Files:**
- Create: `lib/claude.ts`

- [ ] **Step 1: Create the file**

```typescript
// lib/claude.ts

export type ScanStatus = "REDO" | "DELVIS_REDO" | "INTE_REDO";

export interface Finding {
  check: string;
  pass: boolean;
}

export interface ScanAnalysis {
  company: string;
  industry: string;
  status: ScanStatus;
  summary: string;
  findings: Finding[];
  next_steps: string[];
}

export interface LiveChecks {
  robots: boolean;
  sitemap: boolean;
  llms: boolean;
}

const SYSTEM_PROMPT = `Du är en AI-readiness analytiker för svenska företag. Du får tekniska scan-resultat för en sajt och ska generera en rapport.

Svara BARA med valid JSON, ingen markdown, inga backticks. Svara på svenska med korrekta äöå.

Format:
{
  "company": "företagsnamn baserat på domän",
  "industry": "kort branschbeskrivning (max 4 ord)",
  "status": "REDO|DELVIS_REDO|INTE_REDO",
  "summary": "En mening som sammanfattar statusen för detta specifika företag",
  "findings": [
    {"check": "beskrivning av vad som hittades", "pass": true}
  ],
  "next_steps": [
    "konkret åtgärd"
  ]
}

Basera din bedömning på de tekniska check-resultaten. Var ärlig men konstruktiv.

Bedöm:
- Kan AI-agenter crawla sajten? (robots.txt tillåter GPTBot, ClaudeBot, Anthropic-AI)
- Finns en sitemap som agenter kan följa?
- Finns llms.txt med specifika AI-instruktioner?
- Följer sajten GDPR Art. 22 om automatiserat beslutsfattande?
- Är sajten förberedd för EU AI Act (ikraft aug 2026)?
- Blockerar cookie-walls agenter?
- Bör AI-genererat innehåll märkas enligt EU AI Act Art. 50?

Ge 3-5 findings och 2-4 nästa steg. Anpassa analystexten till den gissade branschen.`;

export async function analyzeWithClaude(
  domain: string,
  checks: LiveChecks,
  apiKey: string
): Promise<ScanAnalysis | null> {
  const checksText = [
    `robots.txt: ${checks.robots ? "finns och tillåter AI-agenter" : "saknas eller blockerar AI-agenter"}`,
    `sitemap.xml: ${checks.sitemap ? "finns" : "saknas"}`,
    `llms.txt: ${checks.llms ? "finns" : "saknas"}`,
  ].join("\n");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 800,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Analysera domän: ${domain}\n\nTekniska check-resultat:\n${checksText}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const text: string = data.content?.[0]?.text ?? "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned) as ScanAnalysis;
  } catch {
    return null;
  }
}

export function buildDemoAnalysis(domain: string, checks: LiveChecks): ScanAnalysis {
  const passCount = [checks.robots, checks.sitemap, checks.llms].filter(Boolean).length;
  const status: ScanStatus = passCount >= 2 ? "DELVIS_REDO" : "INTE_REDO";

  const slug = domain.split(".")[0];
  const company = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");

  const findings: Finding[] = [
    {
      check: checks.robots
        ? "Sajten tillåter AI-agenter att läsa den"
        : "Sajten blockerar eller saknar instruktioner för AI-agenter",
      pass: checks.robots,
    },
    {
      check: checks.sitemap
        ? "Sajten har en sitemap som agenter kan följa"
        : "Ingen sitemap hittad — agenter kan inte navigera sajten",
      pass: checks.sitemap,
    },
    {
      check: checks.llms
        ? "Sajten har specifika instruktioner för AI (llms.txt)"
        : "Saknar llms.txt — agenter vet inte hur de ska interagera",
      pass: checks.llms,
    },
    {
      check: "Integritetspolicyn saknar info om automatiserad behandling (GDPR Art. 22)",
      pass: false,
    },
    {
      check: "AI-genererat innehåll är inte märkt enligt EU AI Act Art. 50",
      pass: false,
    },
  ];

  const next_steps: string[] = [
    "Uppdatera din integritetspolicy med info om automatiserad behandling enligt GDPR Art. 22.",
    "Förbered för EU AI Act — märk AI-genererat innehåll på din sajt.",
    ...(!checks.llms
      ? ["Lägg till en /llms.txt-fil som berättar för AI-agenter vad din sajt erbjuder."]
      : []),
    ...(!checks.robots
      ? ["Se till att din robots.txt tillåter AI-agenter som GPTBot och ClaudeBot."]
      : []),
    ...(!checks.sitemap
      ? ["Lägg till en sitemap.xml så att agenter kan navigera din sajt."]
      : []),
  ].slice(0, 4);

  return {
    company,
    industry: "Okänd bransch",
    status,
    summary:
      status === "INTE_REDO"
        ? `${company} saknar de tekniska grunderna för att AI-agenter ska kunna interagera korrekt.`
        : `${company} har grunderna på plats men saknar viktiga compliance-anpassningar för AI-agenter.`,
    findings,
    next_steps,
  };
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/baltsar/Documents/Cursor/OPENSVERIGE/OpenSverige.se && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/claude.ts
git commit -m "feat(scan): add Claude types and analysis functions"
```

---

## Task 2: `app/api/scan/route.ts` — Unified endpoint

**Files:**
- Create: `app/api/scan/route.ts`

- [ ] **Step 1: Create the file**

```typescript
// app/api/scan/route.ts
import { NextRequest } from "next/server";
import {
  analyzeWithClaude,
  buildDemoAnalysis,
  type LiveChecks,
  type ScanAnalysis,
} from "@/lib/claude";

const AI_AGENTS = [
  "gptbot",
  "claudebot",
  "anthropic-ai",
  "ccbot",
  "google-extended",
  "omgilibot",
];

async function fetchSafe(
  url: string
): Promise<{ status: number; body: string } | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "OpenSverige-Scanner/1.0 (https://opensverige.se/scan)",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(5_000),
    });
    const body = await res.text().then((t) => t.slice(0, 10_000));
    return { status: res.status, body };
  } catch {
    return null;
  }
}

function parseRobots(body: string): boolean {
  const lines = body.toLowerCase().split("\n");
  let currentUAs: string[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("user-agent:")) {
      currentUAs = [line.replace("user-agent:", "").trim()];
    } else if (line.startsWith("disallow:")) {
      const path = line.replace("disallow:", "").trim();
      if (
        path === "/" &&
        currentUAs.some((ua) => AI_AGENTS.includes(ua) || ua === "*")
      ) {
        return false;
      }
    }
  }
  return true;
}

async function runLiveChecks(domain: string): Promise<LiveChecks> {
  const base = `https://${domain}`;
  const [robotsRes, sitemapRes, llmsRes] = await Promise.all([
    fetchSafe(`${base}/robots.txt`),
    fetchSafe(`${base}/sitemap.xml`),
    fetchSafe(`${base}/llms.txt`),
  ]);

  return {
    robots:
      robotsRes?.status === 200 ? parseRobots(robotsRes.body) : false,
    sitemap: sitemapRes?.status === 200,
    llms: llmsRes?.status === 200,
  };
}

async function saveToSupabase(
  domain: string,
  analysis: ScanAnalysis,
  checks: LiveChecks,
  isDemo: boolean
): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;

  try {
    await fetch(`${url}/rest/v1/scans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        domain,
        status: analysis.status,
        industry: analysis.industry,
        findings: analysis.findings,
        next_steps: analysis.next_steps,
        technical_checks: checks,
        is_demo: isDemo,
      }),
      signal: AbortSignal.timeout(3_000),
    });
  } catch {
    // Silent — table may not exist yet
  }
}

export async function POST(req: NextRequest) {
  let rawDomain: string;
  try {
    const body = await req.json();
    rawDomain = String(body.domain ?? "")
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .toLowerCase();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (
    !rawDomain ||
    !/^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/.test(rawDomain)
  ) {
    return Response.json({ error: "Ogiltig domän" }, { status: 400 });
  }

  const checks = await runLiveChecks(rawDomain);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  let analysis = apiKey
    ? await analyzeWithClaude(rawDomain, checks, apiKey)
    : null;
  const isDemo = !analysis;
  if (!analysis) analysis = buildDemoAnalysis(rawDomain, checks);

  // Fire-and-forget — do not await
  saveToSupabase(rawDomain, analysis, checks, isDemo);

  return Response.json({ ...analysis, isDemo, checks });
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Smoke-test the endpoint**

Start dev server in another terminal: `npm run dev`

```bash
curl -s -X POST http://localhost:3005/api/scan \
  -H "Content-Type: application/json" \
  -d '{"domain":"fortnox.se"}' | python3 -m json.tool
```

Expected: JSON with `status`, `summary`, `findings`, `next_steps`, `isDemo: true` (no API key yet).

- [ ] **Step 4: Test invalid domain rejection**

```bash
curl -s -X POST http://localhost:3005/api/scan \
  -H "Content-Type: application/json" \
  -d '{"domain":"not-a-domain"}' | python3 -m json.tool
```

Expected: `{"error": "Ogiltig domän"}` with HTTP 400.

- [ ] **Step 5: Commit**

```bash
git add app/api/scan/route.ts
git commit -m "feat(scan): add unified /api/scan endpoint with live checks"
```

---

## Task 3: `app/scan/_components/PixelBlock.tsx` — Canvas animations

**Files:**
- Create: `app/scan/_components/PixelBlock.tsx`

PixelBlock and PixelDot are ported directly from `marketplace-landing.jsx` lines 13–37, converted to TypeScript.

- [ ] **Step 1: Create the file**

```typescript
// app/scan/_components/PixelBlock.tsx
"use client";

import { useEffect, useRef } from "react";

export function PixelBlock({ size = 48 }: { size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const g = 8;
    const px = size / g;
    const cols = [
      "#c4391a", "#d4543a", "#e87460", "#c9a55a",
      "#222", "#ddd", "#F8F7F4", "#b02a0e",
    ];
    const cells: string[] = [];
    for (let i = 0; i < g * g; i++)
      cells.push(cols[Math.floor(Math.random() * cols.length)]);

    let f: number;
    function draw() {
      for (let j = 0; j < cells.length; j++) {
        if (Math.random() < 0.012)
          cells[j] = cols[Math.floor(Math.random() * cols.length)];
        ctx.fillStyle = cells[j];
        ctx.fillRect((j % g) * px, Math.floor(j / g) * px, px, px);
      }
      f = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(f);
  }, [size]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      style={{ imageRendering: "pixelated", borderRadius: 4, display: "block" }}
    />
  );
}

export function PixelDot({ size = 18 }: { size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const g = 4;
    const px = size / g;
    const cols = ["#c4391a", "#d4543a", "#c9a55a", "#222"];

    for (let i = 0; i < g * g; i++) {
      ctx.fillStyle = cols[Math.floor(Math.random() * cols.length)];
      ctx.fillRect((i % g) * px, Math.floor(i / g) * px, px, px);
    }

    let f: number;
    function tick() {
      for (let j = 0; j < g * g; j++) {
        if (Math.random() < 0.02) {
          ctx.fillStyle = cols[Math.floor(Math.random() * cols.length)];
          ctx.fillRect((j % g) * px, Math.floor(j / g) * px, px, px);
        }
      }
      f = requestAnimationFrame(tick);
    }
    tick();
    return () => cancelAnimationFrame(f);
  }, [size]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      style={{ imageRendering: "pixelated", borderRadius: 2, display: "block" }}
    />
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/scan/_components/PixelBlock.tsx
git commit -m "feat(scan): add PixelBlock and PixelDot canvas components"
```

---

## Task 4: `app/scan/_components/Nav.tsx` — Sticky navigation

**Files:**
- Create: `app/scan/_components/Nav.tsx`

- [ ] **Step 1: Create the file**

```typescript
// app/scan/_components/Nav.tsx
"use client";

import { PixelDot } from "./PixelBlock";

export default function Nav() {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
        borderBottom: "1.5px solid #EDECE8",
        position: "sticky",
        top: 0,
        background: "rgba(248,247,244,0.92)",
        backdropFilter: "blur(20px)",
        zIndex: 100,
        fontFamily: "'Libre Franklin', sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <PixelDot size={18} />
        <span
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 17,
            letterSpacing: -0.5,
            color: "#111",
          }}
        >
          agent<span style={{ color: "#c4391a" }}>.opensverige</span>
        </span>
      </div>
      <a
        href="https://discord.gg/CSphbTk8En"
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#fff",
          background: "#111",
          padding: "7px 16px",
          borderRadius: 7,
          textDecoration: "none",
        }}
      >
        250+ builders →
      </a>
    </nav>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/scan/_components/Nav.tsx
git commit -m "feat(scan): add sticky Nav component"
```

---

## Task 5: `app/scan/_components/ScannerSection.tsx` — Beat 1

**Files:**
- Create: `app/scan/_components/ScannerSection.tsx`

This is the core scanner UI. State machine: `idle → scanning → result_summary → result_full`.

- [ ] **Step 1: Create the file**

```typescript
// app/scan/_components/ScannerSection.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import type { ScanAnalysis, ScanStatus, LiveChecks } from "@/lib/claude";

type ScanState = "idle" | "scanning" | "result_summary" | "result_full";

interface ScanResponse extends ScanAnalysis {
  isDemo: boolean;
  checks: LiveChecks;
}

const SCAN_STEPS = [
  "Tillgänglighet för agenter",
  "GDPR & dataskydd",
  "EU AI Act-beredskap",
];

const DEMO_CHIPS = ["fortnox.se", "visma.net", "bokio.se", "spotify.com"];

const BADGE: Record<
  ScanStatus,
  { label: string; dot: string; bg: string; border: string; text: string }
> = {
  REDO: {
    label: "REDO",
    dot: "#4ade80",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    text: "#166534",
  },
  DELVIS_REDO: {
    label: "DELVIS REDO",
    dot: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
    text: "#92400e",
  },
  INTE_REDO: {
    label: "INTE REDO",
    dot: "#ef4444",
    bg: "#fef2f2",
    border: "#fecaca",
    text: "#991b1b",
  },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Libre+Franklin:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::selection { background: #c4391a22; }
  @keyframes ss-spin { to { transform: rotate(360deg); } }
  @keyframes ss-fadeup {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

function cleanDomain(input: string): string {
  return input
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
}

function isValidDomain(d: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/.test(d);
}

export default function ScannerSection() {
  const [state, setState] = useState<ScanState>("idle");
  const [url, setUrl] = useState("");
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [scanStep, setScanStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [shared, setShared] = useState(false);
  const rafRef = useRef<number>(0);

  const startProgressAnim = useCallback((ms: number) => {
    const start = Date.now();
    const tick = () => {
      const p = Math.min(88, ((Date.now() - start) / ms) * 88);
      setProgress(p);
      if (Date.now() - start < ms) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  async function runScan(rawInput: string) {
    const d = cleanDomain(rawInput);
    if (!isValidDomain(d)) return;

    setDomain(d);
    setState("scanning");
    setScanStep(0);
    setProgress(0);
    setResult(null);
    setShared(false);

    const timers = [
      setTimeout(() => setScanStep(1), 750),
      setTimeout(() => setScanStep(2), 1500),
    ];
    const stopAnim = startProgressAnim(2500);
    const start = Date.now();

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: d }),
      });

      // Ensure minimum 2.8s scanning feel
      const elapsed = Date.now() - start;
      if (elapsed < 2800)
        await new Promise((r) => setTimeout(r, 2800 - elapsed));

      stopAnim();
      timers.forEach(clearTimeout);

      if (res.ok) {
        const data: ScanResponse = await res.json();
        setProgress(100);
        setTimeout(() => {
          setResult(data);
          setState("result_summary");
        }, 200);
      } else {
        setState("idle");
      }
    } catch {
      timers.forEach(clearTimeout);
      stopAnim();
      setState("idle");
    }
  }

  function handleShare() {
    if (!result) return;
    const text = `Är ${domain} redo för AI-agenter? Mitt resultat: ${
      BADGE[result.status].label
    }.\n\nTesta din sajt → opensverige.se/scan\n\n#opensverige #aiagenter`;
    if (navigator.share) {
      navigator.share({
        title: `${domain} — AI-beredskap`,
        text,
        url: "https://opensverige.se/scan",
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setShared(true);
    }
  }

  function handleReset() {
    setState("idle");
    setUrl("");
    setResult(null);
    setDomain("");
    setShared(false);
  }

  const inputDomain = cleanDomain(url);
  const canSubmit = isValidDomain(inputDomain);

  // ── IDLE ─────────────────────────────────────────────────────
  if (state === "idle") {
    return (
      <div
        style={{
          color: "#111",
          fontFamily: "'Libre Franklin', sans-serif",
        }}
      >
        <style>{CSS}</style>
        <div
          style={{
            padding: "56px 24px 64px",
            maxWidth: 580,
            margin: "0 auto",
            animation: "ss-fadeup 0.5s ease both",
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 700,
              color: "#c4391a",
              letterSpacing: 3,
              marginBottom: 16,
            }}
          >
            AGENT READINESS SCANNER
          </div>

          <h1
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(32px,7vw,52px)",
              fontWeight: 400,
              lineHeight: 1.08,
              letterSpacing: -1.5,
              marginBottom: 14,
            }}
          >
            Hur agent-redo
            <br />
            är ditt företag?
          </h1>

          <p
            style={{
              fontSize: 16,
              color: "#888",
              lineHeight: 1.6,
              maxWidth: 420,
              marginBottom: 28,
            }}
          >
            Vi scannar din sajt och visar vad AI-agenter ser. Gratis. Öppet.
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flex: 1,
                background: "#fff",
                border: "2px solid #ddd",
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: "#ccc",
                  flexShrink: 0,
                }}
              >
                https://
              </span>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && canSubmit && runScan(url)
                }
                placeholder="dittforetag.se"
                style={{
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "#111",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 15,
                  flex: 1,
                  caretColor: "#c4391a",
                  fontWeight: 500,
                }}
              />
            </div>
            <button
              onClick={() => runScan(url)}
              disabled={!canSubmit}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
                background: canSubmit ? "#c4391a" : "#ccc",
                padding: "12px 22px",
                borderRadius: 10,
                border: "none",
                cursor: canSubmit ? "pointer" : "default",
                whiteSpace: "nowrap",
                transition: "background 0.2s",
              }}
            >
              Scanna →
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 36,
              marginTop: 8,
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: "#ccc",
                alignSelf: "center",
              }}
            >
              Prova:
            </span>
            {DEMO_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => runScan(chip)}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: "#888",
                  background: "#fff",
                  border: "1.5px solid #EDECE8",
                  borderRadius: 6,
                  padding: "5px 10px",
                  cursor: "pointer",
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          <p
            style={{
              fontSize: 14,
              color: "#aaa",
              lineHeight: 1.65,
              maxWidth: 460,
            }}
          >
            AI-agenter börjar interagera med företagssajter. GDPR, EU AI Act
            och svenska lagar ställer krav på hur. Vi kollar om du är redo.
          </p>
        </div>
      </div>
    );
  }

  // ── SCANNING ──────────────────────────────────────────────────
  if (state === "scanning") {
    return (
      <div style={{ color: "#111", fontFamily: "'Libre Franklin', sans-serif" }}>
        <style>{CSS}</style>
        <div
          style={{ padding: "64px 24px", maxWidth: 580, margin: "0 auto" }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              color: "#888",
              marginBottom: 32,
            }}
          >
            Kollar{" "}
            <span style={{ color: "#111", fontWeight: 600 }}>{domain}</span>
            ...
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              marginBottom: 32,
            }}
          >
            {SCAN_STEPS.map((step, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {i < scanStep ? (
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 14,
                        color: "#16a34a",
                        fontWeight: 700,
                      }}
                    >
                      ✓
                    </span>
                  ) : i === scanStep ? (
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        border: "2px solid #c4391a",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "ss-spin 0.7s linear infinite",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 14,
                        color: "#ddd",
                      }}
                    >
                      ◌
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    color: i <= scanStep ? "#111" : "#bbb",
                    fontWeight: i === scanStep ? 600 : 400,
                    transition: "color 0.3s",
                  }}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              height: 3,
              background: "#EDECE8",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "#c4391a",
                width: `${progress}%`,
                transition: "width 0.2s ease",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT ────────────────────────────────────────────────────
  if (!result) return null;
  const cfg = BADGE[result.status];

  return (
    <div style={{ color: "#111", fontFamily: "'Libre Franklin', sans-serif" }}>
      <style>{CSS}</style>
      <div
        style={{
          padding: "40px 24px 48px",
          maxWidth: 580,
          margin: "0 auto",
          animation: "ss-fadeup 0.4s ease both",
        }}
      >
        {/* DEMO banner */}
        {result.isDemo && (
          <div
            style={{
              background: "#fffbeb",
              border: "1.5px solid #fde68a",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 16,
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                fontWeight: 700,
                color: "#92400e",
                letterSpacing: 1,
                flexShrink: 0,
              }}
            >
              DEMO
            </span>
            <span style={{ fontSize: 12, color: "#78716c", lineHeight: 1.5 }}>
              Tekniska checks är riktiga. Analystexten är generisk tills{" "}
              <code>ANTHROPIC_API_KEY</code> läggs till i Vercel.
            </span>
          </div>
        )}

        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            color: "#888",
            marginBottom: 16,
          }}
        >
          Resultat för{" "}
          <span style={{ color: "#111", fontWeight: 600 }}>{domain}</span>
        </div>

        {/* Badge + summary — always visible */}
        <div
          style={{
            background: cfg.bg,
            border: `2px solid ${cfg.border}`,
            borderRadius: 12,
            padding: "20px 24px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 11,
                height: 11,
                borderRadius: "50%",
                background: cfg.dot,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 15,
                fontWeight: 700,
                color: cfg.text,
                letterSpacing: 0.5,
              }}
            >
              {cfg.label}
            </span>
          </div>
          <p style={{ fontSize: 14, color: "#555", lineHeight: 1.55 }}>
            {result.summary}
          </p>
        </div>

        {/* Progressive disclosure — step 1 */}
        {state === "result_summary" && (
          <button
            onClick={() => setState("result_full")}
            style={{
              width: "100%",
              padding: "12px 14px",
              background: "#fff",
              border: "1.5px solid #EDECE8",
              borderRadius: 10,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 600,
              color: "#111",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Visa detaljer</span>
            <span style={{ color: "#c4391a" }}>↓</span>
          </button>
        )}

        {/* Progressive disclosure — step 2 */}
        {state === "result_full" && (
          <div style={{ animation: "ss-fadeup 0.3s ease both" }}>
            {/* Findings */}
            <div
              style={{
                background: "#fff",
                border: "1.5px solid #EDECE8",
                borderRadius: 12,
                padding: "16px 20px",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#bbb",
                  letterSpacing: 1.5,
                  marginBottom: 12,
                }}
              >
                VAD VI HITTADE
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {result.findings.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 13,
                        color: f.pass ? "#16a34a" : "#ef4444",
                        fontWeight: 700,
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      {f.pass ? "✓" : "✗"}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: "#444",
                        lineHeight: 1.55,
                      }}
                    >
                      {f.check}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next steps */}
            <div
              style={{
                background: "#fff",
                border: "1.5px solid #EDECE8",
                borderRadius: 12,
                padding: "16px 20px",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#bbb",
                  letterSpacing: 1.5,
                  marginBottom: 12,
                }}
              >
                NÄSTA STEG
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {result.next_steps.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 12,
                        color: "#c4391a",
                        fontWeight: 700,
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      →
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: "#444",
                        lineHeight: 1.55,
                      }}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button
                onClick={handleShare}
                style={{
                  flex: 1,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#fff",
                  background: "#111",
                  border: "none",
                  borderRadius: 8,
                  padding: "11px",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                {shared ? "Kopierat ✓" : "Dela resultat →"}
              </button>
              <a
                href="https://discord.gg/CSphbTk8En"
                style={{
                  flex: 1,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#fff",
                  background: "#c4391a",
                  borderRadius: 8,
                  padding: "11px",
                  textDecoration: "none",
                  display: "block",
                  textAlign: "center",
                }}
              >
                Gå med i Discord →
              </a>
            </div>

            <p
              style={{
                fontSize: 11,
                color: "#bbb",
                lineHeight: 1.65,
                marginBottom: 16,
              }}
            >
              Det här är inte juridisk rådgivning. Resultatet visar tekniska
              observationer, inte en juridisk bedömning. Kontakta en jurist för
              specifik compliance-rådgivning.
            </p>

            <button
              onClick={handleReset}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 600,
                color: "#aaa",
                background: "#fff",
                border: "1.5px solid #EDECE8",
                borderRadius: 8,
                padding: "10px 16px",
                cursor: "pointer",
              }}
            >
              ← Scanna en till
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Verify in browser**

Visit `http://localhost:3005/scan`. Confirm:
- Idle state shows input + demo chips
- Clicking "fortnox.se" chip starts scanning animation
- 3 steps tick in sequence (~750ms apart)
- Result shows badge + summary
- "Visa detaljer ↓" expands findings + next steps

- [ ] **Step 4: Commit**

```bash
git add app/scan/_components/ScannerSection.tsx
git commit -m "feat(scan): add ScannerSection with progressive disclosure"
```

---

## Task 6: `app/scan/_components/IntegrationVote.tsx` — Beat 2

**Files:**
- Create: `app/scan/_components/IntegrationVote.tsx`

- [ ] **Step 1: Create the file**

```typescript
// app/scan/_components/IntegrationVote.tsx
"use client";

import { useState, useEffect } from "react";

const SYSTEMS = [
  { id: "fortnox", name: "Fortnox", desc: "Fakturering, bokföring" },
  { id: "visma", name: "Visma", desc: "eEkonomi, lön" },
  { id: "bankid", name: "BankID", desc: "Identitetsverifiering" },
  { id: "skatteverket", name: "Skatteverket", desc: "Moms, deklaration" },
  { id: "bolagsverket", name: "Bolagsverket", desc: "Företagsinfo" },
  { id: "swish", name: "Swish", desc: "Betalningar" },
  { id: "bankgirot", name: "Bankgirot", desc: "Betalfiler" },
] as const;

type SystemId = (typeof SYSTEMS)[number]["id"];

const LS_COUNTS = "os_iv_counts";
const LS_USER = "os_iv_user";

const ZERO_COUNTS: Record<SystemId, number> = Object.fromEntries(
  SYSTEMS.map((s) => [s.id, 0])
) as Record<SystemId, number>;

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function IntegrationVote() {
  const [counts, setCounts] = useState<Record<SystemId, number>>(ZERO_COUNTS);
  const [userVotes, setUserVotes] = useState<Set<SystemId>>(new Set());

  useEffect(() => {
    setCounts(readLS(LS_COUNTS, ZERO_COUNTS));
    setUserVotes(new Set(readLS<SystemId[]>(LS_USER, [])));
  }, []);

  function toggle(id: SystemId) {
    const voted = userVotes.has(id);
    const newCounts = {
      ...counts,
      [id]: voted ? Math.max(0, counts[id] - 1) : counts[id] + 1,
    };
    const newUser = new Set(userVotes);
    voted ? newUser.delete(id) : newUser.add(id);

    setCounts(newCounts);
    setUserVotes(newUser);
    localStorage.setItem(LS_COUNTS, JSON.stringify(newCounts));
    localStorage.setItem(LS_USER, JSON.stringify([...newUser]));
  }

  const sorted = [...SYSTEMS]
    .map((s) => ({ ...s, count: counts[s.id] }))
    .sort((a, b) => b.count - a.count);

  const topCount = Math.max(1, sorted[0]?.count ?? 1);

  return (
    <section
      style={{
        padding: "64px 24px 32px",
        maxWidth: 580,
        margin: "0 auto",
        fontFamily: "'Libre Franklin', sans-serif",
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          fontWeight: 700,
          color: "#c4391a",
          letterSpacing: 2,
          marginBottom: 6,
        }}
      >
        VILKA SYSTEM BEHÖVER AGENTER?
      </div>
      <h2
        style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(22px,4vw,30px)",
          fontWeight: 400,
          letterSpacing: -0.3,
          marginBottom: 6,
        }}
      >
        Rösta. Builders bygger det som efterfrågas mest.
      </h2>
      <p style={{ fontSize: 13, color: "#aaa", marginBottom: 20 }}>
        Klicka på systemet du använder.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {sorted.map((sys) => {
          const voted = userVotes.has(sys.id);
          const barW = Math.max(6, Math.round((sys.count / topCount) * 100));
          return (
            <button
              key={sys.id}
              onClick={() => toggle(sys.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "#fff",
                border: voted
                  ? "1.5px solid #c4391a44"
                  : "1.5px solid #EDECE8",
                borderRadius: 10,
                padding: "10px 14px",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                transition: "border-color 0.2s",
              }}
            >
              {/* Background bar */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${barW}%`,
                  background: voted ? "#c4391a08" : "#fafaf7",
                  transition: "width 0.4s ease",
                  zIndex: 0,
                }}
              />
              {/* Vote count */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  color: voted ? "#c4391a" : "#ccc",
                  minWidth: 38,
                  zIndex: 1,
                  position: "relative",
                  transition: "color 0.15s",
                }}
              >
                <span style={{ fontSize: 9 }}>▲</span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  {sys.count}
                </span>
              </div>
              {/* Name + desc */}
              <div style={{ flex: 1, zIndex: 1, position: "relative" }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{sys.name}</div>
                <div style={{ fontSize: 12, color: "#999" }}>{sys.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/scan/_components/IntegrationVote.tsx
git commit -m "feat(scan): add IntegrationVote with localStorage persistence"
```

---

## Task 7: `app/scan/_components/CTA.tsx` — Beat 3

**Files:**
- Create: `app/scan/_components/CTA.tsx`

- [ ] **Step 1: Create the file**

```typescript
// app/scan/_components/CTA.tsx
"use client";

import { PixelBlock } from "./PixelBlock";

export default function CTA() {
  function handleShare() {
    const text =
      "Sveriges första öppna AI-readiness scanner för företag — agent.opensverige.se";
    if (navigator.share) {
      navigator.share({
        title: "agent.opensverige",
        text,
        url: "https://opensverige.se/scan",
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText("https://opensverige.se/scan");
    }
  }

  return (
    <section
      style={{
        padding: "48px 24px 64px",
        textAlign: "center",
        maxWidth: 480,
        margin: "0 auto",
        fontFamily: "'Libre Franklin', sans-serif",
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}
      >
        <PixelBlock size={36} />
      </div>
      <h2
        style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(24px,5vw,36px)",
          fontWeight: 400,
          lineHeight: 1.15,
          letterSpacing: -0.5,
          marginBottom: 8,
        }}
      >
        250+ builders bygger redan.
        <br />
        Häng med.
      </h2>
      <p style={{ fontSize: 14, color: "#999", marginBottom: 24 }}>
        Öppen källkod. Stockholm, Göteborg, Malmö.
      </p>
      <a
        href="https://discord.gg/CSphbTk8En"
        style={{
          display: "inline-block",
          fontSize: 14,
          fontWeight: 700,
          color: "#fff",
          background: "#c4391a",
          padding: "14px 36px",
          borderRadius: 10,
          textDecoration: "none",
          boxShadow: "0 4px 20px #c4391a18",
        }}
      >
        Gå med i Discord →
      </a>
      <div style={{ marginTop: 16 }}>
        <button
          onClick={handleShare}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 600,
            color: "#c4391a",
            background: "none",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
            padding: 0,
          }}
        >
          Dela med någon som behöver det här
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/scan/_components/CTA.tsx
git commit -m "feat(scan): add CTA section with PixelBlock animation"
```

---

## Task 8: Update `app/scan/page.tsx` — Wire all sections

**Files:**
- Replace: `app/scan/page.tsx`
- Delete: `app/scan/_components/Scanner.tsx`

- [ ] **Step 1: Delete the old Scanner.tsx**

```bash
rm app/scan/_components/Scanner.tsx
```

- [ ] **Step 2: Replace page.tsx**

```typescript
// app/scan/page.tsx
import type { Metadata } from "next";
import Nav from "./_components/Nav";
import ScannerSection from "./_components/ScannerSection";
import IntegrationVote from "./_components/IntegrationVote";
import CTA from "./_components/CTA";

export const metadata: Metadata = {
  title: "Hur agent-redo är ditt företag?",
  description:
    "Vi scannar din sajt och visar vad AI-agenter ser — GDPR, EU AI Act och teknisk tillgänglighet. Gratis. Öppet.",
};

export default function ScanPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F8F7F4" }}>
      <Nav />
      <ScannerSection />
      <div
        style={{
          maxWidth: 580,
          margin: "0 auto",
          height: 1,
          background: "#EDECE8",
        }}
      />
      <IntegrationVote />
      <div
        style={{
          maxWidth: 580,
          margin: "0 auto",
          height: 1,
          background: "#EDECE8",
        }}
      />
      <CTA />
      <footer
        style={{
          padding: "14px 24px",
          borderTop: "1.5px solid #EDECE8",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: "#ccc",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span>agent.opensverige.se</span>
        <span>opensverige.se — öppen källkod</span>
      </footer>
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Full browser smoke test**

Visit `http://localhost:3005/scan`. Confirm:
1. Sticky nav visible with PixelDot animation
2. Hero renders with correct headline and demo chips
3. Click "visma.net" chip → scanning animation with 3 steps
4. After ~3–8s: badge + summary appears
5. "Visa detaljer ↓" → expands findings + next steps
6. "Dela resultat →" → copies/shares text
7. "← Scanna en till" → resets to idle
8. Scroll down: divider → integration voting section (all at 0)
9. Click "Fortnox" → count increments to 1, row highlights red
10. Click again → toggles off
11. Scroll down: divider → CTA section with PixelBlock animation
12. Footer at bottom

- [ ] **Step 5: Commit**

```bash
git add app/scan/page.tsx
git rm app/scan/_components/Scanner.tsx
git commit -m "feat(scan): wire all 3 beats into full landing page"
```

---

## Task 9: `supabase/migrations/002_scans.sql` — Database scaffold

**Files:**
- Create: `supabase/migrations/002_scans.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- Migration: 002_scans
-- Run in Supabase SQL editor after 001_scan_submissions.sql

-- Main scan results table
CREATE TABLE IF NOT EXISTS scans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain          TEXT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('REDO', 'DELVIS_REDO', 'INTE_REDO')),
  industry        TEXT,
  findings        JSONB,
  next_steps      JSONB,
  technical_checks JSONB,
  is_demo         BOOLEAN NOT NULL DEFAULT false,
  scanned_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No personal data in this table.

CREATE INDEX IF NOT EXISTS scans_domain_idx     ON scans (domain);
CREATE INDEX IF NOT EXISTS scans_status_idx     ON scans (status);
CREATE INDEX IF NOT EXISTS scans_scanned_at_idx ON scans (scanned_at DESC);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Anyone can insert
CREATE POLICY "Public insert"
  ON scans FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Read via service role only (no anon SELECT)

-- Integration votes table (for future persistent voting)
CREATE TABLE IF NOT EXISTS integration_votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id   TEXT NOT NULL,
  session_id  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS iv_system_id_idx ON integration_votes (system_id);

ALTER TABLE integration_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert"
  ON integration_votes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Useful queries:
--
-- Scans per status:
--   SELECT status, COUNT(*) FROM scans GROUP BY status;
--
-- Top scanned domains:
--   SELECT domain, COUNT(*) FROM scans GROUP BY domain ORDER BY COUNT(*) DESC LIMIT 20;
--
-- Demo vs real ratio:
--   SELECT is_demo, COUNT(*) FROM scans GROUP BY is_demo;
--
-- Top voted integrations:
--   SELECT system_id, COUNT(*) FROM integration_votes GROUP BY system_id ORDER BY COUNT(*) DESC;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/002_scans.sql
git commit -m "feat(scan): add Supabase scans and integration_votes migration"
```

---

## Final verification

- [ ] Run full type-check: `npx tsc --noEmit` — no errors
- [ ] Run build: `npm run build` — no errors
- [ ] Visit `http://localhost:3005/scan` — all 3 beats visible, scanner works end-to-end
- [ ] Test on mobile viewport (375px) — layout is readable, input usable
