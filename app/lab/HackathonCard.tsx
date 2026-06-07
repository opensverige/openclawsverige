import styles from './lab.module.css';

// Teaser-kort på /lab som länkar till den pixel-stilade /hackathon-sidan.
// Lever i lab:s mörka stil men med pixel-accent (scanlines + mono-etiketter).
export function HackathonCard() {
  return (
    <a className={styles.hackCard} href="/hackathon">
      <div className={styles.hackCardMedia} aria-hidden="true" />
      <div className={styles.hackCardBody}>
        <div className={styles.hackCardTop}>
          <span className={styles.hackCardPill}>
            <span className={styles.hackDot} aria-hidden="true" />
            event · pågående
          </span>
          <span className={styles.hackCardDates}>9–15 juni</span>
        </div>
        <h3 className={styles.hackCardTitle}>Spel-Hackathon</h3>
        <p className={styles.hackCardDesc}>
          Skapa ett litet spel på en vecka. Community + jury bedömer —
          öppen kod väger extra. Egen pixel-värld.
        </p>
        <span className={styles.hackCardCta}>Öppna hackathon-sidan →</span>
      </div>
    </a>
  );
}
