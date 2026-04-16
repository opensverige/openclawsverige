import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import styles from './lab.module.css';

export const metadata: Metadata = {
  title: 'Lab — OpenSverige',
  description:
    'Vad svenska AI-builders faktiskt bygger. Scanners, MCP-servrar, agenter — i öppen kod, utan agenda. Grassroots AI från opensverige-communityn.',
  openGraph: {
    title: 'opensverige lab.',
    description:
      'Vad svenska AI-builders faktiskt bygger. Scanners, MCP-servrar, agenter — i öppen kod, utan agenda.',
    images: [{ url: '/og-image-opsv.jpg', width: 1200, height: 630 }],
  },
};

export default function LabPage() {
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
              opensverige <em>lab.</em>
              <br />
              <span className={styles.labH1Sub}>Bygg med oss.</span>
            </h1>

            <p className={styles.labLede}>
              Öppna experiment. Verktyg och agenter byggda av communityt,
              för communityt. I öppen kod, utan agenda.
            </p>
          </div>
        </section>

        {/* Main content */}
        <div className={styles.labMain}>
          {/* Empty state */}
          <div className={styles.emptyState}>
            <div className={styles.emptyGrid}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={styles.emptyCard} aria-hidden="true">
                  <span className={styles.emptyPlus}>+</span>
                </div>
              ))}
            </div>

            <div className={styles.emptyCallout}>
              <p className={styles.emptyCalloutLabel}>opensverige · lab</p>
              <h2 className={styles.emptyCalloutH2}>
                Första projekten är på väg.
              </h2>
              <p className={styles.emptyCalloutPara}>
                Lab är där opensverige-builders postar vad de faktiskt skeppar —
                scanners, MCP-servrar, agenter. Inga krav på polering.
                Ett fungerande repo och en ärlig beskrivning räcker.
              </p>
              <div className={styles.emptyCalloutActions}>
                <a
                  href="https://discord.gg/CSphbTk8En"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.emptyCalloutBtn} ${styles.emptyCalloutBtnPrimary}`}
                >
                  Gå med i Discord <span>→</span>
                </a>
                <a
                  href="https://github.com/opensverige"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.emptyCalloutBtn} ${styles.emptyCalloutBtnSecondary}`}
                >
                  GitHub →
                </a>
              </div>
            </div>
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
