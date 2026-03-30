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
