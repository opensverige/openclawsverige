import Link from "next/link";
import Image from "next/image";
import { SiteNav } from "@/components/landing/site-nav";

const DISCORD_URL = "https://discord.gg/CSphbTk8En";
const FACEBOOK_URL = "https://www.facebook.com/groups/2097332881024571/";
const LINKEDIN_URL = "https://www.linkedin.com/groups/9544657/";
const RADAR_URL = "/radar";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <div className="page">
        <div className="site-mockup">
          {/* 1. NAV — hamburger + Discord */}
          <SiteNav />

          {/* 2. HERO — no stats-bar */}
          <div className="site-hero">
            <div className="site-hero-text">
              <h2>Bygg AI-agenter.<br />Tillsammans.</h2>
              <div className="site-tagline">Öppet för alla. Ägt av ingen.</div>
              <div className="site-sub">Discord + IRL i hela Sverige.</div>
              <div className="site-hero-cta">
                <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Gå med i Discord →</a>
                <Link href="/manifest" className="btn btn-ghost">Läs manifestet ↓</Link>
              </div>
            </div>
            <div className="site-hero-image">
              <div className="site-hero-glow" />
              <Image src="/assets/1200x_hand.png" alt="Kräfthanden" width={1200} height={630} style={{ position: "relative", zIndex: 2 }} />
            </div>
          </div>

          {/* 3. HOOK — statement; last line = punch in Playfair + gold (brandguide typography) */}
          <div className="hook-statement hero-to-hook section">
            <p className="hook-line">Fika, fokus och show & tell. Ingen scen, ingen pitch — bara byggtid tillsammans.</p>
            <p className="hook-punch">Folk som sitter ner och bygger saker.</p>
          </div>

          {/* 4. Två ben — grid-2 only; label från brandguide */}
          <div className="site-sections section">
            <div className="label">så funkar det</div>
            <h2>Två ben</h2>
            <div className="grid-2" style={{ marginTop: 0 }}>
              <div className="card" style={{ textAlign: "center" }}>
                <div className="card-icon" style={{ color: "var(--success)" }}>🟢</div>
                <div className="card-title">Discord — alltid på</div>
                <div className="card-desc">Dela vad du bygger, ställ frågor, hitta folk. Dyk in när du behöver, försvinn när du bygger.</div>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <div className="card-icon" style={{ color: "var(--warning)" }}>🟠</div>
                <div className="card-title">IRL-sessioner</div>
                <div className="card-desc">Fika, bygg, show & tell. 2,5 timmar. Inga föreläsningar. Bara byggtid.</div>
              </div>
            </div>
          </div>

          {/* 5. MITT-CTA — social proof; t-mono.stats enligt brandguide */}
          <div className="mitt-cta">
            <p className="mitt-cta-line t-mono stats">+100 Svenska Builders</p>
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Gå med i Discord →</a>
          </div>

          {/* 6. Varför opensverige? — label + gold accent på nyckelord */}
          <div className="site-sections section">
            <div className="label">varför oss</div>
            <h2>Varför opensverige?</h2>
            <div className="grid-2" style={{ marginTop: 0 }}>
              <div className="card" style={{ textAlign: "center" }}>
                <div className="card-title"><span className="text-gold">Agenter</span>, inte chatbots</div>
                <div className="card-desc">Vi bygger saker som gör saker. Autonoma workflows, MCP-servrar, multi-agent-system.</div>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <div className="card-title">På <span className="text-gold">svenska</span>, i din tidszon</div>
                <div className="card-desc">Fortnox, Bankgirot, Skatteverket. Svensk data, svenska API:er.</div>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <div className="card-title">Online + <span className="text-gold">IRL</span></div>
                <div className="card-desc">Discord dagligen. Byggsessioner runt om i Sverige.</div>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <div className="card-title"><span className="text-gold">Verktygsagnostiskt</span></div>
                <div className="card-desc">OpenClaw, CrewAI, AutoGen, LangGraph, MCP. Använd vad du vill.</div>
              </div>
            </div>
          </div>

          {/* 7. Vad bygger folk? — grid-3 mini-kort; label */}
          <div className="site-sections section">
            <div className="label">i praktiken</div>
            <h2>Vad bygger folk?</h2>
            <div className="grid-3" style={{ marginTop: 0 }}>
              <div className="mini-card">
                <div className="mini-card-icon">⚡</div>
                Autonoma agenter som löser verkliga problem
              </div>
              <div className="mini-card">
                <div className="mini-card-icon">🔗</div>
                MCP-servrar kopplade till svenska tjänster
              </div>
              <div className="mini-card">
                <div className="mini-card-icon">🤖</div>
                Multi-agent-system där agenter samarbetar
              </div>
              <div className="mini-card">
                <div className="mini-card-icon">📊</div>
                Automatiserade flöden för bokföring
              </div>
              <div className="mini-card">
                <div className="mini-card-icon">🔒</div>
                Lokala LLM-installationer för integritet
              </div>
              <div className="mini-card">
                <div className="mini-card-icon">🧪</div>
                Vibecodade prototyper till produktionsystem
              </div>
            </div>
            <p className="section section-radar-cta">
              Osäker på vilket ramverk som passar? <Link href={RADAR_URL} className="section-radar-link">Agent Radar</Link> jämför mognad, risk och stabilitet — live från GitHub.
            </p>
          </div>

          {/* 8. IRL-format — timeline; t-heading + gold för subhead (brandguide) */}
          <div className="site-sections section">
            <div className="label">format</div>
            <h2>IRL-sessioner</h2>
            <p className="t-heading" style={{ color: "var(--gold)", marginBottom: "var(--sp-6)" }}>Fika. Bygg. Visa.</p>
            <div className="timeline-row">
              <span className="step-card">Fika 15min</span>
              <span className="timeline-arrow">→</span>
              <span className="step-card">Bygg 50min</span>
              <span className="timeline-arrow">→</span>
              <span className="step-card">Paus 10min</span>
              <span className="timeline-arrow">→</span>
              <span className="step-card">Bygg 50min</span>
              <span className="timeline-arrow">→</span>
              <span className="step-card">Demo 20min</span>
            </div>
            <p className="section" style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)" }}>2,5 timmar. Halvfärdigt är standard. Trasigt är välkommet.</p>
            <div className="placeholder-16x9" style={{ marginTop: "var(--sp-8)" }}>[IRL-foto kommer]</div>
          </div>

          {/* 9. Vem passar det för? — checklist; callout.tip enligt brandguide */}
          <div className="site-sections section">
            <div className="label">för dig</div>
            <h2>Vem passar det för?</h2>
            <ul className="checklist">
              <li>Bygger eller vill bygga AI-agenter</li>
              <li>Experimenterar med MCP, multi-agent, lokala LLMs</li>
              <li>Frilansare eller soloprenör som vill automatisera</li>
              <li>Letar efter svenska AI-builders att bygga med</li>
            </ul>
            <div className="callout callout-umber" style={{ marginTop: "var(--sp-6)", marginBottom: 0 }}>
              <span className="callout-icon">💡</span>
              <span><strong>Du behöver inte vara expert.</strong> Bara nyfiken.</span>
            </div>
          </div>

          {/* 10. Starta en nod — centered; label */}
          <div className="site-sections section">
            <div className="label" style={{ textAlign: "center" }}>i din stad</div>
            <div className="starta-nod-block">
              <h2>Kör opensverige i din stad.</h2>
              <p className="section">En plats. Ett datum. Tre personer. Du behöver inte fråga om lov.</p>
              <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="btn btn-nordic">Läs guiden i Discord →</a>
            </div>
          </div>

          {/* 11. FAQ — label */}
          <div className="site-sections section">
            <div className="label">faq</div>
            <h2>Vanliga frågor</h2>
            <div className="faq-list">
              <details>
                <summary>Vad är opensverige?</summary>
                <div className="faq-answer">En öppen community för folk som bygger AI-agenter i Sverige. Vi delar kod, ses IRL, och hjälper varandra.</div>
              </details>
              <details>
                <summary>Vem kan gå med?</summary>
                <div className="faq-answer">Alla. Nybörjare till experter. Hobby till jobb. Inga krav, inga avgifter.</div>
              </details>
              <details>
                <summary>Varför ett svenskt community?</summary>
                <div className="faq-answer">Svenska integrationer (Fortnox, Bankgirot), svensk tidszon, IRL-träffar du faktiskt kan gå på.</div>
              </details>
              <details>
                <summary>Kostar det något?</summary>
                <div className="faq-answer">Nej. Gratis. Öppen källkod. Ägt av ingen.</div>
              </details>
              <details>
                <summary>Hur startar jag en lokal nod?</summary>
                <div className="faq-answer">Hitta en plats, sätt ett datum, posta i Discord. Tre personer räcker. Du behöver inte fråga om lov.</div>
              </details>
              <details>
                <summary>Vilka verktyg stödjer ni?</summary>
                <div className="faq-answer">Alla. OpenClaw, CrewAI, AutoGen, LangGraph, MCP, egna lösningar. Verktygsagnostiskt.</div>
              </details>
            </div>
          </div>

          {/* 12. AVSLUT-CTA — umber; gold accent på nyckelord (brandguide) */}
          <div className="avslut-cta section">
            <h2><span className="text-gold">Builders</span>, inte talkers.</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", marginBottom: "var(--sp-6)" }}>En halvfärdig prototyp säger mer än en perfekt pitch deck.</p>
            <div className="site-hero-cta">
              <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Discord →</a>
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">Facebook</a>
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">LinkedIn</a>
            </div>
          </div>

          {/* 13. FOOTER */}
          <div className="site-footer-bar">
            © {new Date().getFullYear()} opensverige. Öppet för alla. Ägt av ingen. Byggt av oss.
          </div>
        </div>
      </div>
    </main>
  );
}
