'use client';

import { useState } from 'react';
import type { MiroFishPrediction } from './mirofish-data';
import styles from './lab.module.css';

interface MiroFishCardProps {
  prediction: MiroFishPrediction;
  daysRemaining: number;
}

const CONFIDENCE_CLASS: Record<MiroFishPrediction['confidence'], string> = {
  hög: styles.mfCardHög,
  medel: styles.mfCardMedel,
  låg: styles.mfCardLåg,
};

const STATUS_LABEL: Record<MiroFishPrediction['status'], string> = {
  pågående: 'PÅGÅENDE',
  verifierad: 'VERIFIERAD',
  fel: 'AVVEK',
};

export function MiroFishCard({ prediction, daysRemaining }: MiroFishCardProps) {
  const [open, setOpen] = useState(false);

  const published = new Date(prediction.publishedAt).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const resolvesDate = new Date(prediction.resolvesAt).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a')) return;
    setOpen((o) => !o);
  };

  return (
    <article
      className={`${styles.mfCard} ${CONFIDENCE_CLASS[prediction.confidence]} ${open ? styles.mfCardOpen : ''}`}
      onClick={handleCardClick}
    >
      {/* Header: always visible */}
      <div className={styles.mfCardTop}>
        <div className={styles.mfCardTopLeft}>
          <div className={styles.mfCardTitle}>MIRO-FISH</div>
          <div className={styles.mfCardSubtitle}>Multi-agent prediktion</div>
        </div>
        <div className={styles.mfCardTopRight}>
          <span
            className={`${styles.mfStatusPill} ${
              prediction.status === 'verifierad'
                ? styles.mfStatusVerified
                : prediction.status === 'fel'
                ? styles.mfStatusFel
                : ''
            }`}
          >
            {STATUS_LABEL[prediction.status]}
          </span>
          <button
            className={`${styles.mfToggle} ${open ? styles.mfToggleOpen : ''}`}
            aria-label={open ? 'Stäng detaljer' : 'Expandera detaljer'}
            onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
          >
            +
          </button>
        </div>
      </div>

      {/* Body: always visible */}
      <div className={styles.mfCardBody}>
        <p className={styles.mfHeadline}>{prediction.headline}</p>
        <div
          className={styles.mfBigNumber}
          aria-label={`Prediktion: ${prediction.prediction}`}
        >
          {prediction.prediction}
        </div>
        <div className={styles.mfCardBodyFooter}>
          <div className={styles.mfTags}>
            <span className={styles.mfTag}>miro-fish</span>
            <span className={styles.mfTag}>politik</span>
            <span className={styles.mfTag}>riksdagsvalet 2026</span>
          </div>
          <div className={styles.mfCountdown}>
            <span className={styles.mfCountdownNum}>{daysRemaining}</span> d kvar
          </div>
        </div>
      </div>

      {/* Details: collapsible */}
      <div className={styles.mfCardDetails}>
        <div className={styles.mfCardDetailsInner}>
          <p className={styles.mfContext}>
            {prediction.subject} · {prediction.event}
          </p>
          <div className={styles.mfVerdict}>{prediction.verdict}</div>

          <div className={styles.mfMetaSection}>
            <div className={styles.mfMetaRow}>
              <span className={styles.mfMetaLabel}>publicerad</span>
              <span className={styles.mfMetaValue}>{published}</span>
            </div>
            <div className={styles.mfMetaRow}>
              <span className={styles.mfMetaLabel}>löses</span>
              <span className={styles.mfMetaValue}>{resolvesDate}</span>
            </div>
            <div className={styles.mfMetaRow}>
              <span className={styles.mfMetaLabel}>metod</span>
              <span className={styles.mfMetaValue}>{prediction.methodSummary}</span>
            </div>
            <div className={styles.mfMetaRow}>
              <span className={styles.mfMetaLabel}>kalibrering</span>
              <span className={styles.mfMetaValue}>
                Verian · Novus · Demoskop · SVT · Göteborgs-statsvetarna
              </span>
            </div>
          </div>

          <div className={styles.mfLinks}>
            <a
              href={prediction.reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mfLinkBtn}
            >
              Läs fullständig rapport →
            </a>
            <a
              href={prediction.methodUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.mfLinkBtn} ${styles.mfLinkBtnSecondary}`}
            >
              Se metod →
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
