// app/scan/[domain]/_components/ResultsPage.tsx
"use client";

import { useState, useEffect } from "react";
import type { ScanResult, AgentSuggestion } from "@/lib/scan-types";
import { DEFAULT_AGENT_SUGGESTIONS } from "@/lib/scan-types";
import type { CheckId, CheckSeverity } from "@/lib/checks";
import { CHECK_DISPLAY_ORDER } from "@/lib/checks";
import { CHECK_CONTEXT } from "@/lib/check-context";
import { REGULATORY_UPDATES } from "@/lib/regulatory-updates";

const BADGE_CFG: Record<ScanResult['badge'], { label: string; dot: string; bg: string; border: string; text: string }> = {
  green:  { label: "REDO",        dot: "#4ade80", bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" },
  yellow: { label: "DELVIS REDO", dot: "#f59e0b", bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
  red:    { label: "INTE REDO",   dot: "#ef4444", bg: "#fef2f2", border: "#fecaca", text: "#991b1b" },
};

const BADGE_EMOJI: Record<ScanResult['badge'], string> = { green: "🟢", yellow: "🟡", red: "🔴" };

const SEVERITY_CFG: Record<CheckSeverity, { label: string; color: string; bg: string; border: string; icon: string; summaryText: string; summarySource: string }> = {
  critical: {
    label: "KRITISK", color: "#dc2626", bg: "#fef2f2", border: "#fecaca", icon: "⚠",
    summaryText: "71% av stora företag har AI-agenter med åtkomst till affärssystem — men bara 16% styr den åtkomsten. Åtgärda dessa först.",
    summarySource: "Cisco AI Readiness Index 2025, Gravitee Governance Gap 2026",
  },
  important: {
    label: "VIKTIG", color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "⚡",
    summaryText: "Dessa begränsar hur AI-agenter kan interagera med ditt system. Postmans 90-dagars playbook rekommenderar att dessa löses inom första 30 dagarna.",
    summarySource: "Postman, The 90-day AI Readiness Playbook",
  },
  info: {
    label: "INFO", color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", icon: "ℹ",
    summaryText: "Nice-to-have. Förbättrar agent-upplevelsen men blockerar inte.",
    summarySource: "",
  },
};

const MARKETPLACE_SYSTEMS = [
  { name: "Fortnox", planned: 4 },
  { name: "Visma", planned: 2 },
  { name: "BankID", planned: 1 },
];

const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::selection { background: #c4391a22; }
  @keyframes rp-fadeup {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .rp-btn {
    transition: opacity 0.12s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.12s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .rp-btn:hover { opacity: 0.82; }
  .rp-btn:active { transform: scale(0.97); }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#FDFCF9", border: "1.5px solid #EDECE8", borderRadius: 12, padding: "16px 20px", marginBottom: 12, ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: "#706F6C", letterSpacing: 1.5, marginBottom: 12 }}>
      {children}
    </div>
  );
}

export default function ResultsPage({ domain, initialData }: { domain: string; initialData: ScanResult | null }) {
  const [result, setResult] = useState<ScanResult | null>(initialData);
  const [notFound, setNotFound] = useState(false);
  const [passedExpanded, setPassedExpanded] = useState(false);
  const [expandedContexts, setExpandedContexts] = useState<Set<CheckId>>(new Set());
  const [shared, setShared] = useState(false);
  const [deepSent, setDeepSent] = useState(false);

  useEffect(() => {
    if (result) return;
    try {
      const stored = sessionStorage.getItem(`scan_${domain}`);
      if (stored) {
        setResult(JSON.parse(stored) as ScanResult);
        return;
      }
    } catch { /* ignore */ }
    setNotFound(true);
  }, [domain, result]);

  if (!result && !notFound) return null;

  if (notFound) {
    return (
      <div style={{ padding: "64px 24px", maxWidth: 580, margin: "0 auto", fontFamily: "'Libre Franklin', sans-serif", textAlign: "center", animation: "rp-fadeup 0.4s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
        <style>{CSS}</style>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#706F6C", marginBottom: 16 }}>{domain}</div>
        <p style={{ fontSize: 16, color: "#666", marginBottom: 24, lineHeight: 1.6 }}>Ingen scan hittad för den här domänen.</p>
        <a href={`/scan`} className="rp-btn"
          style={{ display: "inline-block", fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, color: "#fff", background: "#c4391a", padding: "12px 28px", borderRadius: 8, textDecoration: "none" }}>
          Scanna {domain} →
        </a>
      </div>
    );
  }

  const r = result!;
  const cfg = BADGE_CFG[r.badge];
  const allChecks = CHECK_DISPLAY_ORDER.map(id => r.checks[id]);
  const failedCritical = allChecks.filter(c => !c.pass && c.severity === 'critical');
  const failedImportant = allChecks.filter(c => !c.pass && c.severity === 'important');
  const failedInfo = allChecks.filter(c => !c.pass && c.severity === 'info');
  const passedChecks = allChecks.filter(c => c.pass);
  const sc = r.severity_counts ?? {
    critical: failedCritical.length,
    important: failedImportant.length,
    info: failedInfo.length,
  };
  const agentSuggestions: AgentSuggestion[] = r.agent_suggestions?.length > 0
    ? r.agent_suggestions
    : DEFAULT_AGENT_SUGGESTIONS;
  const calcomUrl = process.env.NEXT_PUBLIC_CALCOM_URL ?? 'https://cal.com/opensverige/15min';

  function toggleContext(id: CheckId) {
    setExpandedContexts(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleShare() {
    const discovery = CHECK_DISPLAY_ORDER.slice(0, 3).map(id => r.checks[id]);
    const compliance = CHECK_DISPLAY_ORDER.slice(3, 6).map(id => r.checks[id]);
    const builder = CHECK_DISPLAY_ORDER.slice(6).map(id => r.checks[id]);
    const shareText = [
      `${domain} fick ${BADGE_EMOJI[r.badge]} ${cfg.label} (${r.score}/11) på AI-agent readiness.`,
      "",
      `${discovery.filter(c => c.pass).length} av ${discovery.length} discovery-checks ✓`,
      `${compliance.filter(c => c.pass).length} av ${compliance.length} compliance-checks ${compliance.every(c => !c.pass) ? "✗" : "✓"}`,
      `${builder.filter(c => c.pass).length} av ${builder.length} builder-checks ✓`,
      "",
      "Testa din sajt → agent.opensverige.se/scan",
      "",
      "#opensverige #aiagenter",
    ].join("\n");
    const shareUrl = `https://agent.opensverige.se/scan/${domain}`;
    if (navigator.share) {
      navigator.share({ title: `${domain} — AI-beredskap`, text: shareText, url: shareUrl }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => setShared(true)).catch(() => {});
    } else {
      const ta = document.createElement("textarea");
      ta.value = shareText;
      ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(ta); ta.focus(); ta.select();
      try { document.execCommand("copy"); setShared(true); } catch {}
      document.body.removeChild(ta);
    }
  }

  async function handleDeepScan() {
    if (!r.scan_id || deepSent) return;
    setDeepSent(true);
    try { await fetch(`/api/scan/${r.scan_id}`, { method: "PATCH" }); } catch {}
  }

  const W = { maxWidth: 580, margin: "0 auto", padding: "0 24px" };

  return (
    <div style={{ color: "#111", fontFamily: "'Libre Franklin', sans-serif", paddingBottom: 64 }}>
      <style>{CSS}</style>

      {/* 1. HEADER */}
      <div style={{ ...W, paddingTop: 40, animation: "rp-fadeup 0.4s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
        {r.isDemo && (
          <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 8, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: "#92400e", letterSpacing: 1, flexShrink: 0 }}>DEMO</span>
            <span style={{ fontSize: 12, color: "#706F6C", lineHeight: 1.5 }}>Tekniska checks är riktiga. Analystexten är generisk tills <code>ANTHROPIC_API_KEY</code> läggs till.</span>
          </div>
        )}
        <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: "#666", marginBottom: 12 }}>
          Resultat för <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#111", fontWeight: 600 }}>{domain}</span>
        </div>
        <div style={{ background: cfg.bg, border: `2px solid ${cfg.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, fontWeight: 400, color: cfg.text }}>{cfg.label}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: cfg.text, marginLeft: "auto" }}>{r.score} / 11</span>
          </div>
          <p style={{ fontSize: 14, color: "#555", lineHeight: 1.55 }}>{r.summary}</p>
        </div>
      </div>

      {/* 2. PROGRESS */}
      <div style={{ ...W, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ flex: 1, height: 6, background: "#EDECE8", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(r.score / 11) * 100}%`, background: cfg.dot, borderRadius: 3, transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }} />
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, color: "#111", flexShrink: 0 }}>{r.score}/11</span>
        </div>
        <div style={{ fontSize: 12, color: "#706F6C" }}>
          {sc.critical > 0 && <span style={{ color: "#dc2626" }}>{sc.critical} kritiska</span>}
          {sc.critical > 0 && (sc.important > 0 || sc.info > 0) && <span>  ·  </span>}
          {sc.important > 0 && <span style={{ color: "#d97706" }}>{sc.important} viktiga</span>}
          {sc.important > 0 && sc.info > 0 && <span>  ·  </span>}
          {sc.info > 0 && <span>{sc.info} info</span>}
          {(sc.critical + sc.important + sc.info) > 0 && <span style={{ color: "#706F6C" }}> — att åtgärda</span>}
        </div>
      </div>

      {/* 3. REGULATORY NOTICE */}
      {REGULATORY_UPDATES.length > 0 && (
        <div style={{ ...W, marginBottom: 20 }}>
          <div style={{ background: "#f8f9fa", border: "1.5px solid #dee2e6", borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: "#706F6C", letterSpacing: 1.5, marginBottom: 8 }}>REGULATORISKA UPPDATERINGAR</div>
            {REGULATORY_UPDATES.slice(0, 3).map((u, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: i < Math.min(REGULATORY_UPDATES.length, 3) - 1 ? 6 : 0 }}>
                <span style={{ color: u.severity === 'important' ? "#d97706" : "#706F6C", fontSize: 13, flexShrink: 0 }}>•</span>
                <span style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>{u.text}</span>
              </div>
            ))}
            <div style={{ fontSize: 10, color: "#aaa", marginTop: 8, fontStyle: "italic" }}>Senast uppdaterad: {REGULATORY_UPDATES[0].date}</div>
          </div>
        </div>
      )}

      {/* 4–6. FAILING CHECKS grouped by severity */}
      {([
        { severity: 'critical' as CheckSeverity, checks: failedCritical },
        { severity: 'important' as CheckSeverity, checks: failedImportant },
        { severity: 'info' as CheckSeverity, checks: failedInfo },
      ] as const).filter(g => g.checks.length > 0).map(group => {
        const scfg = SEVERITY_CFG[group.severity];
        return (
          <div key={group.severity} style={W}>
            {/* Summary box */}
            <div style={{ background: scfg.bg, border: `1.5px solid ${scfg.border}`, borderRadius: 12, padding: "14px 18px", marginBottom: 10 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: scfg.color, letterSpacing: 1, marginBottom: 6 }}>
                {scfg.icon} {group.checks.length} {scfg.label}{group.checks.length !== 1 ? 'A BRISTER' : ' BRIST'}
              </div>
              <p style={{ fontSize: 13, color: "#555", lineHeight: 1.55, marginBottom: scfg.summarySource ? 6 : 0 }}>{scfg.summaryText}</p>
              {scfg.summarySource && <p style={{ fontSize: 11, color: "#706F6C", fontStyle: "italic" }}>Källa: {scfg.summarySource}</p>}
            </div>
            {/* Individual checks */}
            {group.checks.map(check => {
              const ctx = CHECK_CONTEXT[check.id];
              const isInfoCollapsed = group.severity === 'info' && !expandedContexts.has(check.id);
              return (
                <div key={check.id} style={{ background: "#FDFCF9", border: "1.5px solid #EDECE8", borderRadius: 12, padding: "14px 18px", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap", flex: 1 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700, color: scfg.color, background: scfg.bg, border: `1px solid ${scfg.border}`, borderRadius: 4, padding: "2px 5px", letterSpacing: 0.5, flexShrink: 0 }}>{scfg.label}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: check.hardcoded ? "#706F6C" : scfg.color, fontWeight: 700, flexShrink: 0 }}>✗</span>
                      <span style={{ fontSize: 13, color: "#333", lineHeight: 1.5 }}>{check.label}</span>
                    </div>
                  </div>
                  {check.detail && (
                    <div style={{ fontSize: 11, color: "#706F6C", marginBottom: 8, marginLeft: 0 }}>{check.detail}</div>
                  )}
                  {/* Context — always expanded for critical+important, collapsible for info */}
                  {group.severity !== 'info' ? (
                    <div style={{ background: "#F8F7F4", borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
                      <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6, marginBottom: 4 }}>{ctx.stat}</p>
                      <p style={{ fontSize: 11, color: "#706F6C", fontStyle: "italic" }}>— {ctx.source}</p>
                    </div>
                  ) : (
                    <button type="button" onClick={() => toggleContext(check.id)} className="rp-btn"
                      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 11, color: "#706F6C", marginBottom: 8 }}>
                      {isInfoCollapsed ? "Visa kontext ↓" : "Dölj ↑"}
                    </button>
                  )}
                  {!isInfoCollapsed && group.severity === 'info' && (
                    <div style={{ background: "#F8F7F4", borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
                      <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6, marginBottom: 4 }}>{ctx.stat}</p>
                      <p style={{ fontSize: 11, color: "#706F6C", fontStyle: "italic" }}>— {ctx.source}</p>
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                    <span style={{ color: "#c4391a", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: 12, color: "#444", lineHeight: 1.5 }}>{ctx.action}</span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* 7. PASSED CHECKS (collapsed) */}
      {passedChecks.length > 0 && (
        <div style={W}>
          <button type="button" onClick={() => setPassedExpanded(p => !p)} className="rp-btn"
            style={{ width: "100%", background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 12, padding: "12px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, minHeight: 44 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: "#166534", letterSpacing: 1 }}>✓ {passedChecks.length} GODKÄNDA CHECKS</span>
            <span style={{ color: "#166534", fontSize: 12 }}>{passedExpanded ? "↑" : "↓"}</span>
          </button>
          {passedExpanded && (
            <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 12, padding: "14px 18px", marginBottom: 12, animation: "rp-fadeup 0.25s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
              {passedChecks.map((check, i) => (
                <div key={check.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: i < passedChecks.length - 1 ? 8 : 0 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#16a34a", fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: 13, color: "#166534" }}>{check.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 8. ZEIGARNIK CHECKLIST */}
      <div style={W}>
        <Card>
          <SectionLabel>DIN ÅTGÄRDSLISTA</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {CHECK_DISPLAY_ORDER.map(id => {
              const check = r.checks[id];
              return (
                <div key={id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: check.pass ? "#16a34a" : "#ccc", fontWeight: 700, flexShrink: 0, width: 16 }}>
                    {check.pass ? "☑" : "☐"}
                  </span>
                  <span style={{ fontSize: 12, color: check.pass ? "#555" : "#111", textDecoration: check.pass ? "line-through" : "none", opacity: check.pass ? 0.7 : 1 }}>
                    {check.label}
                  </span>
                  {!check.pass && check.severity === 'critical' && (
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 4, padding: "1px 4px", marginLeft: "auto", flexShrink: 0 }}>KRITISK</span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* 9. TOPP 3 ATT FIXA */}
      {r.recommendations.length > 0 && (
        <div style={W}>
          <Card>
            <SectionLabel>TOPP 3 ATT FIXA</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {r.recommendations.map((rec, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#c4391a", fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{i + 1}.</span>
                  <span style={{ fontSize: 13, color: "#444", lineHeight: 1.55 }}>{rec}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* 10. CAL.COM CTA */}
      <div style={W}>
        <Card style={{ background: "#F8F7F4" }}>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 17, fontWeight: 400, marginBottom: 6 }}>Behöver du hjälp att bli agent-redo?</div>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.55, marginBottom: 14 }}>
            Boka ett gratis 15-min samtal. Vi går igenom dina resultat och ger konkreta nästa steg.
          </p>
          <a href={calcomUrl} target="_blank" rel="noopener noreferrer" className="rp-btn"
            style={{ display: "inline-block", fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, color: "#fff", background: "#c4391a", padding: "10px 22px", borderRadius: 8, textDecoration: "none" }}>
            Boka samtal →
          </a>
        </Card>
      </div>

      {/* 11. AGENT SUGGESTIONS */}
      <div style={W}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: "#c4391a", letterSpacing: 3, marginBottom: 6 }}>AGENTER FÖR DIN BRANSCH</div>
        <p style={{ fontSize: 13, color: "#666", marginBottom: 14 }}>Baserat på vad vi ser på {domain}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {agentSuggestions.map((agent, i) => (
            <Card key={i}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{agent.name}</div>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5, marginBottom: 6 }}>{agent.description}</div>
              <div style={{ fontSize: 12, color: "#706F6C", fontStyle: "italic", marginBottom: 10 }}>{agent.relevance}</div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#706F6C" }}>Snart på agent.opensverige.se →</span>
            </Card>
          ))}
        </div>
      </div>

      {/* 12. MARKETPLACE UPSELL */}
      <div style={{ ...W, marginBottom: 20 }}>
        <Card style={{ background: "#F8F7F4" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: "#c4391a", letterSpacing: 3, marginBottom: 8 }}>AGENT-KATALOGEN — KOMMER SNART</div>
          <p style={{ fontSize: 13, color: "#555", lineHeight: 1.55, marginBottom: 14 }}>
            Sveriges första öppna katalog för AI-agenter byggda för svenska affärssystem.
          </p>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {MARKETPLACE_SYSTEMS.map(sys => (
              <div key={sys.name} style={{ background: "#FDFCF9", border: "1.5px solid #EDECE8", borderRadius: 10, padding: "10px 14px", textAlign: "center", minWidth: 90 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{sys.name}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#706F6C" }}>{sys.planned} planerade</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a href="https://discord.gg/CSphbTk8En" target="_blank" rel="noopener noreferrer" className="rp-btn"
              style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, color: "#fff", background: "#111", padding: "10px 18px", borderRadius: 8, textDecoration: "none", display: "inline-block" }}>
              Jag vill bygga →
            </a>
            <a href={calcomUrl} target="_blank" rel="noopener noreferrer" className="rp-btn"
              style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, color: "#c4391a", background: "#FDFCF9", border: "1.5px solid #c4391a22", padding: "10px 18px", borderRadius: 8, textDecoration: "none", display: "inline-block" }}>
              Jag behöver en agent →
            </a>
          </div>
        </Card>
      </div>

      {/* 13. SHARE + DISCORD + DEEP SCAN */}
      <div style={W}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button type="button" onClick={handleShare} className="rp-btn"
            style={{ flex: 1, fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 600, color: "#fff", background: "#111", border: "none", borderRadius: 8, padding: "11px", cursor: "pointer", minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {shared ? "Kopierat ✓" : "Dela resultat →"}
          </button>
          <a href="https://discord.gg/CSphbTk8En" className="rp-btn"
            style={{ flex: 1, fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 600, color: "#fff", background: "#c4391a", borderRadius: 8, padding: "11px", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 44 }}>
            Gå med i Discord →
          </a>
        </div>
        <Card>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 15, fontWeight: 400, marginBottom: 6 }}>Vill du ha en djupare analys?</div>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.55, marginBottom: 14 }}>Vi bygger en fullständig scanner med compliance-granskning och API-audit.</p>
          <button type="button" onClick={handleDeepScan} disabled={deepSent} className="rp-btn"
            style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, color: deepSent ? "#16a34a" : "#fff", background: deepSent ? "#f0fdf4" : "#111", border: deepSent ? "1.5px solid #bbf7d0" : "none", borderRadius: 8, padding: "10px 20px", cursor: deepSent ? "default" : "pointer", minHeight: 44, transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            {deepSent ? "✓ Tack! Vi hör av oss." : "Ja, jag vill ha det →"}
          </button>
        </Card>
      </div>

      {/* 14. DISCLAIMER + SCAN ANOTHER */}
      <div style={W}>
        <p style={{ fontSize: 11, color: "#706F6C", lineHeight: 1.65, marginBottom: 16 }}>
          ⚖ Det här är en teknisk observation, inte juridisk rådgivning. Compliance-resultaten är generella och baseras inte på en granskning av era specifika policies. Kontakta en jurist för en fullständig compliance-bedömning.
        </p>
        <a href="/scan" className="rp-btn"
          style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 500, color: "#666", background: "#FDFCF9", border: "1.5px solid #EDECE8", borderRadius: 8, padding: "10px 16px", cursor: "pointer", minHeight: 44, display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
          ← Scanna en till
        </a>
      </div>
    </div>
  );
}
