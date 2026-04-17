import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import { MiroFishCard } from './MiroFishCard';
import { MIROFISH_PREDICTIONS } from './mirofish-data';
import styles from './lab.module.css';

export const metadata: Metadata = {
  title: 'Lab — OpenSverige',
  description:
    'Vad svenska AI-builders faktiskt bygger. Scanners, MCP-servrar, agenter — i öppen kod, utan agenda. Grassroots AI från opensverige-communityn.',
  openGraph: {
    title: 'opensverige lab.',
    description:
      'Vad svenska AI-builders faktiskt bygger. Scanners, MCP-servrar, agenter — i öppen kod, utan agenda.',
    images: [{ url: '/opensverige.lab.og-image.png', width: 1200, height: 630 }],
  },
};

function daysUntil(isoDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(isoDate);
  return Math.max(0, Math.round((target.getTime() - now.getTime()) / 86_400_000));
}

export default function LabPage() {
  return (
    <>
      <Nav />

      <main id="main-content">
        {/* Hero */}
        <section className={styles.labHero}>
          <div className={styles.labHeroMedia} aria-hidden="true">
            <video autoPlay loop muted playsInline poster="/opsv-lab_header.png">
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

          {/* Prediktioner */}
          <section className={styles.mfSection} aria-label="Prediktioner">
            <p className={styles.mfSectionLabel}>prediktioner · aktiva case</p>
            {MIROFISH_PREDICTIONS.map((p) => (
              <MiroFishCard
                key={p.id}
                prediction={p}
                daysRemaining={daysUntil(p.resolvesAt)}
              />
            ))}
          </section>

          {/* Empty state — upcoming projects */}
          <div className={styles.emptyState}>
            <div className={styles.emptyCallout}>
              <p className={styles.emptyCalloutLabel}>opensverige · lab</p>
              <h2 className={styles.emptyCalloutH2}>
                Fler projekt är på väg.
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
              <a href="https://github.com/opensverige" target="_blank" rel="noopener noreferrer">GitHub →</a>
              <a href="https://discord.gg/CSphbTk8En" target="_blank" rel="noopener noreferrer">Discord →</a>
              <a href="/">opensverige.se →</a>
            </nav>
          </footer>
        </div>
      </main>
    </>
  );
}
