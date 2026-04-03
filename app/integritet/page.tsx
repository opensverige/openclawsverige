import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Integritetspolicy | opensverige',
  description:
    'Vi samlar in så lite data som möjligt. Vi säljer ingenting. Vi trackar inte dig som person.',
}

export default function IntegritetPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <div className="blog-post">
          <Link href="/" className="blog-back">
            ← startsidan
          </Link>

          <header className="blog-post-header">
            <h1 className="blog-post-title">Integritetspolicy</h1>
            <div className="blog-post-meta">
              <div className="blog-post-meta-line">
                <time dateTime="2026-03-25">2026-03-25</time>
                <span className="blog-post-meta-dot" aria-hidden>
                  ·
                </span>
                <span>Baltsar (Gustaf Garnow)</span>
                <span className="blog-post-meta-dot" aria-hidden>
                  ·
                </span>
                <a
                  href="mailto:opensverige@gmail.com"
                  style={{
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                  }}
                >
                  opensverige@gmail.com
                </a>
              </div>
            </div>
          </header>

          <article className="blog-body">

            <div className="integritet-callout">
              <p>
                Vi samlar in så lite data som möjligt. Vi säljer ingenting. Vi
                trackar inte dig som person. Om du vill att vi tar bort något
                — säg till.
              </p>
            </div>

            <h2>Vad opensverige.se samlar in</h2>

            <h3>Webbplats (opensverige.se)</h3>

            <p>
              <strong>Vercel Analytics</strong> — anonymiserad
              besöksstatistik. Inga cookies. Ingen personidentifiering. Vi ser
              sidvisningar och ungefärligt land, inte vem du är.
            </p>
            <p>
              <strong>Inga tredjepartscookies.</strong> Vi använder inte
              Google Analytics, Facebook Pixel, eller liknande
              spårningsverktyg.
            </p>
            <p>
              <strong>Email</strong> — om du skickar email till oss sparar vi
              meddelandet och din emailadress för att kunna svara. Vi delar
              den inte med någon.
            </p>

            <h3>Gollum-testet (opensverige.se/gollum)</h3>

            <p>
              Testet körs helt i din webbläsare.{' '}
              <strong>Inga svar sparas på någon server.</strong> Vi samlar
              inte in dina resultat. Om du delar ditt resultat på sociala
              medier är det ditt val.
            </p>

            <h3>Discord-servern</h3>

            <p>
              Discord-servern drivs på Discords plattform och lyder under{' '}
              <a
                href="https://discord.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Discords integritetspolicy
              </a>
              . Vi kontrollerar inte vilken data Discord samlar in.
            </p>
            <p>
              <strong>Arcane (XP-bot)</strong> trackar aktivitet för
              rollsystemet. Detta hanteras av Arcane och lyder under deras
              villkor.
            </p>
            <p>
              <strong>Moderering</strong> — vi läser publika meddelanden för
              att upprätthålla serverreglerna. Vi loggar inte konversationer
              systematiskt.
            </p>

            <h3>GitHub (github.com/opensverige)</h3>

            <p>
              Om du bidrar med kod via pull requests eller issues blir ditt
              GitHub-användarnamn publikt synligt. Det är standard för öppen
              källkod. Vi kontrollerar inte GitHubs datainsamling.
            </p>

            <h3>Meetup.com</h3>

            <p>
              Om du anmäler dig till events via Meetup.com lyder det under{' '}
              <a
                href="https://www.meetup.com/privacy/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Meetups integritetspolicy
              </a>
              . Vi ser ditt Meetup-namn och om du anmält dig. Inget mer.
            </p>

            <h2>Vad vi inte gör</h2>

            <ul>
              <li>Vi säljer aldrig din data till någon.</li>
              <li>Vi delar aldrig din information med annonsörer.</li>
              <li>
                Vi kontaktar aldrig din arbetsgivare baserat på information
                du delat i communityn.
              </li>
              <li>
                Vi använder inte din data för att träna AI-modeller.
              </li>
            </ul>

            <h2>Cookies</h2>

            <p>
              opensverige.se använder <strong>inga cookies</strong> utöver de
              som krävs för grundläggande funktionalitet. Inga
              tredjepartscookies. Ingen cookie-banner behövs.
            </p>

            <h2>Laglig grund</h2>

            <p>
              Vi behandlar personuppgifter baserat på{' '}
              <strong>berättigat intresse</strong> (GDPR artikel 6.1f) för
              att driva communityn och förbättra upplevelsen. För
              email-kommunikation baseras behandlingen på{' '}
              <strong>samtycke</strong> (du kontaktade oss).
            </p>
            <p>
              Vi fattar inga automatiserade beslut som har rättslig eller
              liknande effekt på dig (GDPR artikel 22). Ingen profilering
              används för att fatta sådana beslut.
            </p>

            <h2>Dina rättigheter (GDPR)</h2>

            <p>Du har rätt att:</p>
            <ul>
              <li>Begära tillgång till din data</li>
              <li>Begära rättelse av felaktig data</li>
              <li>Begära radering av din data</li>
              <li>Invända mot behandling</li>
              <li>
                Lämna klagomål till Integritetsskyddsmyndigheten (IMY)
              </li>
            </ul>

            <p>
              Kontakta{' '}
              <a href="mailto:opensverige@gmail.com">
                opensverige@gmail.com
              </a>{' '}
              för alla förfrågningar.
            </p>

            <h2>Ändringar</h2>

            <p>
              Vi uppdaterar denna policy vid behov. Senaste versionen finns
              alltid på opensverige.se/integritet.
            </p>

          </article>
        </div>
      </main>
      <Footer />
    </>
  )
}
