// app/scan/_components/ScannerSection.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ScanResult } from "@/lib/scan-types";

type ScanState = "idle" | "scanning";

const SCAN_STEPS = [
  "Kan agenter hitta dig?",
  "Är du lagligt redo?",
  "Kan en dev bygga mot dig?",
];

const DEMO_CHIPS = ["fortnox.se", "visma.net", "bokio.se", "spotify.com"];

const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::selection { background: #c4391a22; }
  @keyframes ss-spin { to { transform: rotate(360deg); } }
  @keyframes ss-fadeup {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ss-checkin {
    from { opacity: 0; transform: scale(0.5); }
    to   { opacity: 1; transform: scale(1); }
  }
  .ss-btn {
    transition: opacity 0.12s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.12s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .ss-btn:hover { opacity: 0.82; }
  .ss-btn:active { transform: scale(0.97); }
  .ss-chip {
    transition: border-color 0.15s cubic-bezier(0.16, 1, 0.3, 1),
                color 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .ss-chip:hover { border-color: #c4391a55 !important; color: #111 !important; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

function cleanDomain(input: string): string {
  return input.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
}

function isValidDomain(d: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/.test(d);
}

export default function ScannerSection() {
  const router = useRouter();
  const [state, setState] = useState<ScanState>("idle");
  const [url, setUrl] = useState("");
  const [domain, setDomain] = useState("");
  const [scanStep, setScanStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);

  const startProgressAnim = useCallback((ms: number) => {
    const start = Date.now();
    let frameId = 0;
    const tick = () => {
      const p = Math.min(88, ((Date.now() - start) / ms) * 88);
      setProgress(p);
      if (Date.now() - start < ms) {
        frameId = requestAnimationFrame(tick);
        rafRef.current = frameId;
      }
    };
    frameId = requestAnimationFrame(tick);
    rafRef.current = frameId;
    return () => cancelAnimationFrame(frameId);
  }, []);

  async function runScan(rawInput: string) {
    const d = cleanDomain(rawInput);
    if (!isValidDomain(d)) return;

    setDomain(d);
    setState("scanning");
    setScanStep(0);
    setProgress(0);

    const timers = [
      setTimeout(() => setScanStep(1), 1000),
      setTimeout(() => setScanStep(2), 2000),
    ];
    const stopAnim = startProgressAnim(4000);
    const start = Date.now();

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: d }),
      });

      const elapsed = Date.now() - start;
      if (elapsed < 3500) await new Promise(r => setTimeout(r, 3500 - elapsed));

      stopAnim();
      timers.forEach(clearTimeout);

      if (res.ok) {
        const data: ScanResult = await res.json();
        setProgress(100);
        setTimeout(() => {
          try {
            sessionStorage.setItem(`scan_${d}`, JSON.stringify(data));
          } catch { /* ignore storage errors (private browsing, quota) */ }
          router.push(`/scan/${d}`);
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

  const inputDomain = cleanDomain(url);
  const canSubmit = isValidDomain(inputDomain);

  // ── IDLE ──────────────────────────────────────────────────────
  if (state === "idle") {
    return (
      <div style={{ color: "#111", fontFamily: "'Libre Franklin', sans-serif" }}>
        <style>{CSS}</style>
        <div style={{ padding: "56px 24px 64px", maxWidth: 580, margin: "0 auto" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: "#c4391a", letterSpacing: 3, marginBottom: 16, animation: "ss-fadeup 0.5s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
            AGENT READINESS SCANNER
          </div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(32px,7vw,52px)", fontWeight: 400, lineHeight: 1.08, letterSpacing: -1.5, marginBottom: 14, animation: "ss-fadeup 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both" }}>
            Hur agent-redo<br />är ditt företag?
          </h1>
          <p style={{ fontSize: 16, color: "#666", lineHeight: 1.6, maxWidth: 420, marginBottom: 28, animation: "ss-fadeup 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.10s both" }}>
            Vi scannar din sajt och visar vad AI-agenter ser — 11 checks. Gratis. Öppet.
          </p>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, animation: "ss-fadeup 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.14s both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, background: "#FDFCF9", border: "2px solid #ddd", borderRadius: 12, padding: "12px 14px" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#706F6C", flexShrink: 0 }}>https://</span>
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && canSubmit && runScan(url)}
                placeholder="dittforetag.se"
                aria-label="Domännamn att scanna"
                autoComplete="url"
                spellCheck={false}
                style={{ background: "none", border: "none", outline: "none", color: "#111", fontFamily: "'JetBrains Mono', monospace", fontSize: 15, flex: 1, caretColor: "#c4391a", fontWeight: 500 }}
              />
            </div>
            <button type="button" onClick={() => runScan(url)} disabled={!canSubmit} aria-disabled={!canSubmit}
              style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, color: canSubmit ? "#fff" : "#555", background: canSubmit ? "#c4391a" : "#ccc", padding: "12px 22px", borderRadius: 8, border: "none", cursor: canSubmit ? "pointer" : "default", whiteSpace: "nowrap", transition: "background 0.2s cubic-bezier(0.16, 1, 0.3, 1)", minHeight: 44 }}>
              Scanna →
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 36, marginTop: 8, animation: "ss-fadeup 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.18s both" }}>
            <span style={{ fontSize: 11, color: "#706F6C", alignSelf: "center" }}>Prova:</span>
            {DEMO_CHIPS.map(chip => (
              <button key={chip} type="button" onClick={() => runScan(chip)} aria-label={`Scanna ${chip}`} className="ss-chip"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#666", background: "#FDFCF9", border: "1.5px solid #EDECE8", borderRadius: 8, padding: "0 10px", cursor: "pointer", minHeight: 44, display: "flex", alignItems: "center" }}>
                {chip}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 14, color: "#666", lineHeight: 1.65, maxWidth: 460, animation: "ss-fadeup 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.22s both" }}>
            AI-agenter börjar interagera med företagssajter. GDPR, EU AI Act och svenska lagar ställer krav på hur. Vi kollar om du är redo.
          </p>
        </div>
      </div>
    );
  }

  // ── SCANNING ──────────────────────────────────────────────────
  return (
    <div style={{ color: "#111", fontFamily: "'Libre Franklin', sans-serif" }}>
      <style>{CSS}</style>
      <div role="status" aria-live="polite" aria-atomic="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
        Skannar {domain}, vänta...
      </div>
      <div style={{ padding: "64px 24px", maxWidth: 580, margin: "0 auto", animation: "ss-fadeup 0.35s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
        <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: "#666", marginBottom: 32 }}>
          Kollar <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#111", fontWeight: 600 }}>{domain}</span>...
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
          {SCAN_STEPS.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {i < scanStep ? (
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#16a34a", fontWeight: 700, animation: "ss-checkin 0.2s cubic-bezier(0.16, 1, 0.3, 1) both" }}>✓</span>
                ) : i === scanStep ? (
                  <div style={{ width: 14, height: 14, border: "2px solid #c4391a", borderTopColor: "transparent", borderRadius: "50%", animation: "ss-spin 0.7s linear infinite" }} />
                ) : (
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#ddd" }}>◌</span>
                )}
              </div>
              <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: i <= scanStep ? "#111" : "#706F6C", fontWeight: i === scanStep ? 600 : 400, transition: "color 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                {step}
              </span>
            </div>
          ))}
        </div>
        <div role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Skannar"
          style={{ height: 3, background: "#EDECE8", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "#c4391a", width: `${progress}%`, transition: "width 0.2s cubic-bezier(0.16, 1, 0.3, 1)" }} />
        </div>
      </div>
    </div>
  );
}
