import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import { ProjectCard } from './ProjectCard';
import { PROJECTS } from './projects';
import styles from './lab.module.css';

export const metadata: Metadata = {
  title: 'Lab — OpenSverige',
  description:
    'Öppna experiment från OpenSverige-communityn. Scanners, MCP-servrar, agenter. Byggs live, i öppen kod.',
  openGraph: {
    title: 'Lab',
    description:
      'Öppna experiment från OpenSverige-communityn. Scanners, MCP-servrar, agenter. Byggs live, i öppen kod.',
    images: [{ url: '/og-lab.png', width: 1200, height: 630 }],
  },
};

export default function LabPage() {
  const liveCount = PROJECTS.filter((p) => p.status === 'live').length;
  const wipCount = PROJECTS.filter((p) => p.status === 'wip').length;

  return (
    <>
      <Nav />

      <main id="main-content">
        {/* Hero */}
        <section className={styles.labHero}>
          <div className={styles.labHeroMedia} aria-hidden="true">
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="/opsv-lab_header.png"
            >
              <source src="/opsv-lab_headervideo.webm" type="video/webm" />
            </video>
          </div>

          <div className={styles.labHeroGrid} aria-hidden="true" />
          <div className={styles.labHeroGlow} aria-hidden="true" />

          <div className={styles.labHeroContent}>
            <p className={styles.labLabel}>opensverige · lab</p>

            <h1 className={styles.labH1}>
              Byggt i öppen kod.
              <br />
              <em>Av communityt.</em>
            </h1>

            <p className={styles.labLede}>
              Experiment, verktyg och agenter skapade av opensverige-builders.
              Ingen VC-funding. Ingen roadmap. Bara folk som skeppar.
            </p>

            <div className={styles.labHeroMeta}>
              <span>{liveCount} live</span>
              <span className={styles.labHeroMetaSep}>·</span>
              <span>{wipCount} under arbete</span>
              <span className={styles.labHeroMetaSep}>·</span>
              <span>{PROJECTS.length} projekt totalt</span>
            </div>
          </div>
        </section>

        {/* Main content */}
        <div className={styles.labMain}>
          {/* Legend */}
          <div className={styles.legend} aria-label="Statusförklaring">
            <div className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendDotLive}`} aria-hidden="true" />
              live — i produktion
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendDotWip}`} aria-hidden="true" />
              wip — under aktiv utveckling
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendDotIdea}`} aria-hidden="true" />
              idé — konceptstadiet
            </div>
          </div>

          {/* Grid */}
          <div className={styles.grid}>
            {PROJECTS.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>

          {/* Contribute callout */}
          <div className={styles.contribute}>
            <div className={styles.contributeText}>
              <p className={styles.contributeLabel}>bidra</p>
              <h2 className={styles.contributeH2}>Har du byggt något? Lägg till det.</h2>
              <p className={styles.contributePara}>
                Allt på den här sidan är community-bidrag. Inga krav på polering —
                ett fungerande repo och en kort beskrivning räcker. Öppna ett issue
                på GitHub eller pinga i #lab på Discord.
              </p>
            </div>
            <a
              href="https://github.com/opensverige"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contributeLink}
            >
              GitHub →
            </a>
          </div>

          {/* Footer */}
          <footer className={styles.labFooter}>
            <span className={styles.labFooterLeft}>
              opensverige/lab · {new Date().getFullYear()}
            </span>
            <nav className={styles.labFooterRight} aria-label="Lab-footer">
              <a href="https://github.com/opensverige" target="_blank" rel="noopener noreferrer">
                GitHub →
              </a>
              <a href="https://discord.gg/CSphbTk8En" target="_blank" rel="noopener noreferrer">
                Discord →
              </a>
              <a href="/">opensverige.se →</a>
            </nav>
          </footer>
        </div>
      </main>
    </>
  );
}
