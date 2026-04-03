import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { StatusBadge } from '@/components/status-badge'

export const metadata: Metadata = {
  title: 'Varför | opensverige',
  description:
    'Grundaren om varför opensverige finns — och vad som händer härnäst.',
}

type Status = 'live' | 'wip' | 'oss'

const PROJECTS: {
  glyph: string
  glyphColor: string
  name: string
  status: Status
  body: string
}[] = [
  {
    glyph: '◎',
    glyphColor: 'var(--gold-light)',
    name: 'FAVER',
    status: 'live',
    body: 'Hitta matrabatter i realtid. GPS + skanning.',
  },
  {
    glyph: '▸',
    glyphColor: 'var(--success)',
    name: 'fortnox-skill',
    status: 'oss',
    body: 'OpenClaw-skill för Fortnox. Fakturor via chatt.',
  },
  {
    glyph: '◆',
    glyphColor: 'var(--crayfish-light)',
    name: 'KAMMAREN',
    status: 'live',
    body: 'Sovereign AI för svenska AB-ägare. 3:12, lön, utdelning.',
  },
  {
    glyph: '◆',
    glyphColor: 'var(--gold)',
    name: 'LunarAIstorm',
    status: 'live',
    body: 'Socialt nätverk för AI-agenter. Inspirerat av LunarStorm.',
  },
  {
    glyph: '⊙',
    glyphColor: 'var(--text-muted)',
    name: 'Gollum-testet',
    status: 'live',
    body: 'Är du builder eller hoardar du? 90 sekunder.',
  },
]

export default function VarforPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <div className="varfor-page">

          <div className="varfor-profile">
            {/* Drop /public/baltsar.jpg to replace this circle */}
            <div className="varfor-avatar" aria-label="Bild på Baltsar">
              B
            </div>
            <p className="varfor-name">Baltsar</p>
            <p className="varfor-role">Grundare, opensverige.</p>
          </div>

          <blockquote className="varfor-quote">
            "Jag startade det här för att jag var trött på att bygga ensam.
            Det blev en verkstad."
          </blockquote>

          <div className="varfor-body">
            <p>
              Jag heter Baltsar. Creative technologist. Digital designer från
              början, numera djupt nere i AI-agenter, vibecoding och allt som{' '}
              <span className="varfor-hl">gör mellanhänder nervösa.</span>
            </p>
            <p>
              Jag bygger Kammaren — en AI-assistent för svenska småföretagare.
              Öppen kod, inga svarta lådor, dina siffror på din maskin. Det
              projektet lärde mig en sak:{' '}
              <span className="varfor-hl">att bygga ensam suger.</span>
            </p>
            <p>
              Inte för att det är svårt. Utan för att ingen sa till mig att
              min arkitektur var skit. AI:n sa "bra jobbat!" varje gång. Jag
              satt i en{' '}
              <span className="varfor-hl-gold">dopaminloop</span> i tre månader
              och{' '}
              <span className="varfor-hl">shippade ingenting.</span>
            </p>
            <p className="varfor-punch">
              Jag visste att fler satt i samma fälla. Och det stämde.
            </p>

            <hr className="varfor-section-break" />
            <p className="varfor-section-title">
              Sverige har konferenser. Vi har en verkstad.
            </p>

            <p>
              Mellanhänderna tar 15 000 kr för att förklara det du kan bygga
              själv på en kväll.{' '}
              <span className="varfor-hl">Vi bygger det de säljer. Fast gratis. Fast öppet.</span>
            </p>
            <p>Vi satt i våra kammare. Alla satt i sina kammare.</p>
            <ul className="varfor-fragments">
              <li>Prompta.</li>
              <li>Få beröm.</li>
              <li>Prompta igen.</li>
              <li>Shippa aldrig.</li>
              <li>Tro att idén är guld.</li>
              <li>Vakta den som Gollum.</li>
            </ul>
            <p>
              Ingen snor din idé.{' '}
              <span className="varfor-hl">
                De bygger sin egen med tre prompts medan du sover.
              </span>
            </p>
            <p>
              opensverige är 250 builders som slutade vänta. Nybörjare,
              veteraner, designers, systemare, folk utan titel som bara löser
              problem. Inga möten. Inga stakeholders. Ett GitHub-repo och en
              Discord.
            </p>
            <p>
              <span className="varfor-hl">Vi är i survival mode.</span> Vi har
              inget kontor. Ingen styrelse. Inget att förlora. Det gör oss
              snabbare än varje konsultbolag i det här landet.
            </p>
            <p>
              Varje mellanhand som tar betalt för att stå mellan dig och dina
              siffror, mellan dig och ditt system, mellan dig och din egen kod
              —{' '}
              <span className="varfor-hl">vi bygger bort dem.</span>
            </p>

            <hr className="varfor-section-break" />

            <div className="varfor-qa">
              <p>
                <span className="varfor-qa-q">Nyfiken?</span> Välkommen.
              </p>
              <p>
                <span className="varfor-qa-q">Vill du tjäna pengar?</span> Lös
                ett problem och ta betalt. Ingen stoppar dig.
              </p>
              <p>
                <span className="varfor-qa-q">Vill du lurka?</span> Också okej.
                Men vågen rör sig med eller utan dig.
              </p>
            </div>
            <p>
              Jag vet inte vart det här landar. Ingen vet. Men{' '}
              <span className="varfor-hl-gold">250 personer bygger varje dag</span>{' '}
              och det stoppas inte av ett möte.
            </p>
            <p>Halvfärdigt är standard. Trasigt är välkommet.</p>
            <p className="varfor-finale">What's the fucking output?</p>
          </div>

          <div className="varfor-projects">
            <p className="varfor-projects-label">
              <span className="n">◎</span> Vad vi har byggt
            </p>
            <div className="varfor-projects-grid project-cards--compact">
              {PROJECTS.map((project) => (
                <div key={project.name} className="card card-project">
                  <div className="card-project-head">
                    <div>
                      <div className="card-project-glyph">
                        <span style={{ color: project.glyphColor }}>
                          {project.glyph}
                        </span>
                      </div>
                      <div className="card-project-title">{project.name}</div>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="card-project-body">{project.body}</div>
                </div>
              ))}
            </div>
            <Link href="/showcase" className="varfor-projects-more">
              Se alla projekt <span className="aw">→</span>
            </Link>
          </div>

          <div className="varfor-community">
            <p className="varfor-projects-label">
              <span className="n">◎</span> Communityn
            </p>
            <div className="varfor-community-stats">
              <div className="varfor-stat">
                <span className="varfor-stat-val">250+</span>
                <span className="varfor-stat-label">builders</span>
              </div>
              <div className="varfor-stat">
                <span className="varfor-stat-val">3</span>
                <span className="varfor-stat-label">städer</span>
              </div>
              <div className="varfor-stat">
                <span className="varfor-stat-val">1</span>
                <span className="varfor-stat-label">Discord</span>
              </div>
            </div>
            <p className="varfor-community-body">
              Nybörjare, veteraner, designers, systemare — folk utan titel som
              löser problem. Inga möten. Inga stakeholders. Ett GitHub-repo
              och en Discord. Stockholm · Göteborg · Malmö.
            </p>
            <p className="varfor-community-body">
              Vi träffas fysiskt. Vi delar kod. Vi skickar pull requests på
              varandras projekt klockan 23. Det finns inget annat community
              i Sverige som gör det här.
            </p>
          </div>

          <div className="varfor-cta">
            <h2 className="varfor-cta-heading">Sluta lurka. Börja bygga.</h2>
            <div className="varfor-cta-btns">
              <a
                href="https://discord.gg/CSphbTk8En"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Gå med i Discord <span className="aw">→</span>
              </a>
              <Link href="/showcase" className="btn btn-secondary">
                Se showcase <span className="aw">→</span>
              </Link>
              <Link href="/gollum" className="btn btn-ghost">
                Ta Gollum-testet <span className="aw">→</span>
              </Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
