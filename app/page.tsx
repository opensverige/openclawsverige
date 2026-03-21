import Link from 'next/link'
import { Nav } from '@/components/nav'
import { Hero } from '@/components/hero'
import { SectionLabel } from '@/components/section-label'
import { CardProject } from '@/components/card-project'
import { Accordion } from '@/components/accordion'
import { CtaSection } from '@/components/cta-section'
import { Footer } from '@/components/footer'
import { Glyph } from '@/components/glyph'
import { WhatWeBuildCard } from '@/components/what-we-build-card'
import { getDiscordData } from '@/lib/discord'
import { getShowcaseProjects } from '@/lib/mdx'

const WHAT_CARDS = [
  {
    title: 'Autonoma AI-agenter',
    lead:
      'opensverige fokuserar på proaktiva system som agerar självständigt — inte reaktiva chatbots.',
    detail:
      'Vi bygger multi-agent-workflows med CrewAI, LangGraph, AutoGen och Google ADK som planerar, beslutar och utför uppgifter utan konstant mänsklig styrning.',
  },
  {
    title: 'Svenska integrationer via MCP',
    lead:
      'Vi utvecklar öppna MCP-servrar som kopplar AI-agenter till svensk infrastruktur.',
    detail:
      'Model Context Protocol fungerar som ett standardiserat gränssnitt som ger agenter säker åtkomst till Fortnox, Bankgirot, Skatteverket och SCB.',
  },
  {
    title: 'OpenClaw, NemoClaw och hela stacken',
    lead:
      'OpenClaw är det snabbast växande open source-ramverket för lokala AI-agenter.',
    detail:
      'NemoClaw är Nvidias enterprise-version som lägger till OpenShell — en säkerhetsmiljö med sandboxing och policyhantering. Vi stödjer båda, plus OpenAI Agents SDK, Claude Agent SDK och Pydantic AI.',
  },
  {
    title: 'Vibecoding till produktion',
    lead:
      'Vibecoding innebär att bygga mjukvara genom att beskriva vad du vill i naturligt språk.',
    detail:
      'Vi använder app-generatorer som Lovable, Bolt och v0 för snabb prototyping, sedan AI-IDEs som Cursor och Windsurf för produktionskod, och CLI-agenter som Claude Code för komplexa refaktoreringar.',
  },
]

const TIMELINE = [
  { label: 'Fika', time: '15 min', glyph: 'timeline-fika' },
  { label: 'Bygg', time: '50 min', glyph: 'timeline-build' },
  { label: 'Paus', time: '10 min', glyph: 'timeline-pause' },
  { label: 'Bygg', time: '50 min', glyph: 'timeline-type' },
  { label: 'Demo', time: '20 min', glyph: 'timeline-demo' },
] as const

const FOR_LIST = [
  'Du vill vibecoda din första AI-agent och söker feedback',
  'Du bygger med OpenClaw, NemoClaw, CrewAI eller LangGraph',
  'Du konfigurerar MCP-servrar, multi-agent-system eller lokala LLMs',
  'Du är frilansare eller soloprenör som vill automatisera med AI',
  'Du vill gå från prototyp i Lovable till produktion med Cursor',
  'Du letar efter svenska AI-builders att samarbeta med',
]

const FAQ = [
  {
    q: 'Vad är opensverige?',
    a: 'opensverige är Sveriges största öppna community för utvecklare och entusiaster som bygger AI-agenter. Communityn delar kod via Discord, publicerar open source-projekt på GitHub, och arrangerar fysiska byggsessioner i Stockholm, Göteborg och Malmö. Medlemskap är gratis.',
  },
  {
    q: 'Kostar det något?',
    a: 'Nej. opensverige är helt gratis och drivs som ett ideellt open source-initiativ.',
  },
  {
    q: 'Måste jag kunna koda?',
    a: 'Nej. Vibecoding innebär att du beskriver vad du vill bygga i naturligt språk — AI-verktyg genererar koden. Communityn blandar erfarna systemarkitekter med nybörjare som lär sig tekniken tillsammans.',
  },
  {
    q: 'Vad är vibecoding?',
    a: 'Vibecoding är en utvecklingsmetod där mjukvara skapas genom att instruera AI-system i naturligt språk istället för att skriva traditionell kod. Termen myntades av Andrej Karpathy 2025. Utvecklaren agerar arkitekt och styr riktning och logik, medan verktyg som Cursor, Claude Code, Lovable eller Bolt genererar källkoden.',
  },
  {
    q: 'Vad är en AI-agent?',
    a: 'En AI-agent är ett mjukvaruprogram som agerar självständigt inom definierade ramar. Till skillnad från en chatbot som reagerar på direkt input kan en agent analysera data, planera flera steg, fatta beslut och använda externa verktyg för att utföra uppgifter utan kontinuerlig mänsklig styrning.',
  },
  {
    q: 'Vad är MCP?',
    a: 'Model Context Protocol (MCP) är en öppen standard för att säkert ansluta AI-agenter till externa datakällor och verktyg. Protokollet fungerar som ett universellt gränssnitt — en AI-agent med MCP kan läsa mail, hämta affärsdata från Fortnox, eller ställa frågor mot lokala databaser med bibehållen kontroll över datasäkerhet.',
  },
  {
    q: 'Vad är OpenClaw?',
    a: 'OpenClaw är ett open source-ramverk för AI-agenter som körs lokalt på användarens hårdvara. Ramverket passerade 100 000 GitHub-stjärnor 2025 och gör det möjligt att installera tusentals community-skapade skills, koppla AI-modeller till API:er och köra agenter dygnet runt via meddelandeappar.',
  },
  {
    q: 'Vad är NemoClaw?',
    a: 'NemoClaw är Nvidias enterprise-version av OpenClaw, lanserad på GTC i mars 2026. NemoClaw lägger till OpenShell — en säkerhetsmiljö som kör agenter i isolerade sandboxar med policyhantering för nätverk och data. Ramverket är open source och kräver inte Nvidia-hårdvara.',
  },
  {
    q: 'Varför ett svenskt community?',
    a: 'opensverige existerar för att AI-agenter som integrerar med svensk infrastruktur kräver lokal kunskap. Communityn bygger integrationer mot Fortnox, Bankgirots ISO-standarder, Skatteverket och SCB. Medlemmarna delar tidszon och kan delta i fysiska byggsessioner i Stockholm, Göteborg och Malmö.',
  },
  {
    q: 'Vilka ramverk stödjer ni?',
    a: 'opensverige är verktygsagnostiskt. Agent-ramverk: OpenClaw, NemoClaw, CrewAI, LangGraph, AutoGen, Google ADK, OpenAI Agents SDK, Claude Agent SDK, Pydantic AI, Semantic Kernel. Vibecoding-verktyg: Cursor, Windsurf, Claude Code, Lovable, Bolt, v0. Lokala modeller via Ollama.',
  },
  {
    q: 'Hur startar jag en lokal grupp?',
    a: 'Tre steg: hitta en plats, bestäm ett datum, publicera i Discord. Minst tre builders krävs. Ingen tillåtelse behövs.',
  },
]

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'opensverige',
  url: 'https://opensverige.se',
  sameAs: [
    'https://discord.gg/CSphbTk8En',
    'https://github.com/opensverige',
    'https://linkedin.com/company/opensverige',
    'https://www.facebook.com/opensverige',
  ],
  areaServed: 'SE',
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'opensverige',
  url: 'https://opensverige.se',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://opensverige.se/showcase?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

export default async function Home() {
  const [discord, projects] = await Promise.all([
    getDiscordData(),
    getShowcaseProjects(),
  ])

  const featured = projects.slice(0, 3)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Nav />

      <main>
        <Hero discord={discord} />

        <div className="divider">
          <div className="divider-line" />
        </div>

        {/* 01 — Så funkar det */}
        <section className="site-section">
          <SectionLabel num="01" text="så funkar det" />
          <h2 className="section-h2">Så funkar det</h2>
          <div className="how-cards">
            <div className="card">
              <div className="card-glyph">
                <Glyph variant="braille" style={{ color: 'var(--crayfish-light)' }} />
              </div>
              <div className="card-title">Discord — varje dag</div>
              <div className="card-body">
                Vår Discord-server samlar svenska AI-byggare för daglig
                problemlösning. Dela kod, felsök agenter, hitta folk att
                vibecoda med.
              </div>
            </div>
            <div className="card">
              <div className="card-glyph">
                <Glyph variant="moon" style={{ color: 'var(--gold)' }} />
              </div>
              <div className="card-title">IRL — Stockholm, Göteborg, Malmö</div>
              <div className="card-body">
                Vi kör kostnadsfria byggsessioner på 2,5 timmar. Inga
                föreläsningar. Ta med laptop, bygg på plats, visa vad du gjort.
              </div>
            </div>
          </div>
        </section>

        <div className="divider">
          <div className="divider-line" />
        </div>

        {/* 02 — Vad vi bygger */}
        <section className="site-section">
          <SectionLabel num="02" text="vad vi bygger" />
          <h2 className="section-h2">Vad vi bygger</h2>
          <div className="what-cards">
            {WHAT_CARDS.map((card) => (
              <WhatWeBuildCard
                key={card.title}
                title={card.title}
                body={`${card.lead} ${card.detail}`}
              />
            ))}
          </div>
        </section>

        <div className="divider">
          <div className="divider-line" />
        </div>

        {/* 03 — Byggt av communityt */}
        <section className="site-section">
          <SectionLabel num="03" text="byggt av communityt" />
          <h2 className="section-h2">Byggt av communityt</h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 15,
              maxWidth: 560,
              lineHeight: 1.6,
              marginBottom: 'var(--sp-8)',
            }}
          >
            Builders behöver problem. Småföretagare har dem bland annat. Se vad
            vi har byggt hittills.
          </p>
          <div className="project-cards project-cards--compact">
            {featured.map((p) => (
              <CardProject key={p.slug} project={p} />
            ))}
          </div>
          <div className="see-all">
            <Link href="/showcase">
              Se alla projekt <span className="aw">→</span>
            </Link>
          </div>
        </section>

        <div className="divider">
          <div className="divider-line" />
        </div>

        {/* 04 — Byggsessioner IRL */}
        <section className="site-section">
          <SectionLabel num="04" text="byggsessioner irl" />
          <h2 className="section-h2">Byggsessioner IRL</h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 15,
              maxWidth: 560,
              lineHeight: 1.6,
              marginBottom: 'var(--sp-8)',
            }}
          >
            opensverige arrangerar kostnadsfria byggsessioner i Stockholm,
            Göteborg och Malmö. Varje session är 2,5 timmar lång och designad
            för aktivt byggande — att komma med halvfärdiga projekt är standard.
          </p>
          <div className="timeline">
            {TIMELINE.map((step, i) => (
              <div key={i} className="timeline-step">
                <div className="timeline-dot">
                  <Glyph variant={step.glyph} />
                </div>
                <div className="timeline-label">{step.label}</div>
                <div className="timeline-time">{step.time}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="divider">
          <div className="divider-line" />
        </div>

        {/* 05 — Är det här för dig? */}
        <section className="site-section">
          <SectionLabel num="05" text="är det här för dig?" />
          <h2 className="section-h2">Är det här för dig?</h2>
          <div className="for-list">
            {FOR_LIST.map((text, i) => (
              <div key={i} className="for-item">
                <span className="for-arrow">→</span>
                <span className="for-text">{text}</span>
              </div>
            ))}
          </div>
          <p className="for-note">
            Formell programmeringsbakgrund krävs inte. Vibecoding låter dig
            bygga avancerade system genom att instruera AI i naturligt språk.
          </p>
        </section>

        {/* 06 — Starta i din stad */}
        <CtaSection
          heading="Starta i din stad"
          body="Att starta en lokal opensverige-grupp kräver tre saker: en plats, ett datum och tre builders. Ingen tillåtelse krävs."
        >
          <a
            href="https://discord.gg/CSphbTk8En"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Läs startguiden i Discord <span className="aw">→</span>
          </a>
        </CtaSection>

        <div className="divider">
          <div className="divider-line" />
        </div>

        {/* 07 — Frågor */}
        <section className="site-section">
          <SectionLabel num="07" text="frågor" />
          <h2 className="section-h2">Frågor</h2>
          <Accordion items={FAQ} />
        </section>

        {/* Bottom CTA */}
        <CtaSection
          heading={
            <>
              Sluta lurka.
              <br />
              <em>Börja bygga.</em>
            </>
          }
        >
          <a
            href="https://discord.gg/CSphbTk8En"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Discord <span className="aw">→</span>
          </a>
          <Link href="/showcase" className="btn btn-secondary">
            Showcase <span className="aw">→</span>
          </Link>
        </CtaSection>
      </main>

      <Footer />
    </>
  )
}
